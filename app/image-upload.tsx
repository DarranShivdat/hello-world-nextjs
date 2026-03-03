"use client";

import { useState, useRef } from "react";

export default function ImageUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [captions, setCaptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setCaptions([]);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setCaptions([]);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/captions", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                setCaptions(data.captions || []);
            }
        } catch (err: any) {
            setError(err.message);
        }

        setLoading(false);
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            <button
                className={`file-btn ${file ? "has-file" : ""}`}
                onClick={() => fileInputRef.current?.click()}
            >
                {file ? (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                        {file.name}
                    </>
                ) : (
                    <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        Choose an image...
                    </>
                )}
            </button>

            {preview && (
                <div className="preview-container">
                    <img src={preview} alt="Preview" className="preview-img" />
                </div>
            )}

            <div>
                <button
                    className="generate-btn"
                    onClick={handleSubmit}
                    disabled={!file || loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            Generate Captions
                        </>
                    )}
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {captions.length > 0 && (
                <div className="generated-list">
                    <div className="generated-label">Generated Captions</div>
                    {captions.map((caption: any, i: number) => (
                        <div key={caption.id || i} className="generated-item">
                            {caption.content || JSON.stringify(caption)}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}