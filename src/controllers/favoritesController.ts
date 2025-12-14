import { RequestHandler } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  addFavorite,
  getFavoritesByManga,
  getFavoritesByUser,
} from "../services/favoritesService.js";
import { HttpStatusCode } from "axios";

export const addFavoriteHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const userId = req.user!.id;

    await addFavorite(userId, mangaId);

    res.status(HttpStatusCode.NoContent).send();
  }
);

export const getFavoritesByMangaHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const users = await getFavoritesByManga(mangaId);
    sendSuccess(res, users);
  }
);

export const getFavoritesByUserHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = parseInt(req.params.id);
    const favoriteMangas = await getFavoritesByUser(userId);
    sendSuccess(res, favoriteMangas);
  }
);
