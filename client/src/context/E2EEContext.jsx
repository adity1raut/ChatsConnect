import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "../config/axiosInstance.js";
import { API_URL } from "../config/api.js";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import {
  E2EE_VERSION,
  decryptText,
  deriveConversationKey,
  encryptText,
  fingerprintOf,
  generateIdentityKeyPair,
  messageAad,
  toNonExtractable,
  unwrapPrivateKey,
  wrapPrivateKey,
} from "../features/e2ee/crypto";
import { loadDeviceKey, saveDeviceKey } from "../features/e2ee/keyStore";

const E2EEContext = createContext(null);
const API = `${API_URL}/keys`;

// Why a message couldn't be decrypted — shown in place of its text
export const UNDECRYPTABLE = {
  locked: "🔒 Encrypted message — unlock encryption to read it",
  none: "🔒 Encrypted message — set up encryption to read it",
  "old-key": "🔒 Encrypted for an earlier key and can't be read on this device",
  "unknown-peer-key": "🔒 Encrypted with a key that's no longer available",
  failed: "🔒 This message couldn't be decrypted",
};

class DecryptError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

// Server key + this device's stored key → the account's encryption state
async function loadKeyState(userId) {
  const [{ data }, device] = await Promise.all([
    axios.get(`${API}/me`),
    loadDeviceKey(userId),
  ]);
  if (!data.hasKey) return { status: "none" };
  if (device && device.fingerprint === data.fingerprint) return { status: "ready", ...device };
  return {
    status: "locked",
    fingerprint: data.fingerprint,
    publicJwk: data.publicKey,
    backup: data.backup,
  };
}

const knownKeysStorageKey = (userId) => `e2eeKnownKeys:${userId}`;
const readKnownKeys = (userId) => {
  try {
    return JSON.parse(localStorage.getItem(knownKeysStorageKey(userId)) || "{}");
  } catch {
    return {};
  }
};

/**
 * End-to-end encryption for direct messages.
 * status: "idle" | "loading" | "none" (never set up) | "locked" (set up,
 * not unlocked on this device) | "ready" | "error"
 */
