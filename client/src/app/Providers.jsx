import { ThemeProvider } from "../context/ThemeContext";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { AIProvider } from "../context/AIContext";
import { CallProvider } from "../context/CallContext";
import { GroupCallProvider } from "../context/GroupCallContext";
import { FriendProvider } from "../context/FriendContext";
import { NotificationProvider } from "../context/NotificationContext";

// Outermost first: later providers may depend on earlier ones (e.g. Socket needs Auth)
const PROVIDERS = [
  ThemeProvider,
  AuthProvider,
  SocketProvider,
  AIProvider,
  CallProvider,
  GroupCallProvider,
  FriendProvider,
  NotificationProvider,
];

export default function Providers({ children }) {
  return PROVIDERS.reduceRight(
    (tree, Provider) => <Provider>{tree}</Provider>,
    children,
  );
}
