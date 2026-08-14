import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
    {
        index: {
            type: Number,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        embedding: {
            type: [Number],
            default: [],
        },
    },
    {
        _id: false,
    }
);

const knowledgeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            default: "",
        },

        size: {
            type: Number,
            default: 0,
        },

        chunks: {
            type: [chunkSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Knowledge = mongoose.model(
    "Knowledge",
    knowledgeSchema
);

export default Knowledge;