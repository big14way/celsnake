import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
import { FEATURES } from '../config/constants';
import StorageService from './storage';

export const NotificationService = {
  // Initialize notification service
  init: async () => {
    if (!FEATURES.PUSH_NOTIFICATIONS) return;

    try {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        await NotificationService.setupNotificationHandlers();
        await NotificationService.createNotificationChannels();
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  },

  // Get FCM token
  getToken: async (): Promise<string | null> => {
    try {
      const token = await messaging().getToken();
      StorageService.set('fcm_token', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  },

  // Create notification channels (Android)
  createNotificationChannels: async () => {
    if (Platform.OS !== 'android') return;

    try {
      await notifee.createChannel({
        id: 'game_events',
        name: 'Game Events',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [300, 500],
      });

      await notifee.createChannel({
        id: 'tournament_updates',
        name: 'Tournament Updates',
        importance: AndroidImportance.HIGH,
        vibration: true,
      });

      await notifee.createChannel({
        id: 'social_notifications',
        name: 'Social Notifications',
        importance: AndroidImportance.DEFAULT,
      });

      await notifee.createChannel({
        id: 'achievements',
        name: 'Achievements',
        importance: AndroidImportance.HIGH,
      });
    } catch (error) {
      console.error('Failed to create notification channels:', error);
    }
  },

  // Setup notification handlers
  setupNotificationHandlers: async () => {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
      await NotificationService.displayNotification(remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      await NotificationService.displayNotification(remoteMessage);
    });

    // Handle notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      NotificationService.handleNotificationPress(remoteMessage);
    });

    // Check if app was opened from a notification
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('App opened from notification:', initialNotification);
      NotificationService.handleNotificationPress(initialNotification);
    }

    // Handle notifee events
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Notification pressed:', detail.notification);
      }
    });
  },

  // Display notification using notifee
  displayNotification: async (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ) => {
    try {
      const { notification, data } = remoteMessage;
      if (!notification) return;

      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        android: {
          channelId: (typeof data?.channelId === 'string' ? data.channelId : undefined) || 'game_events',
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
        data: data as Record<string, string>,
      });
    } catch (error) {
      console.error('Failed to display notification:', error);
    }
  },

  // Handle notification press
  handleNotificationPress: (
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ) => {
    const { data } = remoteMessage;
    // Navigate based on notification type
    // This will be implemented with navigation service
    console.log('Handle notification press with data:', data);
  },

  // Send local notification
  sendLocalNotification: async (
    title: string,
    body: string,
    channelId: string = 'game_events',
    data?: any
  ) => {
    try {
      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
        data,
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  },

  // Game-specific notifications
  notifyGameInvite: async (fromPlayer: string) => {
    await NotificationService.sendLocalNotification(
      'Game Invitation',
      `${fromPlayer} invited you to play!`,
      'game_events',
      { type: 'game_invite', fromPlayer }
    );
  },

  notifyTournamentStart: async (tournamentName: string) => {
    await NotificationService.sendLocalNotification(
      'Tournament Starting',
      `${tournamentName} is about to begin!`,
      'tournament_updates',
      { type: 'tournament_start', tournamentName }
    );
  },

  notifyAchievement: async (achievementName: string) => {
    await NotificationService.sendLocalNotification(
      'Achievement Unlocked!',
      `You've unlocked: ${achievementName}`,
      'achievements',
      { type: 'achievement', achievementName }
    );
  },

  notifyFriendRequest: async (fromPlayer: string) => {
    await NotificationService.sendLocalNotification(
      'New Friend Request',
      `${fromPlayer} sent you a friend request`,
      'social_notifications',
      { type: 'friend_request', fromPlayer }
    );
  },
};

export default NotificationService;
