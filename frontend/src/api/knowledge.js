const API_URL = "http://localhost:5050/api/knowledge";


export const getKnowledge = async () => {

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(
            "Failed to fetch knowledge documents."
        );
    }

    return response.json();
};


export const createKnowledge = async (
    name,
    content,
    type = "",
    size = 0
) => {

    const response = await fetch(
        API_URL,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                name,
                content,
                type,
                size,
            }),
        }
    );

    if (!response.ok) {
        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.message ||
            "Failed to create knowledge document."
        );
    }

    return response.json();
};


export const updateKnowledge = async (
    id,
    data
) => {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        }
    );

    if (!response.ok) {
        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.message ||
            "Failed to update knowledge document."
        );
    }

    return response.json();
};


export const deleteKnowledge = async (id) => {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.message ||
            "Failed to delete knowledge document."
        );
    }

    return response.json();
};


export const uploadKnowledge = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const error =
            await response.json().catch(() => ({}));

        throw new Error(
            error.message ||
            "Failed to upload knowledge document."
        );
    }

    return response.json();
};