import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import MainTabNavigator from './MainTabNavigator';
import GameScreen from '../screens/GameScreen';
import MultiplayerLobbyScreen from '../screens/MultiplayerLobbyScreen';
import TournamentLobbyScreen from '../screens/TournamentLobbyScreen';
import TournamentMatchScreen from '../screens/TournamentMatchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import FriendsScreen from '../screens/FriendsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { colors } from '../config/theme';
import { useAnalytics } from '../hooks/useAnalytics';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { logScreenView } = useAnalytics();

  return (
    <NavigationContainer
      onStateChange={(state) => {
        const currentScreen = state?.routes[state.index]?.name;
        if (currentScreen) {
          logScreenView(currentScreen);
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Game"
          component={GameScreen}
          options={{ title: 'Play Game' }}
        />
        <Stack.Screen
          name="MultiplayerLobby"
          component={MultiplayerLobbyScreen}
          options={{ title: 'Multiplayer Lobby' }}
        />
        <Stack.Screen
          name="TournamentLobby"
          component={TournamentLobbyScreen}
          options={{ title: 'Tournament Lobby' }}
        />
        <Stack.Screen
          name="TournamentMatch"
          component={TournamentMatchScreen}
          options={{ title: 'Tournament Match' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Player Profile' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ title: 'Achievements' }}
        />
        <Stack.Screen
          name="Friends"
          component={FriendsScreen}
          options={{ title: 'Friends' }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{ title: 'Leaderboard' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
