import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendSuccessPagenation } from "../utils/response.js";
import {
  getMangaById,
  getMangas,
  updateMangaById,
} from "../services/mangasService.js";

export const listMangasHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sort = (req.query.sort as string) || "createdAt,desc";
    const { mangas, pagination } = await getMangas(page, size, sort);

    sendSuccessPagenation(res, mangas, pagination);
  }
);

export const getMangaByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const id = parseInt(req.params.id as string);
    const manga = await getMangaById(id);

    sendSuccess(res, manga);
  }
);

export const updateMangaByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const id = parseInt(req.params.id as string);
    const manga = await updateMangaById(id, req.body);
    sendSuccess(res, manga);
  }
);

// TODO
export const deleteMangaByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {}
);

// TODO
export const createMangaHandler: RequestHandler = asyncHandler(
  async (req, res) => {}
);
