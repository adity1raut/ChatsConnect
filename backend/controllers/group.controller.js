import Group from "../models/group.model.js";
import User from "../models/user.model.js";

// POST /api/groups — create a new group
export const createGroup = async (req, res) => {
  const { name, description, memberIds } = req.body;
  const creatorId = req.user._id;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Group name is required" });
  }

  try {
    // Build members array: creator is admin, others are members
    const members = [{ user: creatorId, role: "admin", joinedAt: new Date() }];

    if (Array.isArray(memberIds) && memberIds.length > 0) {
      const uniqueIds = [...new Set(memberIds)].filter(
        (id) => id.toString() !== creatorId.toString()
      );

      for (const uid of uniqueIds) {
        const userExists = await User.exists({ _id: uid });
        if (userExists) {
          members.push({ user: uid, role: "member", joinedAt: new Date() });
        }
      }
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: creatorId,
      members,
    });

    const populated = await Group.findById(group._id)
      .populate("members.user", "name username avatar isOnline")
      .populate("createdBy", "name username avatar");

    res.status(201).json({ group: populated });
  } catch (err) {
    console.error("createGroup error:", err);
    res.status(500).json({ message: "Failed to create group" });
  }
};

// GET /api/groups/my — get all groups the current user belongs to
export const getMyGroups = async (req, res) => {
  const myId = req.user._id;

  try {
    const groups = await Group.find({ "members.user": myId })
      .sort({ lastMessageAt: -1 })
      .populate("members.user", "name username avatar isOnline")
      .populate({
        path: "lastMessage",
        populate: { path: "senderId", select: "name username" },
      })
      .lean();

    res.status(200).json({ groups });
  } catch (err) {
    console.error("getMyGroups error:", err);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

// GET /api/groups/:groupId — get group details
export const getGroupDetails = async (req, res) => {
  const myId = req.user._id;
  const { groupId } = req.params;

  try {
    const group = await Group.findOne({
      _id: groupId,
      "members.user": myId,
    })
      .populate("members.user", "name username avatar isOnline lastSeen")
      .populate("createdBy", "name username avatar");

    if (!group) {
      return res.status(404).json({ message: "Group not found or not a member" });
    }

    res.status(200).json({ group });
  } catch (err) {
    console.error("getGroupDetails error:", err);
    res.status(500).json({ message: "Failed to fetch group" });
  }
};

// POST /api/groups/:groupId/members — add members (admin only)
export const addMembers = async (req, res) => {
  const myId = req.user._id;
  const { groupId } = req.params;
  const { memberIds } = req.body;

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ message: "memberIds array is required" });
  }

  try {
    const group = await Group.findOne({
      _id: groupId,
      "members.user": myId,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check admin role
    const myMembership = group.members.find(
      (m) => m.user.toString() === myId.toString()
    );
    if (myMembership?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    const existingIds = group.members.map((m) => m.user.toString());
    let added = 0;

    for (const uid of memberIds) {
      if (!existingIds.includes(uid.toString())) {
        const userExists = await User.exists({ _id: uid });
        if (userExists) {
          group.members.push({ user: uid, role: "member", joinedAt: new Date() });
          added++;
        }
      }
    }

    if (added > 0) await group.save();

    const updated = await Group.findById(groupId).populate(
      "members.user",
      "name username avatar isOnline"
    );

    res.status(200).json({ group: updated, added });
  } catch (err) {
    console.error("addMembers error:", err);
    res.status(500).json({ message: "Failed to add members" });
  }
};

// DELETE /api/groups/:groupId/members/:userId — remove a member (admin only)
export const removeMember = async (req, res) => {
  const myId = req.user._id;
  const { groupId, userId } = req.params;

  try {
    const group = await Group.findOne({
      _id: groupId,
      "members.user": myId,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const myMembership = group.members.find(
      (m) => m.user.toString() === myId.toString()
    );
    if (myMembership?.role !== "admin") {
      return res.status(403).json({ message: "Only admins can remove members" });
    }

    if (userId.toString() === myId.toString()) {
      return res.status(400).json({ message: "Use the leave endpoint instead" });
    }

    group.members = group.members.filter(
      (m) => m.user.toString() !== userId.toString()
    );
    await group.save();

    res.status(200).json({ message: "Member removed" });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Failed to remove member" });
  }
};

// DELETE /api/groups/:groupId/leave — leave a group
export const leaveGroup = async (req, res) => {
  const myId = req.user._id;
  const { groupId } = req.params;

  try {
    const group = await Group.findOne({
      _id: groupId,
      "members.user": myId,
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // If leaving user is the only admin, promote the next member
    const myMembership = group.members.find(
      (m) => m.user.toString() === myId.toString()
    );
    const isOnlyAdmin =
      myMembership?.role === "admin" &&
      group.members.filter((m) => m.role === "admin").length === 1;

    group.members = group.members.filter(
      (m) => m.user.toString() !== myId.toString()
    );

    if (group.members.length === 0) {
      // Delete group if no members left
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "Group deleted (no members left)" });
    }

    if (isOnlyAdmin) {
      // Promote first remaining member to admin
      group.members[0].role = "admin";
    }

    await group.save();
    res.status(200).json({ message: "Left group" });
  } catch (err) {
    console.error("leaveGroup error:", err);
    res.status(500).json({ message: "Failed to leave group" });
  }
};
