const API_URL = `${import.meta.env.VITE_API_URL}/conversations`;

const normalizeConversation = (conversation) => ({
  ...conversation,
  id: conversation._id,
});

export const getConversations = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch conversations.");
  }

  const conversations = await response.json();

  return conversations.map(normalizeConversation);
};

export const getConversation = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch conversation.");
  }

  const conversation = await response.json();

  return normalizeConversation(conversation);
};

export const createConversation = async (conversation) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conversation),
  });

  if (!response.ok) {
    throw new Error("Failed to create conversation.");
  }

  const createdConversation = await response.json();

  return normalizeConversation(createdConversation);
};

export const updateConversation = async (id, updates) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update conversation.");
  }

  const updatedConversation = await response.json();

  return normalizeConversation(updatedConversation);
};

export const deleteConversation = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete conversation.");
  }

  return response.json();
};