"use client";

import { useState, useRef } from "react";

export default function ImageUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [captions, setCaptions] = useState<any[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
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
            setImageUrl(null);
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
                setImageUrl(data.cdnUrl || null);
            }
        } catch (err: any) {
            setError(err.message);
        }

        setLoading(false);
    };

    return (
        <div
            style={{
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "1.5rem",
                marginBottom: "2rem",
            }}
        >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                Upload Image & Generate Captions
            </h2>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                    padding: "10px 20px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    backgroundColor: "#333",
                    color: "white",
                    border: "1px solid #555",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                }}
            >
                {file ? `📎 ${file.name}` : "📁 Choose an image..."}
            </button>

            {preview && (
                <div style={{ marginBottom: "1rem" }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{ maxWidth: "300px", borderRadius: "8px" }}
                    />
                </div>
            )}

            <div>
                <button
                    onClick={handleSubmit}
                    disabled={!file || loading}
                    style={{
                        padding: "10px 20px",
                        fontSize: "1rem",
                        cursor: !file || loading ? "default" : "pointer",
                        backgroundColor: "#4285F4",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        opacity: !file || loading ? 0.6 : 1,
                    }}
                >
                    {loading ? "⏳ Generating captions..." : "🚀 Generate Captions"}
                </button>
            </div>

            {error && (
                <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>
            )}

            {captions.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                    <h3 style={{ marginBottom: "0.5rem" }}>Generated Captions:</h3>
                    {captions.map((caption: any, i: number) => (
                        <div
                            key={caption.id || i}
                            style={{
                                padding: "0.75rem",
                                marginBottom: "0.5rem",
                                backgroundColor: "#222",
                                borderRadius: "6px",
                            }}
                        >
                            {caption.content || JSON.stringify(caption)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}