import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const personalitySchema = new mongoose.Schema(
  {
    tone: {
      type: String,
      default: "Balanced",
    },

    responseStyle: {
      type: String,
      default: "Concise",
    },

    formality: {
      type: String,
      default: "Neutral",
    },

    creativity: {
      type: String,
      default: "Balanced",
    },

    customInstructions: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const memorySchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },

    memories: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const contextSchema = new mongoose.Schema(
  {
    includeConversation: {
      type: Boolean,
      default: true,
    },

    includePersonality: {
      type: Boolean,
      default: true,
    },

    includeMemory: {
      type: Boolean,
      default: true,
    },

    includeKnowledge: {
      type: Boolean,
      default: true,
    },

    maxMessages: {
      type: Number,
      default: 20,
    },
  },
  {
    _id: false,
  }
);

const modelSettingsSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      default: "gpt-5.6",
    },

    temperature: {
      type: Number,
      default: 0.7,
    },

    maxTokens: {
      type: Number,
      default: 1024,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    personality: {
      type: personalitySchema,
      default: () => ({}),
    },

    memory: {
      type: memorySchema,
      default: () => ({}),
    },

    context: {
      type: contextSchema,
      default: () => ({}),
    },

    modelSettings: {
      type: modelSettingsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;