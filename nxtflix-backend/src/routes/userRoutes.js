import { Router } from "express";
import { getUsers, updateUserRole } from "../controllers/adminController.js";
import { authenticateToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(verifyAdmin);

router.get("/", getUsers);
router.patch("/:id/role", updateUserRole);

export default router;
