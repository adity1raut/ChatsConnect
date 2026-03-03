import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  getGroupDetails,
  addMembers,
  removeMember,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

// All group routes are protected
router.use(protect);

router.post("/", createGroup);
router.get("/my", getMyGroups);
router.get("/:groupId", getGroupDetails);
router.post("/:groupId/members", addMembers);
router.delete("/:groupId/members/:userId", removeMember);
router.delete("/:groupId/leave", leaveGroup);

export default router;
