import express from "express";

import {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

router.get("/", getConversations);

router.get("/:id", getConversation);

router.post("/", createConversation);

router.put("/:id", updateConversation);

router.delete("/:id", deleteConversation);

export default router;