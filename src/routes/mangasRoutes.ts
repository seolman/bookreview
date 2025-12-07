import { Router } from "express";

import {
  createMangaHandler,
  deleteMangaByIdHandler,
  getMangaByIdHandler,
  listMangasHandler,
  updateMangaByIdHandler,
} from "../controllers/mangasController.js";

const mangasRouter = Router();

mangasRouter.get("/mangas", listMangasHandler);

mangasRouter.get("/mangas/:id", getMangaByIdHandler);

// TODO check role
mangasRouter.put("/mangas/:id", updateMangaByIdHandler);

// TODO check role
mangasRouter.delete("/mangas/:id", deleteMangaByIdHandler);

// TODO check role
mangasRouter.post("/mangas", createMangaHandler);

export default mangasRouter;
