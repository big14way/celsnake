/**
 * Friends Panel Component
 * Displays friends list, friend requests, and friend management
 */

import React, { useState, useEffect } from 'react';
import { useSocialStore } from '../stores/socialStore';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

interface FriendsPanelProps {
  onClose?: () => void;
}

const FriendsPanel: React.FC<FriendsPanelProps> = ({ onClose }) => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'blocked'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendAddress, setAddFriendAddress] = useState('');
  const [addFriendNickname, setAddFriendNickname] = useState('');

  const {
    friends,
    friendRequests,
    blockedUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    fetchFriends,
    fetchFriendRequests,
  } = useSocialStore();

  useEffect(() => {
    if (address) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [address, fetchFriends, fetchFriendRequests]);

  const handleSendFriendRequest = () => {
    if (!addFriendAddress || !addFriendNickname) {
      toast.error('Please enter address and nickname');
      return;
    }

    sendFriendRequest(addFriendAddress, addFriendNickname);
    setAddFriendAddress('');
    setAddFriendNickname('');
  };

  const filteredFriends = friends.filter((friend) =>
    friend.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            👥 Friends
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 font-bold transition-colors ${
              activeTab === 'friends'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 font-bold transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Requests ({friendRequests.length})
            {friendRequests.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex-1 py-3 px-4 font-bold transition-colors ${
              activeTab === 'blocked'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Blocked ({blockedUsers.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {/* Add Friend */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-white font-bold mb-2">Add Friend</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Friend's address (0x...)"
                    value={addFriendAddress}
                    onChange={(e) => setAddFriendAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Friend's nickname"
                    value={addFriendNickname}
                    onChange={(e) => setAddFriendNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
                  />
                  <button
                    onClick={handleSendFriendRequest}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-bold"
                  >
                    Send Friend Request
                  </button>
                </div>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
              />

              {/* Friends List */}
              {filteredFriends.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No friends yet. Add some friends to get started!
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.address}
                      className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                        <div>
                          <div className="text-white font-bold">{friend.nickname}</div>
                          <div className="text-gray-400 text-sm">
                            {friend.address.slice(0, 6)}...{friend.address.slice(-4)}
                          </div>
                          {friend.totalGames && (
                            <div className="text-gray-500 text-xs">
                              {friend.totalGames} games • {friend.totalWins} wins
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => removeFriend(friend.address)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-bold"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => blockUser(friend.address)}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-bold"
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-2">
              {friendRequests.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No pending friend requests
                </div>
              ) : (
                friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white font-bold">{request.fromNickname}</div>
                      <div className="text-gray-400 text-sm">
                        {request.from.slice(0, 6)}...{request.from.slice(-4)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(request.id)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Blocked Tab */}
          {activeTab === 'blocked' && (
            <div className="space-y-2">
              {blockedUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No blocked users
                </div>
              ) : (
                blockedUsers.map((userAddress) => (
                  <div
                    key={userAddress}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center justify-between"
                  >
                    <div className="text-white">
                      {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                    </div>
                    <button
                      onClick={() => unblockUser(userAddress)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendsPanel;
