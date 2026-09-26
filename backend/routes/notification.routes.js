import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import {
  idParamSchema,
  listQuerySchema,
  markReadSchema,
  preferencesSchema,
} from "../validators/notification.schemas.js";
import {
  clearNotifications,
  deleteNotification,
  getPreferences,
  getUnreadCount,
  listNotifications,
  markRead,
  updatePreferences,
} from "../controllers/notification.controller.js";

const router = Router();
router.use(protect);

router.get("/", validate({ query: listQuerySchema }), listNotifications);
router.get("/unread-count", getUnreadCount);
router.post("/read", validate({ body: markReadSchema }), markRead);
router.get("/preferences", getPreferences);
router.put("/preferences", validate({ body: preferencesSchema }), updatePreferences);
router.delete("/", clearNotifications);
router.delete("/:id", validate({ params: idParamSchema }), deleteNotification);

export default router;
