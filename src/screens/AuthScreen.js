import React, { useState, useRef, useCallback } from 'react';
import { Animated, PanResponder } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography, spacing, radius } from '../theme/typography';
import AnimatedLeaf from '../components/AnimatedLeaf';
import { supabase } from '../utils/supabase';

const { width, height } = Dimensions.get('window');

// Number of flying leaves
const LEAF_COUNT = 18;
const leaves = Array.from({ length: LEAF_COUNT }, (_, i) => ({
  id: i,
  delay: i * 350,
}));

// ─── Input Field ──────────────────────────────────────────────────────
function InputField({ iconName, placeholder, value, onChangeText, secureTextEntry, keyboardType }) {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
      {/* Left Feather icon — turns green on focus */}
      <Feather
        name={iconName}
        size={18}
        color={focused ? colors.primary : colors.textMuted}
        style={styles.inputIcon}
      />

      <TextInput
        style={styles.inputText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPass}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {/* Eye toggle — Feather eye / eye-off */}
      {secureTextEntry && (
        <TouchableOpacity
          onPress={() => setShowPass(!showPass)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather
            name={showPass ? 'eye' : 'eye-off'}
            size={18}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Modern Google Icon (SVG) ────────────────────────────────────────
function GoogleIcon({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84-.18-.68z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

// ─── Google Button ────────────────────────────────────────────────────
function GoogleButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.socialBtn} onPress={onPress} activeOpacity={0.75}>
      <GoogleIcon size={22} />
      <Text style={styles.socialLabel}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

// ─── Main Auth Screen ─────────────────────────────────────────────────
export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';
  const slideAnim = useRef(new Animated.Value(0)).current;
  const modeRef = useRef(mode);

  // Smooth slide transition between modes
  const switchMode = useCallback((newMode) => {
    if (modeRef.current === newMode) return;
    const goingToSignup = newMode === 'signup';
    const outDir = goingToSignup ? -width : width;

    Animated.timing(slideAnim, {
      toValue: outDir,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      modeRef.current = newMode;
      setMode(newMode);
      setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
      slideAnim.setValue(-outDir);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 11,
      }).start();
    });
  }, [slideAnim]);

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 15 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -50) switchMode('signup');   // swipe left → signup
        else if (gs.dx > 50) switchMode('login'); // swipe right → login
      },
    })
  ).current;

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      Alert.alert('Validation Error', 'Please fill out all credentials.');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('Validation Error', 'Please provide your name to setup the cloud profile.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // 🔐 Real Supabase Authentication Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPass,
        });

        if (error) throw error;

        if (data?.user) {
          // Instantly check if a completed medical profile exists for routing
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();

          if (existingProfile) {
            // Verified returning user: Direct to Premium Dashboard
            navigation.replace('Home');
          } else {
            // Fresh returning user: Direct to Setup wizard
            navigation.replace('Onboarding');
          }
        }
      } else {
        // 🆕 Real Supabase Cloud Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPass,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        // Detect auto-session state or force confirmation notice
        if (data?.session) {
          Alert.alert('Success', 'Your secure AEROVA account was successfully created!');
          navigation.replace('Onboarding');
        } else if (data?.user) {
          Alert.alert(
            'Verify Email',
            'We have sent a secure verification email. Please confirm to unlock access!',
            [{ text: 'OK', onPress: () => switchMode('login') }]
          );
        }
      }
    } catch (err) {
      Alert.alert('Authentication Failed', err.message || 'A connection failure occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Full-screen nature background ── */}
      <Image
        source={require('../../assets/images/auth_bg.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />

      {/* ── Flying Leaves Layer ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {leaves.map((leaf) => (
          <AnimatedLeaf
            key={leaf.id}
            screenWidth={width}
            screenHeight={height}
            delay={leaf.delay}
          />
        ))}
      </View>

      {/* ── AEROVA Branding (top center) ── */}
      <View style={styles.brandingRow}>
        <Text style={styles.brandLeft}>AER</Text>
        <View style={styles.brandLeafCircle}>
          <Text style={styles.brandLeafEmoji}>🍃</Text>
        </View>
        <Text style={styles.brandRight}>VA</Text>
      </View>
      <Text style={styles.tagline}>Know your air. Protect yourself.</Text>

      {/* ── Auth Card (bottom half) ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kavFlex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card} {...panResponder.panHandlers}>
            {/* Card Title — slides with content */}
            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              <Text style={styles.cardTitle}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.cardSubtitle}>
                {isLogin ? 'Login to your account' : 'Sign up to get started'}
              </Text>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <InputField
                  iconName="user"
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                />
              )}

              <InputField
                iconName="mail"
                placeholder="Username or Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <InputField
                iconName="lock"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {!isLogin && (
                <InputField
                  iconName="lock"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              )}

              {isLogin && (
                <TouchableOpacity style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Primary Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textWhite} size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {isLogin ? 'Login' : 'Sign Up'}
                    </Text>
                    <Text style={styles.primaryBtnLeaf}>🍃</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Button */}
              <GoogleButton />
            </View>
            </Animated.View>

            {/* Switch mode */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity onPress={() => switchMode(isLogin ? 'signup' : 'login')}>
                <Text style={styles.switchLink}>
                  {isLogin ? 'Sign Up' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dots indicator */}
            <View style={styles.dotsRow}>
              <View style={[styles.dot, isLogin && styles.dotActive]} />
              <View style={[styles.dot, !isLogin && styles.dotActive]} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Background
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },

  // Branding
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.13,
  },
  brandLeft: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  brandLeafCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  brandLeafEmoji: {
    fontSize: 18,
  },
  brandRight: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 6,
    opacity: 0.85,
  },

  // KAV
  kavFlex: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingBottom: 60,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: spacing.xl,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Form
  form: {
    gap: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputIcon: {
    fontSize: 17,
    marginRight: spacing.sm,
    opacity: 0.6,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeIcon: {
    fontSize: 17,
    opacity: 0.5,
  },

  // Forgot
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -2,
    marginBottom: 2,
  },
  forgotText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },

  // Primary button
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    marginTop: 4,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryBtnLeaf: {
    fontSize: 18,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 10,
  },

  // Social buttons
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.card,
    gap: 10,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA4335',
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  switchText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
});
