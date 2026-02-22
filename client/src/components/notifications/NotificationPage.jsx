import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Settings, Filter } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { isDark } = useTheme();

  const notifications = [
    {
      id: 1,
      type: 'like',
      user: { name: 'Sarah Wilson', avatar: '👩', image: '/api/placeholder/40/40' },
      action: 'liked your post',
      content: 'Amazing sunset photo! 🌅',
      time: '2m ago',
      read: false,
    },
    {
      id: 2,
      type: 'comment',
      user: { name: 'Mike Johnson', avatar: '👨', image: '/api/placeholder/40/40' },
      action: 'commented on your post',
      content: 'This looks incredible! Where was this taken?',
      time: '15m ago',
      read: false,
    },
    {
      id: 3,
      type: 'follow',
      user: { name: 'Emma Davis', avatar: '👧', image: '/api/placeholder/40/40' },
      action: 'started following you',
      time: '1h ago',
      read: false,
    },
    {
      id: 4,
      type: 'mention',
      user: { name: 'Alex Chen', avatar: '🧑', image: '/api/placeholder/40/40' },
      action: 'mentioned you in a comment',
      content: '@you Check out this amazing work!',
      time: '2h ago',
      read: true,
    },
    {
      id: 5,
      type: 'like',
      user: { name: 'Jessica Brown', avatar: '👩‍🦰', image: '/api/placeholder/40/40' },
      action: 'liked your comment',
      content: 'Great perspective on this topic!',
      time: '3h ago',
      read: true,
    },
    {
      id: 6,
      type: 'comment',
      user: { name: 'David Lee', avatar: '🧔', image: '/api/placeholder/40/40' },
      action: 'replied to your comment',
      content: 'I totally agree with your point about...',
      time: '5h ago',
      read: true,
    },
    {
      id: 7,
      type: 'follow',
      user: { name: 'Sophia Garcia', avatar: '👩‍💼', image: '/api/placeholder/40/40' },
      action: 'started following you',
      time: '1d ago',
      read: true,
    },
    {
      id: 8,
      type: 'like',
      user: { name: 'James Martinez', avatar: '👨‍💻', image: '/api/placeholder/40/40' },
      action: 'liked your post',
      content: 'Beautiful composition! Love the colors.',
      time: '2d ago',
      read: true,
    },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    return notification.type === activeFilter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col h-screen">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className={`flex-1 overflow-y-auto p-6 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900'
          : 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-white'} mb-2`}>
              Notifications
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-white/90'}`}>
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                : "You're all caught up!"
              }
            </p>
          </div>

          {/* Filter Tabs */}
          <div className={`${
            isDark 
              ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-xl border-white/50'
          } border rounded-xl shadow-lg p-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Filter Notifications
              </h2>
              <button className={`p-2 ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'} rounded-lg transition`}>
                <Settings size={20} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : `${isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === 'unread'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : `${isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveFilter('like')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeFilter === 'like'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : `${isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`
                }`}
              >
                Likes
              </button>
              <button
                onClick={() => setActiveFilter('comment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeFilter === 'comment'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : `${isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setActiveFilter('follow')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeFilter === 'follow'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : `${isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`
                }`}
              >
                Follows
              </button>
              <button
                onClick={() => setActiveFilter('mention')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  activeFilter === 'mention'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : `${isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'}`
                }`}
              >
                Mentions
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className={`${
              isDark 
                ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50' 
                : 'bg-white/90 backdrop-blur-xl border-white/50'
            } border rounded-xl shadow-lg p-6`}>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
                Recent Notifications
              </h2>
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 ${
                      isDark ? 'hover:bg-gray-700/50' : 'hover:bg-white/50'
                    } rounded-lg transition cursor-pointer ${
                      !notification.read ? 'ring-2 ring-purple-500/50' : ''
                    }`}
                  >
                    {/* User Avatar with Icon Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl shadow-md">
                        {notification.user.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      } rounded-full flex items-center justify-center shadow-md`}>
                        {getIcon(notification.type)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            <span className="font-semibold">{notification.user.name}</span>{' '}
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {notification.action}
                            </span>
                          </p>
                          {notification.content && (
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {notification.content}
                            </p>
                          )}
                          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>

                      {/* Action Buttons for Follow Notifications */}
                      {notification.type === 'follow' && !notification.read && (
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition shadow-md">
                            Follow Back
                          </button>
                          <button className={`flex-1 px-4 py-1.5 ${
                            isDark ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50' : 'bg-white/50 text-gray-600 hover:bg-white/70'
                          } rounded-lg text-sm font-medium transition`}>
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`${
              isDark 
                ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50' 
                : 'bg-white/90 backdrop-blur-xl border-white/50'
            } border rounded-xl shadow-lg p-12`}>
              <div className="text-center">
                <div className={`w-24 h-24 ${
                  isDark ? 'bg-purple-900/30' : 'bg-white/30'
                } backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Filter size={40} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                </div>
                <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                  No notifications
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No notifications match your current filter
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`mt-6 ${
            isDark
              ? 'bg-gray-800/80 backdrop-blur-xl border-gray-700/50'
              : 'bg-white/90 backdrop-blur-xl border-white/50'
          } border rounded-xl shadow-lg p-6`}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button className={`p-4 border-2 ${
                isDark
                  ? 'border-gray-700/50 hover:border-blue-500 hover:bg-blue-900/20'
                  : 'border-white/50 hover:border-blue-500 hover:bg-blue-500/20'
              } rounded-lg transition shadow-sm hover:shadow-md backdrop-blur-sm bg-white/10`}>
                <MessageCircle className="mx-auto mb-2 text-blue-500" size={24} />
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  Mark All Read
                </p>
              </button>
              <button className={`p-4 border-2 ${
                isDark
                  ? 'border-gray-700/50 hover:border-purple-500 hover:bg-purple-900/20'
                  : 'border-white/50 hover:border-purple-500 hover:bg-purple-500/20'
              } rounded-lg transition shadow-sm hover:shadow-md backdrop-blur-sm bg-white/10`}>
                <Filter className="mx-auto mb-2 text-purple-500" size={24} />
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  Clear Filter
                </p>
              </button>
              <button className={`p-4 border-2 ${
                isDark
                  ? 'border-gray-700/50 hover:border-orange-500 hover:bg-orange-900/20'
                  : 'border-white/50 hover:border-orange-500 hover:bg-orange-500/20'
              } rounded-lg transition shadow-sm hover:shadow-md backdrop-blur-sm bg-white/10`}>
                <Settings className="mx-auto mb-2 text-orange-500" size={24} />
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                  Settings
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}