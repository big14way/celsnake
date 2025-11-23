import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Game: { mode: 'single' | 'multi' | 'tournament' };
  MultiplayerLobby: undefined;
  TournamentLobby: undefined;
  TournamentMatch: { tournamentId: string; matchId: string };
  Profile: { address?: string };
  Settings: undefined;
  Achievements: undefined;
  Friends: undefined;
  Leaderboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Multiplayer: undefined;
  Tournament: undefined;
  Social: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
