import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendSuccessPagenation } from "../utils/response.js";
import { getMangaById, getMangas } from "../services/mangasService.js";

export const listMangasHandler: RequestHandler = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const { mangas, pagination } = await getMangas(page, size);

  sendSuccessPagenation(res, mangas, pagination, HttpStatusCode.Ok);
});

export const getMangaByIdHandler: RequestHandler = asyncHandler(async (req, res) => {
  const id = parseInt(req.query.id as string);
  const manga = await getMangaById(id);

  sendSuccess(res, manga, HttpStatusCode.Ok);
});
