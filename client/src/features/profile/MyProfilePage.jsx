import { useEffect, useState } from "react";
import { Settings, ShieldAlert, UserPen } from "lucide-react";
import axios from "../../config/axiosInstance.js";
import { API_URL } from "../../config/api.js";
import { useAuth } from "../../context/AuthContext";
import { useFriends } from "../../context/FriendContext";
import { useSocket } from "../../context/SocketContext";
import { Card, Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui";
import { toast } from "../../lib/toast";
import SettingsPanel from "../settings/SettingsPanel";
import DeleteAccountSection from "./DeleteAccountSection";
import EditProfileForm from "./EditProfileForm";
import ProfileHeader from "./ProfileHeader";
import { resizeImageToDataUrl } from "./image";

const TABS = [
  { value: "profile", label: "Edit profile", icon: UserPen },
  { value: "settings", label: "Settings", icon: Settings },
  { value: "account", label: "Account", icon: ShieldAlert },
];

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const { friends } = useFriends();
  const { onlineUsers, isConnected } = useSocket();
  const [tab, setTab] = useState("profile");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // The stored session user may predate newer profile fields — refresh it
  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_URL}/profile/me`)
      .then(({ data }) => {
        if (!cancelled) updateUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
    // Load once per visit; updateUser changes identity on every user update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const changeAvatar = async (file) => {
    setUploading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setAvatarPreview(dataUrl);
      const { data } = await axios.put(`${API_URL}/profile/update`, { avatar: dataUrl });
      updateUser(data.user);
      toast({ title: "Profile photo updated" });
    } catch (err) {
      toast({
        title: "Couldn't update your photo",
        description: err.response?.data?.message || err.message,
        variant: "error",
      });
    } finally {
      setAvatarPreview(null);
      setUploading(false);
    }
  };

  const online =
    user.privacy?.showActivity !== false && (isConnected || onlineUsers.has(user._id));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-8 sm:py-10">
      <ProfileHeader
        user={user}
        avatarSrc={avatarPreview}
        online={online}
        onAvatarChange={changeAvatar}
        avatarBusy={uploading}
        stats={[{ label: "Friends", value: friends.length }]}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Profile sections">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon aria-hidden="true" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="profile">
          {loaded ? (
            <EditProfileForm />
          ) : (
            <Card className="p-5 flex justify-center py-10">
              <Spinner label="Loading profile" />
            </Card>
          )}
        </TabsContent>
        <TabsContent value="settings">
          <Card className="p-5">
            <SettingsPanel />
          </Card>
        </TabsContent>
        <TabsContent value="account">
          <DeleteAccountSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
