import fs from "fs/promises";
import path from "path";

import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

import Knowledge from "../models/Knowledge.js";

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});

export const uploadKnowledge = [
    upload.single("file"),

    async (req, res) => {
        try {

            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded.",
                });
            }

            const file = req.file;

            const extension =
                path.extname(file.originalname)
                    .toLowerCase();

            let content = "";

            // TXT / Markdown
            if (
                extension === ".txt" ||
                extension === ".md"
            ) {

                content =
                    file.buffer.toString("utf-8");

            }

            // PDF
            else if (extension === ".pdf") {

                const parser = new PDFParse({
                    data: file.buffer,
                });

                const pdf =
                    await parser.getText();

                content = pdf.text;

                await parser.destroy();

            }

            // DOCX
            else if (extension === ".docx") {

                const result =
                    await mammoth.extractRawText({
                        buffer: file.buffer,
                    });

                content = result.value;

            }

            else {

                return res.status(400).json({
                    message:
                        "Unsupported file type. Please upload a TXT, Markdown, PDF, or DOCX file.",
                });

            }

            content = content.trim();

            if (!content) {
                return res.status(400).json({
                    message:
                        "The uploaded document does not contain readable text.",
                });
            }

            res.status(200).json({
                name: file.originalname,
                content,
                type: extension,
                size: file.size,
            });

        } catch (error) {

            console.error(
                "Failed to process knowledge document:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to process knowledge document.",
            });

        }
    },
];

export const getKnowledge = async (req, res) => {

  try {

    const documents =
      await Knowledge.find()
        .sort({ updatedAt: -1 });

    res.json(documents);

  } catch (error) {

    console.error(
      "Failed to fetch knowledge:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch knowledge documents.",
    });

  }

};


export const createKnowledge = async (req, res) => {

  try {

    const {
      name,
      content,
      type,
      size,
    } = req.body;

    if (!name || !content) {

      return res.status(400).json({
        message:
          "Name and content are required.",
      });

    }

    const document =
      await Knowledge.create({
        name,
        content,
        type: type || "",
        size: size || 0,
      });

    res.status(201).json(document);

  } catch (error) {

    console.error(
      "Failed to create knowledge document:",
      error
    );

    res.status(500).json({
      message:
        "Failed to create knowledge document.",
    });

  }

};


export const updateKnowledge = async (req, res) => {

  try {

    const document =
      await Knowledge.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!document) {

      return res.status(404).json({
        message:
          "Knowledge document not found.",
      });

    }

    res.json(document);

  } catch (error) {

    console.error(
      "Failed to update knowledge document:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update knowledge document.",
    });

  }

};


export const deleteKnowledge = async (req, res) => {

  try {

    const document =
      await Knowledge.findByIdAndDelete(
        req.params.id
      );

    if (!document) {

      return res.status(404).json({
        message:
          "Knowledge document not found.",
      });

    }

    res.json({
      message:
        "Knowledge document deleted.",
    });

  } catch (error) {

    console.error(
      "Failed to delete knowledge document:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete knowledge document.",
    });

  }

};