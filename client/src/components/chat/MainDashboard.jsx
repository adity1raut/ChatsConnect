import React from "react";
import { MessageSquare, Video, Users, Settings, Bot } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import ThemeToggle from "../common/ThemeToggle";
export default function MainDashboard({
  stats,
  recentActivity,
  aiEnabled,
  setAiEnabled,
  setCurrentView,
  setShowSettingsModal,
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex-1 overflow-y-auto p-6 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
          : "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"
      }`}
    >
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-white"} mb-2`}
          >
            Welcome back, John! 👋
          </h1>
          <p className={`${isDark ? "text-gray-300" : "text-white/90"}`}>
            Here's what's happening with your conversations today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${
                isDark
                  ? "bg-gray-800/80 backdrop-blur-xl border-gray-700/50"
                  : "bg-white/90 backdrop-blur-xl border-white/50"
              } border rounded-xl p-6 shadow-lg hover:shadow-xl transition`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                    stat.color === "blue"
                      ? "from-blue-500 to-blue-600"
                      : stat.color === "green"
                        ? "from-green-500 to-green-600"
                        : stat.color === "purple"
                          ? "from-purple-500 to-purple-600"
                          : "from-orange-500 to-orange-600"
                  } flex items-center justify-center shadow-lg`}
                >
                  <stat.icon size={24} className="text-white" />
                </div>
                <span className="text-green-500 text-sm font-medium">
                  ↑ 12%
                </span>
              </div>
              <h3
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-1`}
              >
                {stat.value}
              </h3>
              <p
                className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div
            className={`lg:col-span-2 ${
              isDark
                ? "bg-gray-800/80 backdrop-blur-xl border-gray-700/50"
                : "bg-white/90 backdrop-blur-xl border-white/50"
            } border rounded-xl shadow-lg p-6`}
          >
            <h2
              className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
            >
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 ${isDark ? "hover:bg-gray-700/50" : "hover:bg-white/50"} rounded-lg transition`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl shadow-md">
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}
                    >
                      <span className="font-semibold">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p
                      className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Enhancement Panel */}
          <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Bot size={24} />
              <h2 className="text-xl font-bold">AI Assistant</h2>
            </div>
            <p className="text-purple-100 mb-6">
              Your AI-powered chat companion is active and helping you
              communicate better!
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/30">
              <h3 className="font-semibold mb-2">Today's AI Insights</h3>
              <ul className="space-y-2 text-sm text-purple-100">
                <li>✓ 23 smart replies suggested</li>
                <li>✓ 8 messages auto-translated</li>
                <li>✓ 5 meetings scheduled</li>
              </ul>
            </div>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className="w-full bg-white text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50 transition shadow-md"
            >
              {aiEnabled ? "AI Enabled ✓" : "Enable AI"}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={`mt-8 ${
            isDark
              ? "bg-gray-800/80 backdrop-blur-xl border-gray-700/50"
              : "bg-white/90 backdrop-blur-xl border-white/50"
          } border rounded-xl shadow-lg p-6`}
        >
          <h2
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-4`}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setCurrentView("chat")}
              className={`p-4 border-2 ${
                isDark
                  ? "border-gray-700/50 hover:border-blue-500 hover:bg-blue-900/20"
                  : "border-white/50 hover:border-blue-500 hover:bg-blue-500/20"
              } rounded-lg transition shadow-sm hover:shadow-md backdrop-blur-sm bg-white/10`}
            >
              <MessageSquare className="mx-auto mb-2 text-blue-500" size={24} />
              <p
                className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-800"}`}
              >
                New Chat
              </p>
            </button>
            <button
              className={`p-4 border-2 ${
                isDark
                  ? "border-gray-700/50 hover:border-green-500 hover:bg-green-900/20"
                  : "border-white/50 hover:border-green-500 hover:bg-green-500/20"
              } rounded-lg transition shadow-sm hover:shadow-md backdrop-blur-sm bg-white/10`}
            >
              <Video className="mx-auto mb-2 text-green-500" size={24} />
              <p
                className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-800"}`}
              >
                Start Call
              </p>
            </button>
            <button
              className={`p-4 border-2 ${
                isDark
                  ? "border-gray-700/50 hover:border-purple-500 hover:bg-purple-900/20"
                  : "border-white/50 hover:border-purple-500 hover:bg-purple-500/20"
              } rounded-lg transition shadow-sm hover:shadow-md backdrop-blur-sm bg-white/10`}
            >
              <Users className="mx-auto mb-2 text-purple-500" size={24} />
              <p
                className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-800"}`}
              >
                New Group
              </p>
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className={`p-4 border-2 ${
                isDark
                  ? "border-gray-700/50 hover:border-orange-500 hover:bg-orange-900/20"
                  : "border-white/50 hover:border-orange-500 hover:bg-orange-500/20"
              } rounded-lg transition shadow-sm hover:shadow-md backdrop-blur-sm bg-white/10`}
            >
              <Settings className="mx-auto mb-2 text-orange-500" size={24} />
              <p
                className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-800"}`}
              >
                Settings
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
