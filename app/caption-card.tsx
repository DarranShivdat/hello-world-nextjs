"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Caption {
    id: string;
    content: string;
    like_count: number;
    created_datetime_utc: string;
    image_id: string;
}

export default function CaptionCard({
                                        caption,
                                        userId,
                                        existingVote,
                                    }: {
    caption: Caption;
    userId: string;
    existingVote: number | null;
}) {
    const [currentVote, setCurrentVote] = useState<number | null>(existingVote);
    const [loading, setLoading] = useState(false);

    const handleVote = async (voteValue: number) => {
        setLoading(true);
        const supabase = createClient();

        const { error } = await supabase.from("caption_votes").insert({
            vote_value: voteValue,
            profile_id: userId,
            caption_id: caption.id,
            created_datetime_utc: new Date().toISOString(),
        });

        if (!error) {
            setCurrentVote(voteValue);
        } else {
            alert("Error submitting vote: " + error.message);
        }

        setLoading(false);
    };

    return (
        <div
            style={{
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
            }}
        >
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                {caption.content}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                    onClick={() => handleVote(1)}
                    disabled={loading || currentVote !== null}
                    style={{
                        padding: "6px 16px",
                        cursor: currentVote !== null ? "default" : "pointer",
                        backgroundColor: currentVote === 1 ? "#22c55e" : "#444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        opacity: currentVote !== null && currentVote !== 1 ? 0.5 : 1,
                    }}
                >
                    👍 Upvote
                </button>
                <button
                    onClick={() => handleVote(-1)}
                    disabled={loading || currentVote !== null}
                    style={{
                        padding: "6px 16px",
                        cursor: currentVote !== null ? "default" : "pointer",
                        backgroundColor: currentVote === -1 ? "#ef4444" : "#444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        opacity: currentVote !== null && currentVote !== -1 ? 0.5 : 1,
                    }}
                >
                    👎 Downvote
                </button>
                {currentVote !== null && (
                    <span style={{ marginLeft: "0.5rem", color: "#888" }}>
            You voted: {currentVote === 1 ? "👍" : "👎"}
          </span>
                )}
            </div>
        </div>
    );
}