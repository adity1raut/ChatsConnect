// This device's unlocked identity key, kept in IndexedDB. The private key is
// a non-extractable CryptoKey: pages can use it, but its bytes can't be read.
const DB_NAME = "chatsconnect-e2ee";
const STORE = "keys";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(mode, action) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request?.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

/** { privateKey, publicJwk, fingerprint } or null */
export async function loadDeviceKey(userId) {
  try {
    return (await run("readonly", (store) => store.get(String(userId)))) ?? null;
  } catch {
    return null; // IndexedDB unavailable (private mode) — the user can unlock each session
  }
}

export async function saveDeviceKey(userId, record) {
  try {
    await run("readwrite", (store) => store.put(record, String(userId)));
  } catch {
    // Unavailable storage: key stays in memory for this session only
  }
}

// On logout: nobody using this browser next can read your messages
export async function clearDeviceKeys() {
  try {
    await run("readwrite", (store) => store.clear());
  } catch {
    // nothing stored
  }
}