export function E2EEProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const myId = user?._id;

  const [state, setState] = useState({ status: "idle" });
  // Peers whose key changed since we last saw it (possible impersonation)
  const [changedPeers, setChangedPeers] = useState(() => new Set());

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const peerKeys = useRef(new Map()); // userId → Promise<public key info>
  const conversationKeys = useRef(new Map()); // "peerId:peerFp:myFp" → Promise<CryptoKey>

  // ── Load this account's key state ────────────────────────────────
  const refresh = useCallback(
    () => (myId ? loadKeyState(myId).then(setState) : Promise.resolve()),
    [myId],
  );

  useEffect(() => {
    if (!myId) return;
    let cancelled = false;
    loadKeyState(myId)
      .then((next) => !cancelled && setState(next))
      .catch(() => !cancelled && setState({ status: "error" }));
    const peers = peerKeys.current;
    const conversations = conversationKeys.current;
    return () => {
      cancelled = true;
      setState({ status: "idle" });
      peers.clear();
      conversations.clear();
    };
  }, [myId, refresh]);

  // ── Peer keys (cached) + key-change detection ────────────────────
  const getPeerKeys = useCallback(
    (peerId) => {
      if (!peerKeys.current.has(peerId)) {
        const request = axios
          .get(`${API}/${peerId}`)
          .then(({ data }) => {
            if (data.hasKey && myId) {
              const known = readKnownKeys(myId);
              if (known[peerId] && known[peerId] !== data.fingerprint) {
                setChangedPeers((prev) => new Set(prev).add(peerId));
              } else if (!known[peerId]) {
                known[peerId] = data.fingerprint;
                localStorage.setItem(knownKeysStorageKey(myId), JSON.stringify(known));
              }
            }
            return data;
          })
          .catch((err) => {
            peerKeys.current.delete(peerId);
            throw err;
          });
        peerKeys.current.set(peerId, request);
      }
      return peerKeys.current.get(peerId);
    },
    [myId],
  );

  const acknowledgeKeyChange = useCallback(
    async (peerId) => {
      const data = await getPeerKeys(peerId);
      const known = readKnownKeys(myId);
      known[peerId] = data.fingerprint;
      localStorage.setItem(knownKeysStorageKey(myId), JSON.stringify(known));
      setChangedPeers((prev) => {
        const next = new Set(prev);
        next.delete(peerId);
        return next;
      });
    },
    [getPeerKeys, myId],
  );

  // Someone (maybe me on another device) published a new key
  useEffect(() => {
    if (!socket) return;
    const onKeysChanged = ({ userId }) => {
      peerKeys.current.delete(userId);
      for (const k of conversationKeys.current.keys()) {
        if (k.startsWith(`${userId}:`)) conversationKeys.current.delete(k);
      }
      if (userId === myId) refresh().catch(() => {});
    };
    socket.on("keysChanged", onKeysChanged);
    return () => socket.off("keysChanged", onKeysChanged);
  }, [socket, myId, refresh]);

  const conversationKey = useCallback(
    (peerId, peerJwk, peerFp) => {
      const { privateKey, fingerprint } = stateRef.current;
      const cacheKey = `${peerId}:${peerFp}:${fingerprint}`;
      if (!conversationKeys.current.has(cacheKey)) {
        conversationKeys.current.set(
          cacheKey,
          deriveConversationKey(privateKey, peerJwk, myId, peerId),
        );
      }
      return conversationKeys.current.get(cacheKey);
    },
    [myId],
  );

  // ── Setup / unlock / reset ────────────────────────────────────────
  const activate = useCallback(
    async (privateKey, publicJwk, fingerprint) => {
      const record = { privateKey, publicJwk, fingerprint };
      await saveDeviceKey(myId, record);
      conversationKeys.current.clear();
      setState({ status: "ready", ...record });
    },
    [myId],
  );

  const publishNewKey = useCallback(
    async (passphrase, password) => {
      const { privateKey, publicJwk } = await generateIdentityKeyPair();
      const fingerprint = await fingerprintOf(publicJwk);
      const backup = await wrapPrivateKey(privateKey, passphrase, fingerprint);
      await axios.put(`${API}/me`, { publicKey: publicJwk, backup, password });
      await activate(await toNonExtractable(privateKey), publicJwk, fingerprint);
    },
    [activate],
  );

  // First-time setup
  const setup = useCallback((passphrase) => publishNewKey(passphrase), [publishNewKey]);

  // Forgot the passphrase: new keys; messages encrypted to the old key become unreadable
  const resetKeys = useCallback(
    (passphrase, password) => publishNewKey(passphrase, password),
    [publishNewKey],
  );

  // New device: restore the key from the passphrase-protected backup
  const unlock = useCallback(
    async (passphrase) => {
      const { backup, fingerprint, publicJwk } = stateRef.current;
      const privateKey = await unwrapPrivateKey(backup, passphrase, fingerprint);
      await activate(privateKey, publicJwk, fingerprint);
    },
    [activate],
  );

  // Same key, new passphrase
  const changePassphrase = useCallback(
    async (currentPassphrase, newPassphrase, password) => {
      const { data } = await axios.get(`${API}/me`);
      const extractable = await unwrapPrivateKey(data.backup, currentPassphrase, data.fingerprint, {
        extractable: true,
      });
      const backup = await wrapPrivateKey(extractable, newPassphrase, data.fingerprint);
      await axios.put(`${API}/me`, { publicKey: data.publicKey, backup, password });
    },
    [],
  );

  // ── Messages ──────────────────────────────────────────────────────
  /** Encrypted envelope for a DM, or null when either side has no key. */
  const encryptFor = useCallback(
    async (peerId, text) => {
      const { status, fingerprint } = stateRef.current;
      if (status !== "ready") return null;
      const peer = await getPeerKeys(peerId);
      if (!peer.hasKey) return null;
      const key = await conversationKey(peerId, peer.publicKey, peer.fingerprint);
      const aad = messageAad({ senderId: myId, recipientId: peerId, sk: fingerprint, rk: peer.fingerprint });
      const { iv, ct } = await encryptText(key, text, aad);
      return { v: E2EE_VERSION, iv, ct, sk: fingerprint, rk: peer.fingerprint };
    },
    [getPeerKeys, conversationKey, myId],
  );

  /** Plain text of an encrypted DM with `peerId`; throws DecryptError(reason). */
  const decryptFrom = useCallback(
    async (raw, peerId) => {
      const { status, fingerprint } = stateRef.current;
      if (status !== "ready") throw new DecryptError(status === "none" ? "none" : "locked");
      const env = raw.e2ee;
      const senderId = raw.senderId?._id;
      if (!env || !senderId) throw new DecryptError("failed");

      const mine = senderId === myId;
      const myFp = mine ? env.sk : env.rk;
      const peerFp = mine ? env.rk : env.sk;
      if (myFp !== fingerprint) throw new DecryptError("old-key");

      const peer = await getPeerKeys(peerId);
      const peerJwk =
        peer.fingerprint === peerFp
          ? peer.publicKey
          : peer.history?.find((h) => h.fingerprint === peerFp)?.publicKey;
      if (!peerJwk) throw new DecryptError("unknown-peer-key");

      const key = await conversationKey(peerId, peerJwk, peerFp);
      const aad = messageAad({
        senderId,
        recipientId: mine ? peerId : myId,
        sk: env.sk,
        rk: env.rk,
      });
      try {
        return await decryptText(key, env, aad);
      } catch {
        throw new DecryptError("failed");
      }
    },
    [getPeerKeys, conversationKey, myId],
  );

  const value = useMemo(
    () => ({
      status: state.status,
      fingerprint: state.fingerprint,
      changedPeers,
      setup,
      unlock,
      resetKeys,
      changePassphrase,
      encryptFor,
      decryptFrom,
      getPeerKeys,
      acknowledgeKeyChange,
    }),
    [
      state.status,
      state.fingerprint,
      changedPeers,
      setup,
      unlock,
      resetKeys,
      changePassphrase,
      encryptFor,
      decryptFrom,
      getPeerKeys,
      acknowledgeKeyChange,
    ],
  );

  return <E2EEContext.Provider value={value}>{children}</E2EEContext.Provider>;
}

export function useE2EE() {
  const ctx = useContext(E2EEContext);
  if (!ctx) throw new Error("useE2EE must be used within E2EEProvider");
  return ctx;
}
