import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Memory = mongoose.model(
    "Memory",
    memorySchema
);

export default Memory;