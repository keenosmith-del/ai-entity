import Memory from "../models/Memory.js";


// GET /api/memories
export const getMemories = async (req, res) => {
    try {
        const memories = await Memory.find()
            .sort({ createdAt: -1 });

        res.json(memories);
    } catch (error) {
        console.error("Failed to fetch memories:", error);

        res.status(500).json({
            message: "Failed to fetch memories.",
        });
    }
};


// GET /api/memories/:id
export const getMemory = async (req, res) => {
    try {
        const memory = await Memory.findById(
            req.params.id
        );

        if (!memory) {
            return res.status(404).json({
                message: "Memory not found.",
            });
        }

        res.json(memory);
    } catch (error) {
        console.error("Failed to fetch memory:", error);

        res.status(500).json({
            message: "Failed to fetch memory.",
        });
    }
};


// POST /api/memories
export const createMemory = async (req, res) => {
    try {
        const memory = await Memory.create(
            req.body
        );

        res.status(201).json(memory);
    } catch (error) {
        console.error("Failed to create memory:", error);

        res.status(500).json({
            message: "Failed to create memory.",
        });
    }
};


// PUT /api/memories/:id
export const updateMemory = async (req, res) => {
    try {
        const memory =
            await Memory.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true,
                }
            );

        if (!memory) {
            return res.status(404).json({
                message: "Memory not found.",
            });
        }

        res.json(memory);
    } catch (error) {
        console.error("Failed to update memory:", error);

        res.status(500).json({
            message: "Failed to update memory.",
        });
    }
};


// DELETE /api/memories/:id
export const deleteMemory = async (req, res) => {
    try {
        const memory =
            await Memory.findByIdAndDelete(
                req.params.id
            );

        if (!memory) {
            return res.status(404).json({
                message: "Memory not found.",
            });
        }

        res.json({
            message: "Memory deleted.",
        });
    } catch (error) {
        console.error("Failed to delete memory:", error);

        res.status(500).json({
            message: "Memory deleted.",
        });
    }
};