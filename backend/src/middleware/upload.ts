import multer from "multer";

/**
 * Keeps the upload in memory (max 10 MB) so its real type can be checked
 * from the file bytes before anything touches the disk. The media service
 * applies the per-type limits and the allow-list.
 */
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 5 },
}).single("file");
