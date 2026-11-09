import type { RequestHandler } from "express";
import {
  createItem,
  deleteItem,
  getItem,
  listItems,
  reorderItems,
  setItemStatus,
  updateItem,
  type ResourceName,
} from "../services/content.service";

/** `?publish=true` saves and publishes in one step ("Save & publish"). */
const wantsPublish = (q: unknown) => (q as Record<string, unknown>)?.publish === "true";
const idParam = (p: unknown) => String((p as Record<string, string>).id);

/** Builds the CRUD handlers for one content type. */
export function contentController(name: ResourceName) {
  const list: RequestHandler = async (_req, res) => {
    res.json(await listItems(name));
  };
  const show: RequestHandler = async (req, res) => {
    res.json(await getItem(name, idParam(req.params)));
  };
  const create: RequestHandler = async (req, res) => {
    res.status(201).json(await createItem(name, req.body, { userId: req.user?.id, publish: wantsPublish(req.query) }));
  };
  const update: RequestHandler = async (req, res) => {
    res.json(await updateItem(name, idParam(req.params), req.body, { userId: req.user?.id, publish: wantsPublish(req.query) }));
  };
  const remove: RequestHandler = async (req, res) => {
    await deleteItem(name, idParam(req.params), req.user?.id);
    res.status(204).end();
  };
  const publish: RequestHandler = async (req, res) => {
    res.json(await setItemStatus(name, idParam(req.params), "PUBLISHED", req.user?.id));
  };
  const unpublish: RequestHandler = async (req, res) => {
    res.json(await setItemStatus(name, idParam(req.params), "DRAFT", req.user?.id));
  };
  const reorder: RequestHandler = async (req, res) => {
    await reorderItems(name, (req.body as { ids: string[] }).ids, req.user?.id);
    res.json(await listItems(name));
  };
  return { list, show, create, update, remove, publish, unpublish, reorder };
}
