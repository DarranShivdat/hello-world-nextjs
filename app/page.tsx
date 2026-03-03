import { createClient } from "@/lib/supabase/server";
import ImageUpload from "./image-upload";
import { redirect } from "next/navigation";
import SignOutButton from "./sign-out-button";
import CaptionCard from "./caption-card";

export default async function Home() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: captions } = await supabase
        .from("captions")
        .select("id, content, like_count, created_datetime_utc, image_id")
        .eq("is_public", true)
        .not("content", "is", null)
        .neq("content", "")
        .order("created_datetime_utc", { ascending: false })
        .limit(50);

    const { data: userVotes } = await supabase
        .from("caption_votes")
        .select("caption_id, vote_value")
        .eq("profile_id", user.id);

    const votesMap: Record<string, number> = {};
    userVotes?.forEach((v) => {
        votesMap[v.caption_id] = v.vote_value;
    });

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        :root {
          --bg-primary: #0a0a0f;
          --bg-secondary: #12121a;
          --bg-card: #16161f;
          --bg-card-hover: #1c1c28;
          --border: #2a2a3a;
          --border-glow: #6366f1;
          --text-primary: #f0f0f5;
          --text-secondary: #8888a0;
          --text-muted: #555570;
          --accent: #6366f1;
          --accent-light: #818cf8;
          --accent-glow: rgba(99, 102, 241, 0.15);
          --success: #22c55e;
          --success-glow: rgba(34, 197, 94, 0.15);
          --danger: #ef4444;
          --danger-glow: rgba(239, 68, 68, 0.15);
          --gradient-1: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7);
          --gradient-2: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
        }

        .app-container {
          max-width: 880px;
          margin: 0 auto;
          padding: 0 1.5rem 4rem;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          background: rgba(10, 10, 15, 0.8);
          border-bottom: 1px solid var(--border);
          padding: 1rem 1.5rem;
          margin: 0 -1.5rem 2rem;
        }

        .header-inner {
          max-width: 880px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-family: 'Space Mono', monospace;
          font-size: 1.4rem;
          font-weight: 700;
          background: var(--gradient-1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .logo-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-family: 'Space Mono', monospace;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-email {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-family: 'Space Mono', monospace;
          padding: 0.4rem 0.8rem;
          background: var(--bg-card);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .section-title {
          font-size: 0.75rem;
          font-family: 'Space Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: var(--text-muted);
          margin-bottom: 1rem;
          padding-left: 2px;
        }

        .upload-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
        }

        .upload-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--gradient-1);
        }

        .upload-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
        }

        .feed-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .caption-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.25rem 1.5rem;
          transition: all 0.2s ease;
        }

        .caption-card:hover {
          background: var(--bg-card-hover);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }

        .caption-text {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-weight: 400;
        }

        .caption-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .vote-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: transparent;
          color: var(--text-secondary);
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vote-btn:hover:not(:disabled) {
          background: var(--accent-glow);
          border-color: var(--accent);
          color: var(--accent-light);
        }

        .vote-btn.upvoted {
          background: var(--success-glow);
          border-color: var(--success);
          color: var(--success);
        }

        .vote-btn.downvoted {
          background: var(--danger-glow);
          border-color: var(--danger);
          color: var(--danger);
        }

        .vote-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .vote-status {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-left: 0.5rem;
          font-family: 'Space Mono', monospace;
        }

        .file-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.25rem;
          background: var(--bg-secondary);
          border: 1px dashed var(--border);
          border-radius: 10px;
          color: var(--text-secondary);
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 1rem;
        }

        .file-btn:hover {
          border-color: var(--accent);
          background: var(--accent-glow);
          color: var(--accent-light);
        }

        .file-btn.has-file {
          border-style: solid;
          border-color: var(--accent);
          color: var(--text-primary);
          background: var(--accent-glow);
        }

        .preview-container {
          margin-bottom: 1.25rem;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border);
          display: inline-block;
        }

        .preview-img {
          display: block;
          max-width: 320px;
          max-height: 320px;
          object-fit: cover;
        }

        .generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--gradient-1);
          border: none;
          border-radius: 10px;
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .generate-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .generate-btn:disabled {
          opacity: 0.5;
          cursor: default;
          transform: none;
        }

        .generated-list {
          margin-top: 1.5rem;
        }

        .generated-label {
          font-size: 0.75rem;
          font-family: 'Space Mono', monospace;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--accent-light);
          margin-bottom: 0.75rem;
        }

        .generated-item {
          padding: 0.85rem 1.1rem;
          margin-bottom: 0.5rem;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 10px;
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.5;
        }

        .error-msg {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: var(--danger-glow);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 0.85rem;
        }

        .signout-btn {
          padding: 0.45rem 1rem;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .signout-btn:hover {
          border-color: var(--danger);
          color: var(--danger);
          background: var(--danger-glow);
        }

        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
        }

        .login-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 3rem;
          text-align: center;
          max-width: 400px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-1);
        }

        .login-title {
          font-family: 'Space Mono', monospace;
          font-size: 1.8rem;
          font-weight: 700;
          background: var(--gradient-1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: var(--text-muted);
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .google-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 2rem;
          background: white;
          border: none;
          border-radius: 10px;
          color: #1a1a2e;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        @media (max-width: 640px) {
          .header-inner { flex-direction: column; gap: 0.75rem; }
          .user-info { width: 100%; justify-content: center; }
          .upload-section { padding: 1.5rem; }
          .preview-img { max-width: 100%; }
        }
      `}</style>

            <div className="header">
                <div className="header-inner">
                    <div>
                        <div className="logo">CRACKD</div>
                        <div className="logo-subtitle">Caption Generator</div>
                    </div>
                    <div className="user-info">
                        <span className="user-email">{user.email}</span>
                        <SignOutButton />
                    </div>
                </div>
            </div>

            <main className="app-container">
                <div className="upload-section">
                    <div className="upload-title">Generate Captions</div>
                    <ImageUpload />
                </div>

                <div className="section-title">Recent Captions</div>
                <div className="feed-grid">
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
                        <div className="empty-state">No captions yet. Upload an image to get started.</div>
                    )}
                </div>
            </main>
        </>
    );
}