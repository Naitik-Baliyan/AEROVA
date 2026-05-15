import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { supabase } from '../utils/supabase';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Elegant simultaneous scale and fade-in entry
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05, // subtle slow expansion zoom
        duration: 2500,
        useNativeDriver: true,
      }),
    ]).start();

    // 🔐 Proactively restore persistent user session from local storage
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Hold visual for total 2.5 seconds to ensure premium brand impression
        setTimeout(() => {
          if (session && session.user) {
            // 🚀 Found active session token! Blast straight to Home!
            navigation.replace('Home');
          } else {
            // 🛑 No token found, direct to landing screen
            navigation.replace('Auth');
          }
        }, 2500);
      } catch (error) {
        // Safety fallback to Auth
        setTimeout(() => {
          navigation.replace('Auth');
        }, 2500);
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/logo_refined.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Match pure white refined background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: 300,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
