import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const API_BASE = "https://api.almostcrackd.ai";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = session.access_token;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    try {
        // Step 1: Generate presigned URL
        const presignedRes = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ contentType: file.type }),
        });

        if (!presignedRes.ok) {
            const err = await presignedRes.text();
            return NextResponse.json({ error: `Presigned URL failed: ${err}` }, { status: 500 });
        }

        const { presignedUrl, cdnUrl } = await presignedRes.json();

        // Step 2: Upload image bytes
        const arrayBuffer = await file.arrayBuffer();
        const uploadRes = await fetch(presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: Buffer.from(arrayBuffer),
        });

        if (!uploadRes.ok) {
            return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
        }

        // Step 3: Register image URL
        const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
        });

        if (!registerRes.ok) {
            const err = await registerRes.text();
            return NextResponse.json({ error: `Register image failed: ${err}` }, { status: 500 });
        }

        const { imageId } = await registerRes.json();

        // Step 4: Generate captions
        const captionsRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageId }),
        });

        if (!captionsRes.ok) {
            const err = await captionsRes.text();
            return NextResponse.json({ error: `Caption generation failed: ${err}` }, { status: 500 });
        }

        const captions = await captionsRes.json();
        return NextResponse.json({ captions, cdnUrl });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}