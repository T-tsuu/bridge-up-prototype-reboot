// Just for local testing

require("dotenv").config();

const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});


app.get("/", (req, res) => {
    res.send("Bridge Up assistant server is running.");
});

app.post("/api/bridge-up-assistant", async (req, res) => {
    try {
        const { message, history = [] } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "Missing or invalid message" });
        }

        const safeHistory = Array.isArray(history)
            ? history
                .filter(
                    item =>
                        item &&
                        (item.role === "user" || item.role === "assistant") &&
                        typeof item.content === "string"
                )
                .slice(-10)
            : [];

        const systemPrompt =
            "You are the Bridge Up support assistant. Be concise, helpful, friendly, and product-aware. If you are uncertain, say so clearly. Never invent platform features. Prefer practical next steps. Encourage users to use the feedback form for bugs, UX issues, or ideas.";

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "http://localhost:5500",
                "X-Title": "Bridge Up Assistant Local"
            },
            body: JSON.stringify({
                model: "google/gemma-4-31b-it:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...safeHistory,
                    { role: "user", content: message }
                ]
            })
        });

        const data = await openRouterResponse.json();

        if (!openRouterResponse.ok) {
            console.error("OpenRouter error:", data);
            return res.status(openRouterResponse.status).json({
                error: "OpenRouter request failed",
                details: data
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content?.trim() ||
            "I’m sorry — I couldn’t generate a response just now.";

        return res.json({ reply });
    } catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

console.log("Has Key", !!process.env.OPENROUTER_API_KEY)

app.listen(PORT, () => {
    console.log(`Bridge Up assistant server running on http://localhost:${PORT}`);
});