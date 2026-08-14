const API_URL = "http://localhost:5050/api/memories";

export const getMemories = async () => {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch memories.");
    }

    return response.json();
};


export const getMemory = async (id) => {

    const response = await fetch(
        `${API_URL}/${id}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch memory.");
    }

    return response.json();
};


export const createMemory = async (content) => {

    const response = await fetch(
        API_URL,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                content,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to create memory.");
    }

    return response.json();
};


export const updateMemory = async (
    id,
    content
) => {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                content,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update memory.");
    }

    return response.json();
};


export const deleteMemory = async (id) => {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete memory.");
    }

    return response.json();
};