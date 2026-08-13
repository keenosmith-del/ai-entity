import Conversation from "../models/Conversation.js";

// GET /api/conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);

    res.status(500).json({
      message: "Failed to fetch conversations.",
    });
  }
};


// GET /api/conversations/:id
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.id
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Failed to fetch conversation:", error);

    res.status(500).json({
      message: "Failed to fetch conversation.",
    });
  }
};


// POST /api/conversations
export const createConversation = async (req, res) => {
  try {
    const conversation = await Conversation.create(
      req.body
    );

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Failed to create conversation:", error);

    res.status(500).json({
      message: "Failed to create conversation.",
    });
  }
};


// PUT /api/conversations/:id
export const updateConversation = async (req, res) => {
  try {
    const conversation =
      await Conversation.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Failed to update conversation:", error);

    res.status(500).json({
      message: "Failed to update conversation.",
    });
  }
};


// DELETE /api/conversations/:id
export const deleteConversation = async (req, res) => {
  try {
    const conversation =
      await Conversation.findByIdAndDelete(
        req.params.id
      );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found.",
      });
    }

    res.json({
      message: "Conversation deleted.",
    });
  } catch (error) {
    console.error("Failed to delete conversation:", error);

    res.status(500).json({
      message: "Failed to delete conversation.",
    });
  }
};