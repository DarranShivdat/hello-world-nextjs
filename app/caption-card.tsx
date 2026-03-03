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
        <div className="caption-card">
            <p className="caption-text">{caption.content}</p>
            <div className="caption-actions">
                <button
                    className={`vote-btn ${currentVote === 1 ? "upvoted" : ""}`}
                    onClick={() => handleVote(1)}
                    disabled={loading || currentVote !== null}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                    Upvote
                </button>
                <button
                    className={`vote-btn ${currentVote === -1 ? "downvoted" : ""}`}
                    onClick={() => handleVote(-1)}
                    disabled={loading || currentVote !== null}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></svg>
                    Downvote
                </button>
                {currentVote !== null && (
                    <span className="vote-status">
            {currentVote === 1 ? "✓ Upvoted" : "✓ Downvoted"}
          </span>
                )}
            </div>
        </div>
    );
}