import { useAuth } from "./Admin";

export default function AdminChallenge() {
  const { session, user, signOut } = useAuth();

  return (
    <div id="admin-challenge">
      <p>User ID: {user?.id}</p>
      <button onClick={signOut}>Sign out</button>
      {/* use session access token if needed: session?.access_token */}
    </div>
  );
}
