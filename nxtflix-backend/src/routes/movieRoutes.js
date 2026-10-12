import { Router } from "express";
import {
  getMovies,
  getTrendingMovies,
  getMovieById,
  streamMovie,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movieController.js";
import { authenticateToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getMovies);
router.get("/trending", getTrendingMovies);
router.get("/:id", getMovieById);
router.get("/:id/stream", streamMovie);

// Admin-only endpoints
router.post("/", verifyAdmin, createMovie);
router.put("/:id", verifyAdmin, updateMovie);
router.delete("/:id", verifyAdmin, deleteMovie);

export default router;

