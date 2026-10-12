import { Router } from "express";
import { getAdminAnalytics, getUsers, updateUserRole } from "../controllers/adminController.js";
import { authenticateToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticateToken);
router.use(verifyAdmin);

router.get("/analytics", getAdminAnalytics);
router.get("/stats", getAdminAnalytics);
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);

export default router;
