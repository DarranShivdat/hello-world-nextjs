import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "./sign-out-button";
import CaptionCard from "./caption-card";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: captions } = await supabase
        .from("captions")
        .select("id, content, like_count, created_datetime_utc, image_id")
        .eq("is_public", true)
        .order("created_datetime_utc", { ascending: false })
        .limit(50);

    // Get user's existing votes
    const { data: userVotes } = await supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .eq("profile_id", user.id);

    const votesMap: Record<string, number> = {};
    userVotes?.forEach((v) => {
        votesMap[v.caption_id] = v.vote_value;
    });

    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2rem" }}>Rate Captions</h1>
                <div>
                    <span style={{ marginRight: "1rem" }}>{user.email}</span>
                    <SignOutButton />
                </div>
            </div>
            {captions && captions.length > 0 ? (
                captions.map((caption) => (
                    <CaptionCard
                        key={caption.id}
                        caption={caption}
                        userId={user.id}
                        existingVote={votesMap[caption.id] ?? null}
                    />
                ))
            ) : (
                <p>No captions found.</p>
            )}
        </main>
    );
}