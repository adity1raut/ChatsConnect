import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.use(protect);
router.get("/stats", getDashboardStats);

export default router;
