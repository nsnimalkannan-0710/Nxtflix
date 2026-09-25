import { Router } from "express";
import {
  getWatchLaterList,
  addToWatchLater,
  removeFromWatchLater,
} from "../controllers/watchLaterController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken);

router.get("/", getWatchLaterList);
router.post("/:movieId", addToWatchLater);
router.delete("/:movieId", removeFromWatchLater);

export default router;
