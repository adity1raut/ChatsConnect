import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          // Update user info and set online status
          user.isOnline = true;
          user.lastSeen = new Date();
          user.avatar = profile.photos?.[0]?.value || user.avatar;
          user.name = profile.displayName || user.name;
          await user.save();
          return done(null, user);
        }

        // Check if email already exists with different auth provider
        if (profile.emails?.[0]?.value) {
          const existingUser = await User.findOne({
            email: profile.emails[0].value,
          });

          if (existingUser && existingUser.authProvider !== "GITHUB") {
            return done(
              new Error(
                `An account with this email already exists using ${existingUser.authProvider} login`,
              ),
              null,
            );
          }
        }

        // Create new user
        const username =
          profile.username ||
          profile.displayName?.replace(/\s+/g, "").toLowerCase() ||
          `user${profile.id}`;

        user = await User.create({
          name: profile.displayName || profile.username || "GitHub User",
          username: username,
          email: profile.emails?.[0]?.value || null,
          githubId: profile.id,
          authProvider: "GITHUB",
          avatar:
            profile.photos?.[0]?.value ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=8b5cf6&color=fff&size=200`,
          bio: profile.bio || "",
          isOnline: true,
          lastSeen: new Date(),
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
