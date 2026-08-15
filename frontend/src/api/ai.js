const API_URL = `${import.meta.env.VITE_API_URL}/ai`;

export const sendAIRequest = async (
    messages,
    signal
) => {

    const response = await fetch(
        `${API_URL}/chat`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                messages,
            }),

            signal,
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get AI response.");
    }

    if (!response.body) {
        throw new Error("AI response stream is unavailable.");
    }

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let buffer = "";
    let fullResponse = "";

    while (true) {

        const { value, done } =
            await reader.read();

        if (done) {
            break;
        }

        buffer += decoder.decode(
            value,
            {
                stream: true,
            }
        );

        const events =
            buffer.split("\n\n");

        buffer =
            events.pop() || "";

        for (const event of events) {

            const line =
                event
                    .split("\n")
                    .find((line) =>
                        line.startsWith("data:")
                    );

            if (!line) {
                continue;
            }

            const data =
                line
                    .slice(5)
                    .trim();

            if (data === "[DONE]") {
                return fullResponse;
            }

            const parsed =
                JSON.parse(data);

            if (parsed.error) {
                throw new Error(parsed.error);
            }

            if (parsed.content) {
                fullResponse += parsed.content;
            }
        }
    }

    return fullResponse;
};