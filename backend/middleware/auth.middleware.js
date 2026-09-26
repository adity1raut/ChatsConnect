import { verifyAccessToken } from "../service/token.service.js";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = verifyAccessToken(token);

    req.user = await User.findById(decoded.userId).select(
      "-password -refreshToken",
    );

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
