/**
 * Social Features State Management with Zustand
 * Manages friends, chat, social feed, referrals, and game invites
 */

import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import type {
  SocialState,
  Friend,
  FriendRequest,
  ChatMessage,
  ChatRoom,
  SocialActivity,
  Referral,
  ReferralStats,
  GameInvite,
  PlayerProfile,
  SocialSettings,
  SharePlatform,
  ChatType,
} from '../types/social';

export const useSocialStore = create<SocialState>((set, get) => ({
  // Initial State
  friends: [],
  friendRequests: [],
  blockedUsers: [],
  chatRooms: [],
  globalMessages: [],
  unreadMessages: 0,
  activities: [],
  myReferralStats: null,
  referrals: [],
  gameInvites: [],
  myProfile: null,
  settings: {
    allowFriendRequests: true,
    allowGameInvites: true,
    showOnlineStatus: true,
    allowMessagesFrom: 'friends',
    notifyOnFriendRequest: true,
    notifyOnMessage: true,
    notifyOnGameInvite: true,
    shareWinsAutomatically: false,
  },

  // ============ Friend Actions ============

  sendFriendRequest: (to: string, toNickname: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    const myProfile = get().myProfile;
    if (!myProfile) {
      toast.error('Profile not loaded');
      return;
    }

    socket.emit('social:friend_request', {
      to,
      toNickname,
      from: myProfile.address,
      fromNickname: myProfile.nickname,
    });

    toast.success(`Friend request sent to ${toNickname}`);
  },

  acceptFriendRequest: (requestId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:accept_friend', { requestId });

    // Update local state
    set((state) => {
      const request = state.friendRequests.find((r) => r.id === requestId);
      if (!request) return state;

      return {
        friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
        friends: [
          ...state.friends,
          {
            address: request.from,
            nickname: request.fromNickname,
            addedAt: Date.now(),
            isOnline: false,
          },
        ],
      };
    });

    toast.success('Friend request accepted');
  },

  rejectFriendRequest: (requestId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:reject_friend', { requestId });

    set((state) => ({
      friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
    }));

    toast('Friend request rejected');
  },

  removeFriend: (address: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      toast.error('Profile not loaded');
      return;
    }

    socket.emit('social:remove_friend', { from: myProfile.address, to: address });

    set((state) => ({
      friends: state.friends.filter((f) => f.address !== address),
    }));

    toast('Friend removed');
  },

  blockUser: (address: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      toast.error('Profile not loaded');
      return;
    }

    socket.emit('social:block_user', { from: myProfile.address, to: address });

    set((state) => ({
      blockedUsers: [...state.blockedUsers, address],
      friends: state.friends.filter((f) => f.address !== address),
    }));

    toast('User blocked');
  },

  unblockUser: (address: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      toast.error('Profile not loaded');
      return;
    }

    socket.emit('social:unblock_user', { from: myProfile.address, to: address });

    set((state) => ({
      blockedUsers: state.blockedUsers.filter((u) => u !== address),
    }));

    toast('User unblocked');
  },

  // ============ Chat Actions ============

  sendMessage: (type: ChatType, message: string, to?: string, roomId?: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    const myProfile = get().myProfile;
    if (!myProfile) {
      toast.error('Profile not loaded');
      return;
    }

    const chatMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      from: myProfile.address,
      fromNickname: myProfile.nickname,
      to,
      roomId,
      type,
      message,
    };

    socket.emit('social:send_message', chatMessage);

    // Add to local state
    if (type === 'global') {
      set((state) => ({
        globalMessages: [
          ...state.globalMessages,
          { ...chatMessage, id: Date.now().toString(), timestamp: Date.now() },
        ],
      }));
    }
  },

  markMessagesAsRead: (chatRoomId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) return;

    socket.emit('social:mark_read', { chatRoomId });

    set((state) => ({
      chatRooms: state.chatRooms.map((room) =>
        room.id === chatRoomId ? { ...room, unreadCount: 0 } : room
      ),
      unreadMessages: Math.max(
        0,
        state.unreadMessages -
          (state.chatRooms.find((r) => r.id === chatRoomId)?.unreadCount || 0)
      ),
    }));
  },

  loadChatHistory: (chatRoomId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:load_chat', { chatRoomId });
  },

  // ============ Social Feed Actions ============

  postActivity: (activity) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:post_activity', activity);

    toast.success('Activity posted');
  },

  likeActivity: (activityId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:like_activity', { activityId });

    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === activityId ? { ...a, likes: a.likes + 1 } : a
      ),
    }));
  },

  commentOnActivity: (activityId: string, message: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    const myProfile = get().myProfile;
    if (!myProfile) {
      toast.error('Profile not loaded');
      return;
    }

    socket.emit('social:comment_activity', {
      activityId,
      from: myProfile.address,
      fromNickname: myProfile.nickname,
      message,
    });

    toast.success('Comment posted');
  },

  shareActivity: async (activityId: string, platform: SharePlatform) => {
    const activity = get().activities.find((a) => a.id === activityId);
    if (!activity) {
      toast.error('Activity not found');
      return;
    }

    const shareUrl = `${window.location.origin}/?activity=${activityId}`;
    let shareText = `Check out this ${activity.type} on Celo Snake! `;

    if (activity.type === 'win' && activity.data.winAmount) {
      shareText += `Won ${activity.data.winAmount} CELO with ${activity.data.multiplier}x multiplier!`;
    } else if (activity.type === 'achievement' && activity.data.achievementName) {
      shareText += `Unlocked ${activity.data.achievementName} achievement!`;
    } else if (activity.type === 'tournament_win' && activity.data.tournamentName) {
      shareText += `Won ${activity.data.tournamentName} tournament!`;
    }

    try {
      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText
            )}&url=${encodeURIComponent(shareUrl)}`,
            '_blank'
          );
          break;
        case 'discord':
          // Discord doesn't have direct share URL, copy to clipboard
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          toast.success('Copied to clipboard! Share in Discord');
          break;
        case 'telegram':
          window.open(
            `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(
              shareText
            )}`,
            '_blank'
          );
          break;
        case 'whatsapp':
          window.open(
            `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
            '_blank'
          );
          break;
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          toast.success('Copied to clipboard!');
          break;
      }

      // Track share
      const socket = (window as any).multiplayerSocket as Socket;
      if (socket && socket.connected) {
        socket.emit('social:share_activity', { activityId, platform });
      }

      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === activityId ? { ...a, shares: a.shares + 1 } : a
        ),
      }));
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share');
    }
  },

  // ============ Referral Actions ============

  generateReferralCode: () => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    const myProfile = get().myProfile;
    if (!myProfile) {
      toast.error('Profile not loaded');
      return;
    }

    socket.emit('social:generate_referral_code', {
      address: myProfile.address,
    });

    toast.success('Generating referral code...');
  },

  trackReferral: (code: string, referee: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:track_referral', { code, referee });
  },

  claimReferralReward: (referralId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:claim_referral_reward', { referralId });

    toast.success('Claiming referral reward...');
  },

  // ============ Game Invite Actions ============

  sendGameInvite: (invite) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:send_game_invite', invite);

    toast.success(`Game invite sent to ${invite.toNickname}`);
  },

  acceptGameInvite: (inviteId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:accept_game_invite', { inviteId });

    set((state) => ({
      gameInvites: state.gameInvites.filter((i) => i.id !== inviteId),
    }));
  },

  declineGameInvite: (inviteId: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:decline_game_invite', { inviteId });

    set((state) => ({
      gameInvites: state.gameInvites.filter((i) => i.id !== inviteId),
    }));

    toast('Game invite declined');
  },

  // ============ Profile Actions ============

  updateProfile: (updates) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:update_profile', updates);

    set((state) => ({
      myProfile: state.myProfile ? { ...state.myProfile, ...updates } : null,
    }));

    toast.success('Profile updated');
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));

    const socket = (window as any).multiplayerSocket as Socket;
    if (socket && socket.connected) {
      socket.emit('social:update_settings', updates);
    }

    toast.success('Settings updated');
  },

  createProfile: (address: string, nickname: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:create_profile', { address, nickname });
    toast.success('Creating profile...');
  },

  loadProfile: (address: string) => {
    const socket = (window as any).multiplayerSocket as Socket;
    if (!socket || !socket.connected) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('social:load_profile', { address });
  },

  // ============ Utility Actions ============

  fetchFriends: () => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      console.error('No profile found');
      return;
    }

    socket.emit('social:get_friends', { address: myProfile.address });
  },

  fetchFriendRequests: () => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      console.error('No profile found');
      return;
    }

    socket.emit('social:get_friend_requests', { address: myProfile.address });
  },

  fetchActivities: () => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      console.error('No profile found');
      return;
    }

    socket.emit('social:get_activities', { address: myProfile.address });
  },

  fetchReferrals: () => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      console.error('No profile found');
      return;
    }

    socket.emit('social:get_referrals', { address: myProfile.address });
  },

  fetchGameInvites: () => {
    const socket = (window as any).multiplayerSocket as Socket;
    const myProfile = get().myProfile;
    if (!socket || !socket.connected) {
      console.error('Not connected to server');
      return;
    }
    if (!myProfile) {
      console.error('No profile found');
      return;
    }

    socket.emit('social:get_game_invites', { address: myProfile.address });
  },
}));

