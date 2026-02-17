import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "./sign-out-button";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: newsSnippets } = await supabase
        .from("news_snippets")
        .select("id, headline, category, source_url, priority, is_active, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h1 style={{ fontSize: "2rem" }}>News Snippets</h1>
                <div>
                    <span style={{ marginRight: "1rem" }}>{user.email}</span>
                    <SignOutButton />
                </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                    <th style={{ padding: "8px" }}>Headline</th>
                    <th style={{ padding: "8px" }}>Category</th>
                    <th style={{ padding: "8px" }}>Priority</th>
                    <th style={{ padding: "8px" }}>Active</th>
                </tr>
                </thead>
                <tbody>
                {newsSnippets?.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px" }}>
                            {item.source_url ? (
                                <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                                    {item.headline}
                                </a>
                            ) : (
                                item.headline
                            )}
                        </td>
                        <td style={{ padding: "8px" }}>{item.category}</td>
                        <td style={{ padding: "8px" }}>{item.priority}</td>
                        <td style={{ padding: "8px" }}>{item.is_active ? "✅" : "❌"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </main>
    );
}