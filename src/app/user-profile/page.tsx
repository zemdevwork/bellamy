// // app/profile/page.tsx
// import UserProfile from "@/components/profile/User-profile";

// export default function ProfilePage() {
//   return (
//     <div className="container mx-auto py-8 px-4">
//       <UserProfile />
//     </div>
//   );
// }
// app/profile/page.tsx
import UserProfile from "@/components/profile/User-profile";
import UserSettings from "@/components/settings/Settings";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      {/* Profile Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <UserProfile />
      </section>

      {/* Settings Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <UserSettings />
      </section>
    </div>
  );
}
