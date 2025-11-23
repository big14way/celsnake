import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../config/theme';

const TournamentScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tournaments</Text>
      <Text style={styles.subtitle}>Implementation coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 8,
  },
});

export default TournamentScreen;
