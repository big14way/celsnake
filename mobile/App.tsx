/**
 * Celo Snake Mobile App
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import AnalyticsService from './src/services/analytics';
import NotificationService from './src/services/notifications';
import { colors } from './src/config/theme';

function App() {
  useEffect(() => {
    // Initialize services
    const initializeApp = async () => {
      try {
        await AnalyticsService.init();
        await NotificationService.init();
        console.log('App services initialized');
      } catch (error) {
        console.error('Failed to initialize app services:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <RootNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
