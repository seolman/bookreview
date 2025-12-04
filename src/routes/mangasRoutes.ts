import { Router } from "express";

import { getMangaByIdHandler, listMangasHandler } from "../controllers/mangasController.js";

const mangasRouter = Router();

mangasRouter.get("/", listMangasHandler);

mangasRouter.get("/:id", getMangaByIdHandler);

export default mangasRouter;
