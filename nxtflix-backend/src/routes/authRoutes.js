import { Router } from "express";
import { signup, signin, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", authenticateToken, getMe);

export default router;
