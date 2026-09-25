import { Router } from "express";
import {
  getMovies,
  getTrendingMovies,
  getMovieById,
  streamMovie,
} from "../controllers/movieController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getMovies);
router.get("/trending", getTrendingMovies);
router.get("/:id", getMovieById);
router.get("/:id/stream", streamMovie);

export default router;
