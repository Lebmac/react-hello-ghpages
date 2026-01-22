import { useEffect, useState, useMemo, useContext, createContext } from "react";
import { supabase } from "../supabaseClient";
import { Tabs, Tab } from "../components/Tabs";
import AdminChallenge from "./AdminChallenge";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthContext.Provider>");
  return context;
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
      setErr("");
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const auth = useMemo(() => {
    return {
      session,
      user: session?.user ?? null,
      err,
      setErr,
      signOut,
    };
  }, [session, err]);

  async function signIn(e) {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErr(error.message);
  }

  async function signOut(e) {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.auth.signOut();
    if (error) setErr(error.message);
  }

  if (!session) {
    return (
      <div id="login">
        <div className="card-login">
          <h2>Control Console</h2>
          <p>Login to manage posts.</p>

          <form onSubmit={signIn}>
            <label>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <button type="submit">Sign in</button>
          </form>
          {err && <p className="error">Error: {err}</p>}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <div id="admin">
        <p className="session-detail">Logged in as {session.user.email}, <a onClick={signOut}>Sign out</a></p>
        
        <div className="tabs">
          <Tabs defaultValue="overview">
            <Tab value="gallery" label="Gallery">

            </Tab>

            <Tab value="projects" label="Projects">
              <h2>Users</h2>
              <p>User management goes here.</p>
            </Tab>

            <Tab value="challenge" label="Code Challenge">
              <AdminChallenge />
            </Tab>

            <Tab value="tools" label="Engineering Tools">
              <h2>Settings</h2>
              <p>System settings.</p>
            </Tab>     

            <Tab value="about" label="About">
              <h2>Settings</h2>
              <p>System settings.</p>
            </Tab>   

            <Tab value="contact" label="Contact">
              <h2>Settings</h2>
              <p>System settings.</p>
            </Tab>
            
            <Tab value="admin" label="Admin">
              <h2>Settings</h2>
              <p>System settings.</p>
            </Tab>    
          </Tabs>
        </div>
      </div>
    </AuthContext.Provider>
  );
}
