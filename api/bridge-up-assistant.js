export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

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

        const systemPrompt = `
You are the Bridge Up support assistant.

Your job:
- Help users understand and navigate the Bridge Up platform.
- Answer clearly, briefly, and accurately.
- Stay helpful, calm, and professional.
- If you are unsure, say so clearly instead of inventing information.
- Never claim a feature exists unless it is described below.

About Bridge Up:
Bridge Up is a platform designed to help fresh graduates and students gain real work experience earlier, because many employers expect experience that students often do not get during university.

Why this problem exists:
- Students often do not have enough time.
- Students often do not know where to look for experience opportunities.
- Many university programs are too theory-focused.

What Bridge Up does:
Bridge Up connects three groups:
1. Students
2. Employers
3. Universities or schools

Value for each group:
- Students get access to work opportunities that help them gain experience.
- Employers get access to motivated student talent and may shape them into future hires.
- Universities can follow student progress and use that information to better align programs with market needs.

Core platform structure:
- There are three account types: student, employer, and university.
- Students complete a starting profile/form.
- The platform includes a suggestion system that recommends job opportunities based on the student's profile and field of study.
- Jobs can award experience points (XP).
- Accumulating XP can unlock opportunities or rewards, such as discounts on valuable courses.
- The platform can issue certificates as proof of work experience.
- Students can receive reviews on their profiles.
- Reviews are visible to employers and schools, but not to other students.
- Contracts between students and employers are part of the platform as a security measure.

Assistant behavior rules:
- Explain features in simple language.
- When users ask how something works, answer using only the platform details above.
- If a user asks about something not defined here, say that the current prototype or available information does not confirm it.
- Do not invent pricing, admin workflows, notifications, payment systems, messaging behavior, or policy details unless the user explicitly provides them.
- If the user seems to need bug reporting, product suggestions, or account-specific help, encourage them to use the feedback form.
- Keep answers concise and practical.
        `.trim();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://your-vercel-domain.vercel.app",
                "X-Title": "Bridge Up Assistant"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...safeHistory,
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: "OpenRouter request failed",
                details: data
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content?.trim() ||
            "I’m sorry — I couldn’t generate a response just now.";

        return res.status(200).json({ reply });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}