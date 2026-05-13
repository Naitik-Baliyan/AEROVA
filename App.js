import React from 'react';
import { View, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BreatheScreen from './src/screens/BreatheScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  // Standard mobile aspect ratio constraint on Web
  const constrainedWidth = isWeb ? Math.min(width, 430) : '100%';

  const renderApp = () => (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Breathe" component={BreatheScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        <View style={[styles.phoneFrame, { width: constrainedWidth }]}>
          {renderApp()}
        </View>
      </View>
    );
  }

  return renderApp();
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light modern backdrop outside the phone
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneFrame: {
    flex: 1,
    backgroundColor: '#fff',
    height: '100%',
    // Subtle elevation effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
});
