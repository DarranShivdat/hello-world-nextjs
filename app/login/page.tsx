"use client";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const handleGoogleLogin = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <main style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Sign In</h1>
            <button
                onClick={handleGoogleLogin}
                style={{
                    padding: "12px 24px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    backgroundColor: "#4285F4",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                }}
            >
                Sign in with Google
            </button>
        </main>
    );
}