"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <button
            onClick={handleSignOut}
            style={{
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "4px",
            }}
        >
            Sign Out
        </button>
    );
}