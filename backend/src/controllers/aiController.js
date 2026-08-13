import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const chat = async (req, res) => {
    try {

        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                message: "Messages are required.",
            });
        }

        const stream =
            await groq.chat.completions.create({
                model: "openai/gpt-oss-20b",
                messages,
                temperature: 0.7,
                stream: true,
            });

        res.setHeader(
            "Content-Type",
            "text/event-stream"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.flushHeaders();

        for await (const chunk of stream) {

            const content =
                chunk.choices[0]?.delta?.content;

            if (!content) {
                continue;
            }

            res.write(
                `data: ${JSON.stringify({
                    content,
                })}\n\n`
            );

        }

        res.write("data: [DONE]\n\n");

        res.end();

    } catch (error) {

        console.error(
            "AI streaming request failed:",
            error
        );

        if (!res.headersSent) {

            res.status(500).json({
                message: "AI request failed.",
            });

            return;
        }

        res.write(
            `data: ${JSON.stringify({
                error: "AI request failed.",
            })}\n\n`
        );

        res.end();

    }
};