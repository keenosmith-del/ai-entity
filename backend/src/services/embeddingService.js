import { pipeline } from "@huggingface/transformers";

const MODEL =
    "onnx-community/all-MiniLM-L6-v2-ONNX";

let extractor = null;

const getExtractor = async () => {

    if (!extractor) {

        console.log(
            "Loading embedding model..."
        );

        extractor = await pipeline(
            "feature-extraction",
            MODEL
        );

        console.log(
            "Embedding model loaded."
        );

    }

    return extractor;

};


export const generateEmbedding = async (
    text
) => {

    const model =
        await getExtractor();

    const output =
        await model(
            text,
            {
                pooling: "mean",
                normalize: true,
            }
        );

    return Array.from(
        output.data
    );

};


export const generateEmbeddings = async (
    texts
) => {

    const model =
        await getExtractor();

    const output =
        await model(
            texts,
            {
                pooling: "mean",
                normalize: true,
            }
        );

    return output.tolist();

};

export const embedChunks = async (chunks) => {

    if (!chunks || chunks.length === 0) {
        return [];
    }

    const texts = chunks.map(
        (chunk) => chunk.content
    );

    const embeddings =
        await generateEmbeddings(texts);

    return chunks.map(
        (chunk, index) => ({
            ...chunk,
            embedding: embeddings[index],
        })
    );

};