// Setup socket listeners for social features
export const setupSocialListeners = (socket: Socket) => {
  // Store socket globally for access
  (window as any).multiplayerSocket = socket;

  // Remove all existing social listeners first to prevent duplicates
  socket.off('social:friend_request_received');
  socket.off('social:friend_added');
  socket.off('social:friend_removed');
  socket.off('social:friends_list');
  socket.off('social:friend_requests_list');
  socket.off('social:message_received');
  socket.off('social:activities_list');
  socket.off('social:activity_posted');
  socket.off('social:referral_code_generated');
  socket.off('social:referrals_list');
  socket.off('social:game_invite_received');
  socket.off('social:game_invites_list');
  socket.off('social:profile_loaded');

  // Friends
  socket.on('social:friend_request_received', ({ request }: { request: FriendRequest }) => {
    useSocialStore.setState((state) => ({
      friendRequests: [...state.friendRequests, request],
    }));

    if (useSocialStore.getState().settings.notifyOnFriendRequest) {
      toast(`Friend request from ${request.fromNickname}`, { icon: '👋' });
    }
  });

  socket.on('social:friend_added', ({ friend }: { friend: Friend }) => {
    useSocialStore.setState((state) => ({
      friends: [...state.friends, friend],
    }));
  });

  socket.on('social:friend_removed', ({ address }: { address: string }) => {
    useSocialStore.setState((state) => ({
      friends: state.friends.filter((f) => f.address !== address),
    }));
  });

  socket.on('social:friends_list', ({ friends }: { friends: Friend[] }) => {
    useSocialStore.setState({ friends });
  });

  socket.on('social:friend_requests_list', ({ requests }: { requests: FriendRequest[] }) => {
    useSocialStore.setState({ friendRequests: requests });
  });

  // Chat
  socket.on('social:message_received', ({ message }: { message: ChatMessage }) => {
    useSocialStore.setState((state) => {
      if (message.type === 'global') {
        return { globalMessages: [...state.globalMessages, message] };
      }
      return state;
    });

    if (useSocialStore.getState().settings.notifyOnMessage) {
      toast(`${message.fromNickname}: ${message.message}`, { icon: '💬' });
    }
  });

  // Activities
  socket.on('social:activities_list', ({ activities }: { activities: SocialActivity[] }) => {
    useSocialStore.setState({ activities });
  });

  socket.on('social:activity_posted', ({ activity }: { activity: SocialActivity }) => {
    useSocialStore.setState((state) => ({
      activities: [activity, ...state.activities],
    }));
  });

  // Referrals
  socket.on('social:referral_code_generated', ({ stats }: { stats: ReferralStats }) => {
    useSocialStore.setState({ myReferralStats: stats });
    toast.success('Referral code generated!');
  });

  socket.on('social:referrals_list', ({ referrals, stats }: { referrals: Referral[]; stats: ReferralStats }) => {
    useSocialStore.setState({ referrals, myReferralStats: stats });
  });

  // Game Invites
  socket.on('social:game_invite_received', ({ invite }: { invite: GameInvite }) => {
    useSocialStore.setState((state) => ({
      gameInvites: [...state.gameInvites, invite],
    }));

    if (useSocialStore.getState().settings.notifyOnGameInvite) {
      toast(`Game invite from ${invite.fromNickname}`, { icon: '🎮' });
    }
  });

  socket.on('social:game_invites_list', ({ invites }: { invites: GameInvite[] }) => {
    useSocialStore.setState({ gameInvites: invites });
  });

  // Profile
  socket.on('social:profile_loaded', ({ profile }: { profile: PlayerProfile }) => {
    useSocialStore.setState({ myProfile: profile });
  });
};
