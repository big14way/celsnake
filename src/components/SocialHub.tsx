/**
 * Social Hub Container
 * Main container for all social features including friends, chat, feed, and referrals
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useSocialStore } from '../stores/socialStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { setupSocialListeners } from '../stores/socialStore';
import FriendsPanel from './FriendsPanel';
import toast from 'react-hot-toast';
import { shareWin, createWinShareData } from '../utils/shareWin';
import type { SharePlatform } from '../types/social';

interface SocialHubProps {
  onClose: () => void;
}

const SocialHub: React.FC<SocialHubProps> = ({ onClose }) => {
  const { address } = useAccount();
  const { socket, connected, connect } = useMultiplayerStore();
  const [activeSection, setActiveSection] = useState<'friends' | 'chat' | 'feed' | 'referrals'>('friends');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [nickname, setNickname] = useState('');
  const listenersSetup = useRef(false);

  const {
    friends,
    friendRequests,
    globalMessages,
    unreadMessages,
    activities,
    myReferralStats,
    myProfile,
    gameInvites,
    sendMessage,
    createProfile,
    loadProfile,
    fetchFriends,
    fetchFriendRequests,
    fetchActivities,
    fetchReferrals,
    generateReferralCode,
  } = useSocialStore();

  // Connect to socket if not already connected
  useEffect(() => {
    if (!connected) {
      console.log('SocialHub: Connecting to server...');
      connect();
    }
  }, [connected, connect]);

  // Setup socket listeners only once
  useEffect(() => {
    if (socket && !listenersSetup.current) {
      console.log('SocialHub: Setting up socket listeners (once)');
      setupSocialListeners(socket);
      listenersSetup.current = true;
    }
  }, [socket]);

  // Load profile when address is available and socket is connected
  useEffect(() => {
    if (address && connected && !myProfile && !showCreateProfile) {
      console.log('SocialHub: Loading profile for', address);
      loadProfile(address);

      // Show create profile dialog after a delay if profile doesn't load
      const timer = setTimeout(() => {
        if (!myProfile) {
          setShowCreateProfile(true);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [address, connected, myProfile, showCreateProfile, loadProfile]);

  // Fetch data after profile is loaded
  useEffect(() => {
    if (address && myProfile) {
      fetchFriends();
      fetchFriendRequests();
      fetchActivities();
      fetchReferrals();
    }
  }, [address, myProfile]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    sendMessage('global', chatMessage);
    setChatMessage('');
  };

  const handleGenerateReferralCode = () => {
    generateReferralCode();
  };

  const handleShare = async (platform: SharePlatform) => {
    const shareData = createWinShareData(
      '1.5',
      2.5,
      'hard',
      myReferralStats?.referralCode
    );

    await shareWin(platform, { ...shareData, platform });
    setShowShareDialog(false);
  };

  const handleCreateProfile = () => {
    if (!address) {
      toast.error('Please connect wallet first');
      return;
    }
    if (!nickname.trim()) {
      toast.error('Please enter a nickname');
      return;
    }

    createProfile(address, nickname.trim());
    setShowCreateProfile(false);
  };

  // Show create profile dialog if no profile exists
  if (showCreateProfile && !myProfile) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border-2 border-purple-500 rounded-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Create Your Profile</h2>
          <p className="text-gray-400 mb-6">Welcome to Celo Snake Social! Let's create your profile to get started.</p>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2 font-bold">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProfile()}
              placeholder="Enter your nickname"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              maxLength={32}
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateProfile}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              Create Profile
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-lg max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🌐 Social Hub
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          <button
            onClick={() => setActiveSection('friends')}
            className={`flex-1 py-3 px-4 font-bold transition-colors relative ${
              activeSection === 'friends'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            👥 Friends
            {friendRequests.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('chat')}
            className={`flex-1 py-3 px-4 font-bold transition-colors relative ${
              activeSection === 'chat'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            💬 Chat
            {unreadMessages > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('feed')}
            className={`flex-1 py-3 px-4 font-bold transition-colors ${
              activeSection === 'feed'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            📰 Feed
          </button>
          <button
            onClick={() => setActiveSection('referrals')}
            className={`flex-1 py-3 px-4 font-bold transition-colors ${
              activeSection === 'referrals'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            🎁 Referrals
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Friends Section */}
          {activeSection === 'friends' && (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4">Your Friends ({friends.length})</h3>
                {friends.length === 0 ? (
                  <p className="text-gray-400">No friends yet. Start adding friends!</p>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend) => (
                      <div
                        key={friend.address}
                        className="bg-gray-700 p-3 rounded flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                          <div>
                            <div className="text-white font-bold">{friend.nickname}</div>
                            <div className="text-gray-400 text-sm">{friend.address.slice(0, 10)}...</div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">
                          Invite to Game
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Section */}
          {activeSection === 'chat' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex-1 overflow-y-auto">
                <h3 className="text-white font-bold text-lg mb-4">Global Chat</h3>
                <div className="space-y-2">
                  {globalMessages.map((msg) => (
                    <div key={msg.id} className="bg-gray-700 p-2 rounded">
                      <div className="text-purple-400 text-sm font-bold">{msg.fromNickname}</div>
                      <div className="text-white">{msg.message}</div>
                      <div className="text-gray-500 text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Feed Section */}
          {activeSection === 'feed' && (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4">Recent Activity</h3>
                {activities.length === 0 ? (
                  <p className="text-gray-400">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="bg-gray-700 p-3 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-purple-400 font-bold">{activity.playerNickname}</div>
                          <div className="text-gray-500 text-sm">{new Date(activity.timestamp).toLocaleString()}</div>
                        </div>
                        <div className="text-white">
                          {activity.type === 'win' && `Won ${activity.data.winAmount} CELO with ${activity.data.multiplier}x multiplier!`}
                          {activity.type === 'achievement' && `Unlocked ${activity.data.achievementName}!`}
                          {activity.type === 'tournament_win' && `Won ${activity.data.tournamentName} tournament!`}
                        </div>
                        <div className="flex gap-4 mt-2 text-gray-400 text-sm">
                          <span>❤️ {activity.likes}</span>
                          <span>💬 {activity.comments.length}</span>
                          <span>🔗 {activity.shares}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Referrals Section */}
          {activeSection === 'referrals' && (
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4">Your Referral Program</h3>
                {myReferralStats ? (
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <div className="text-gray-400 mb-2">Your Referral Code</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={myReferralStats.referralCode}
                          readOnly
                          className="flex-1 px-3 py-2 bg-gray-900 text-white rounded"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(myReferralStats.referralLink);
                            toast.success('Link copied!');
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold"
                        >
                          Copy Link
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-4 rounded">
                        <div className="text-gray-400 text-sm">Total Referrals</div>
                        <div className="text-white text-2xl font-bold">{myReferralStats.totalReferrals}</div>
                      </div>
                      <div className="bg-gray-700 p-4 rounded">
                        <div className="text-gray-400 text-sm">Total Rewards</div>
                        <div className="text-white text-2xl font-bold">{myReferralStats.totalRewards} CELO</div>
                      </div>
                    </div>
                    <div className="bg-purple-900/30 border border-purple-500 p-4 rounded">
                      <h4 className="text-purple-400 font-bold mb-2">How it works</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Share your referral link with friends</li>
                        <li>• Earn 5% of their first game bet</li>
                        <li>• They get 3% bonus on their first bet</li>
                        <li>• Rewards are instant and on-chain!</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <button
                      onClick={handleGenerateReferralCode}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                    >
                      Generate Referral Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Share Dialog */}
        {showShareDialog && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-white font-bold text-xl mb-4">Share Your Win!</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-bold"
                >
                  🐦 Twitter
                </button>
                <button
                  onClick={() => handleShare('telegram')}
                  className="px-4 py-3 bg-blue-400 hover:bg-blue-500 text-white rounded font-bold"
                >
                  ✈️ Telegram
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded font-bold"
                >
                  💬 WhatsApp
                </button>
                <button
                  onClick={() => handleShare('discord')}
                  className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-bold"
                >
                  💬 Discord
                </button>
              </div>
              <button
                onClick={() => setShowShareDialog(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialHub;
