import { randomUUID } from "node:crypto";
import { fileTypeFromBuffer } from "file-type";
import { imageSize } from "image-size";
import type { Media } from "@portfolio/shared";
import type { MediaAsset } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { badRequest, notFound } from "../utils/errors";
import { storage } from "./storage";

/**
 * Allow-list by real file type (read from the bytes, not the name or the
 * browser-supplied MIME). SVG is intentionally excluded: it can carry script.
 */
const ALLOWED: Record<string, { ext: string; kind: "IMAGE" | "DOCUMENT"; maxBytes: number }> = {
  "image/jpeg": { ext: "jpg", kind: "IMAGE", maxBytes: 5 * 1024 * 1024 },
  "image/png": { ext: "png", kind: "IMAGE", maxBytes: 5 * 1024 * 1024 },
  "image/webp": { ext: "webp", kind: "IMAGE", maxBytes: 5 * 1024 * 1024 },
  "image/avif": { ext: "avif", kind: "IMAGE", maxBytes: 5 * 1024 * 1024 },
  "application/pdf": { ext: "pdf", kind: "DOCUMENT", maxBytes: 10 * 1024 * 1024 },
};

export const mediaUrl = (storageKey: string) => `/${storageKey}`;

export function toMedia(asset: MediaAsset | null | undefined): Media | null {
  if (!asset) return null;
  return {
    id: asset.id,
    url: mediaUrl(asset.storageKey),
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
  };
}

export function toAdminMedia(asset: MediaAsset) {
  return {
    ...toMedia(asset)!,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    kind: asset.kind,
    createdAt: asset.createdAt.toISOString(),
  };
}

export async function saveUpload(file: { buffer: Buffer; originalname: string }, alt = "") {
  const detected = await fileTypeFromBuffer(file.buffer);
  const rule = detected ? ALLOWED[detected.mime] : undefined;
  if (!detected || !rule) {
    throw badRequest("Unsupported file type. Use JPG, PNG, WebP, AVIF or PDF.");
  }
  if (file.buffer.length > rule.maxBytes) {
    throw badRequest(`File too large. Max ${Math.round(rule.maxBytes / 1024 / 1024)} MB for this type.`);
  }

  let width: number | null = null;
  let height: number | null = null;
  if (rule.kind === "IMAGE") {
    try {
      const dims = imageSize(file.buffer);
      width = dims.width ?? null;
      height = dims.height ?? null;
    } catch {
      throw badRequest("The image could not be read. It may be corrupted.");
    }
  }

  const storageKey = `uploads/${randomUUID()}.${rule.ext}`;
  await storage.put(storageKey, file.buffer);

  return prisma.mediaAsset.create({
    data: {
      storageKey,
      originalName: file.originalname.slice(0, 200),
      mimeType: detected.mime,
      sizeBytes: file.buffer.length,
      width,
      height,
      alt: alt.slice(0, 200),
      kind: rule.kind,
    },
  });
}

export async function deleteMedia(id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) throw notFound("File");
  await prisma.mediaAsset.delete({ where: { id } });
  await storage.delete(asset.storageKey);
}
