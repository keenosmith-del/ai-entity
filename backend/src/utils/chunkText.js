const chunkText = (
    text,
    chunkSize = 1000,
    overlap = 150
) => {

    if (!text || !text.trim()) {
        return [];
    }

    const cleanText = text
        .replace(/\s+/g, " ")
        .trim();

    const chunks = [];

    let start = 0;
    let index = 0;

    while (start < cleanText.length) {

        const end = Math.min(
            start + chunkSize,
            cleanText.length
        );

        const chunk = cleanText
            .slice(start, end)
            .trim();

        if (chunk) {
            chunks.push({
                index,
                content: chunk,
            });

            index++;
        }

        if (end >= cleanText.length) {
            break;
        }

        start = end - overlap;
    }

    return chunks;
};

export default chunkText;