import FriendRequest from "../models/friendRequest.model.js";
import { getIO } from "../socket/socket.js";

// POST /api/friends/request/:userId — send a friend request
export const sendRequest = async (req, res) => {
  const myId = req.user._id;
  const { userId: targetId } = req.params;

  if (myId.toString() === targetId) {
    return res.status(400).json({ message: "Cannot send request to yourself" });
  }

  try {
    // Check for existing request in either direction
    const existing = await FriendRequest.findOne({
      $or: [
        { sender: myId, receiver: targetId },
        { sender: targetId, receiver: myId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Request already pending" });
      }
      // If previously rejected, allow re-sending by updating
      if (
        existing.sender.toString() === myId.toString() &&
        existing.status === "rejected"
      ) {
        existing.status = "pending";
        await existing.save();
        const populated = await FriendRequest.findById(existing._id).populate(
          "sender",
          "name username avatar isOnline",
        );
        // Notify receiver via socket
        getIO()?.to(targetId).emit("friendRequest", { request: populated });
        return res.status(200).json({ request: populated });
      }
      return res.status(400).json({ message: "Cannot send request" });
    }

    const request = await FriendRequest.create({
      sender: myId,
      receiver: targetId,
    });
    const populated = await FriendRequest.findById(request._id).populate(
      "sender",
      "name username avatar isOnline",
    );

    // Real-time notification to receiver
    getIO()?.to(targetId).emit("friendRequest", { request: populated });

    res.status(201).json({ request: populated });
  } catch (err) {
    console.error("sendRequest error:", err);
    res.status(500).json({ message: "Failed to send friend request" });
  }
};

// PUT /api/friends/request/:requestId/accept — accept a request
export const acceptRequest = async (req, res) => {
  const myId = req.user._id;
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: myId,
      status: "pending",
    }).populate("sender", "name username avatar isOnline");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "accepted";
    await request.save();

    // Notify the original sender in real-time
    getIO()
      ?.to(request.sender._id.toString())
      .emit("friendRequestAccepted", {
        request,
        acceptedBy: {
          _id: myId,
          name: req.user.name,
          username: req.user.username,
          avatar: req.user.avatar,
        },
      });

    res.status(200).json({ request });
  } catch (err) {
    console.error("acceptRequest error:", err);
    res.status(500).json({ message: "Failed to accept request" });
  }
};

// PUT /api/friends/request/:requestId/reject — reject a request
export const rejectRequest = async (req, res) => {
  const myId = req.user._id;
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: myId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Request rejected" });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ message: "Failed to reject request" });
  }
};

// DELETE /api/friends/request/:requestId/cancel — cancel a sent request
export const cancelRequest = async (req, res) => {
  const myId = req.user._id;
  const { requestId } = req.params;

  try {
    const request = await FriendRequest.findOneAndDelete({
      _id: requestId,
      sender: myId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request cancelled" });
  } catch (err) {
    console.error("cancelRequest error:", err);
    res.status(500).json({ message: "Failed to cancel request" });
  }
};

// GET /api/friends — get accepted friends list
export const getFriends = async (req, res) => {
  const myId = req.user._id;

  try {
    const requests = await FriendRequest.find({
      $or: [{ sender: myId }, { receiver: myId }],
      status: "accepted",
    })
      .populate("sender", "name username avatar isOnline lastSeen")
      .populate("receiver", "name username avatar isOnline lastSeen")
      .lean();

    const friends = requests.map((r) =>
      r.sender._id.toString() === myId.toString() ? r.receiver : r.sender,
    );

    res.status(200).json({ friends });
  } catch (err) {
    console.error("getFriends error:", err);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
};

// GET /api/friends/requests — incoming pending requests
export const getFriendRequests = async (req, res) => {
  const myId = req.user._id;

  try {
    const requests = await FriendRequest.find({
      receiver: myId,
      status: "pending",
    })
      .populate("sender", "name username avatar isOnline")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ requests });
  } catch (err) {
    console.error("getFriendRequests error:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// GET /api/friends/sent — sent pending requests
export const getSentRequests = async (req, res) => {
  const myId = req.user._id;

  try {
    const requests = await FriendRequest.find({
      sender: myId,
      status: "pending",
    })
      .populate("receiver", "name username avatar isOnline")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ requests });
  } catch (err) {
    console.error("getSentRequests error:", err);
    res.status(500).json({ message: "Failed to fetch sent requests" });
  }
};

// DELETE /api/friends/:userId — remove a friend
export const removeFriend = async (req, res) => {
  const myId = req.user._id;
  const { userId } = req.params;

  try {
    const result = await FriendRequest.findOneAndDelete({
      $or: [
        { sender: myId, receiver: userId, status: "accepted" },
        { sender: userId, receiver: myId, status: "accepted" },
      ],
    });

    if (!result) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    res.status(200).json({ message: "Friend removed" });
  } catch (err) {
    console.error("removeFriend error:", err);
    res.status(500).json({ message: "Failed to remove friend" });
  }
};

// GET /api/friends/relationship/:userId — check relationship with a specific user
export const getRelationship = async (req, res) => {
  const myId = req.user._id;
  const { userId } = req.params;

  try {
    const request = await FriendRequest.findOne({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).lean();

    if (!request) {
      return res.status(200).json({ status: "none" });
    }

    if (request.status === "accepted") {
      return res
        .status(200)
        .json({ status: "friends", requestId: request._id });
    }

    if (request.status === "pending") {
      const isSender = request.sender.toString() === myId.toString();
      return res.status(200).json({
        status: isSender ? "sent" : "received",
        requestId: request._id,
      });
    }

    // rejected — treat as none (allow re-request)
    return res.status(200).json({ status: "none" });
  } catch (err) {
    console.error("getRelationship error:", err);
    res.status(500).json({ message: "Failed to get relationship" });
  }
};
