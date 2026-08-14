import express from "express";

import {
    getKnowledge,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
    uploadKnowledge,
} from "../controllers/knowledgeController.js";

const router = express.Router();

router.get(
    "/",
    getKnowledge
);

router.post(
    "/",
    createKnowledge
);

router.put(
    "/:id",
    updateKnowledge
);

router.delete(
    "/:id",
    deleteKnowledge
);

router.post(
    "/upload",
    uploadKnowledge
);

export default router;