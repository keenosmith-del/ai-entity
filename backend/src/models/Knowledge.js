import mongoose from "mongoose";

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