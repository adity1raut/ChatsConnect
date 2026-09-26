import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { publishKeySchema, userIdParamSchema } from "../validators/keys.schemas.js";
import { getMyKeys, getUserKeys, publishMyKey } from "../controllers/keys.controller.js";

const router = Router();
router.use(protect);

router.get("/me", getMyKeys);
router.put("/me", validate({ body: publishKeySchema }), publishMyKey);
router.get("/:userId", validate({ params: userIdParamSchema }), getUserKeys);

export default router;
