import express from "express";

import {
    getMemories,
    getMemory,
    createMemory,
    updateMemory,
    deleteMemory,
} from "../controllers/memoryController.js";

const router = express.Router();

router.get("/", getMemories);

router.get("/:id", getMemory);

router.post("/", createMemory);

router.put("/:id", updateMemory);

router.delete("/:id", deleteMemory);

export default router;