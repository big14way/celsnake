import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import WalletService from '../services/wallet';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [walletConnected, setWalletConnected] = React.useState(false);

  React.useEffect(() => {
    setWalletConnected(WalletService.isConnected());
  }, []);

  const handleConnectWallet = async () => {
    if (WalletService.isMiniPay()) {
      const wallet = await WalletService.connectMiniPay();
      if (wallet) {
        setWalletConnected(true);
      }
    } else {
      await WalletService.openMiniPay();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Celo Snake</Text>
        <Text style={styles.subtitle}>Play, Compete, Earn</Text>
      </View>

      {!walletConnected && (
        <TouchableOpacity style={styles.walletButton} onPress={handleConnectWallet}>
          <Icon name="wallet" size={24} color={colors.text} />
          <Text style={styles.walletButtonText}>Connect Wallet</Text>
        </TouchableOpacity>
      )}

      <View style={styles.gameModesContainer}>
        <Text style={styles.sectionTitle}>Game Modes</Text>

        <TouchableOpacity
          style={[styles.gameModeCard, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Game', { mode: 'single' })}
        >
          <Icon name="game-controller" size={32} color={colors.text} />
          <Text style={styles.gameModeTitle}>Single Player</Text>
          <Text style={styles.gameModeDescription}>Play solo and earn rewards</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameModeCard, { backgroundColor: colors.secondary }]}
          onPress={() => navigation.navigate('MultiplayerLobby')}
        >
          <Icon name="people" size={32} color={colors.text} />
          <Text style={styles.gameModeTitle}>Multiplayer</Text>
          <Text style={styles.gameModeDescription}>Challenge other players</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gameModeCard, { backgroundColor: colors.warning }]}
          onPress={() => navigation.navigate('TournamentLobby')}
        >
          <Icon name="trophy" size={32} color={colors.text} />
          <Text style={styles.gameModeTitle}>Tournaments</Text>
          <Text style={styles.gameModeDescription}>Compete for big prizes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Icon name="medal" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Achievements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Icon name="podium" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  walletButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  walletButtonText: {
    color: colors.text,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  gameModesContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  gameModeCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  gameModeTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  gameModeDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickActions: {
    padding: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    color: colors.text,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
});

export default HomeScreen;
