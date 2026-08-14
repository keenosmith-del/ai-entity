import Knowledge from "../models/Knowledge.js";

import {
    generateEmbedding,
} from "./embeddingService.js";

import cosineSimilarity from "../utils/cosineSimilarity.js";


export const searchKnowledge = async (
    query,
    limit = 5
) => {

    if (!query || !query.trim()) {
        return [];
    }

    const queryEmbedding =
        await generateEmbedding(
            query.trim()
        );

    const documents =
        await Knowledge.find({
            "chunks.embedding.0": {
                $exists: true,
            },
        }).lean();

    const results = [];

    for (const document of documents) {

        for (const chunk of document.chunks) {

            if (
                !chunk.embedding ||
                chunk.embedding.length === 0
            ) {
                continue;
            }

            const score =
                cosineSimilarity(
                    queryEmbedding,
                    chunk.embedding
                );

            results.push({
                documentId: document._id,
                name: document.name,
                chunkIndex: chunk.index,
                content: chunk.content,
                score,
            });

        }

    }

    results.sort(
        (a, b) => b.score - a.score
    );

    return results.slice(0, limit);

};