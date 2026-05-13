import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { typography, spacing, radius } from '../theme/typography';
import { colors } from '../theme/colors';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [aqi, setAqi] = useState(58); // Moderate
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const animatedAqi = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Drawer animation values
  const drawerWidth = width * 0.75;
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start Circle Gauge fill
    Animated.timing(animatedAqi, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: true,
    }).start();

    // Soft slow breathing animation for the logo-inspired ambient backdrop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const toggleDrawer = (shouldOpen) => {
    if (shouldOpen) setIsDrawerOpen(true);
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: shouldOpen ? 0 : -drawerWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: shouldOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!shouldOpen) setIsDrawerOpen(false);
    });
  };

  // Gauge Setup (Slightly larger for beautiful center focus)
  const size = 240;
  const strokeWidth = 16;
  const center = size / 2;
  const radiusMetric = (size - strokeWidth - 20) / 2;
  const circumference = radiusMetric * 2 * Math.PI;
  
  const strokeDashoffset = animatedAqi.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference * (1 - (aqi / 300))],
  });

  const blobScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  // Harmonized Logo Palette
  const getAqiColor = (score) => {
    if (score <= 50) return '#2D5A27'; // Dark Emerald Logo Green
    if (score <= 100) return '#E8B034'; // Soft Warm Amber
    if (score <= 150) return '#E07A5F'; // Soft Warm Coral
    return '#C94C4C'; // Soft Muted Red
  };

  const getAqiText = (score) => {
    if (score <= 50) return 'Satisfactory';
    if (score <= 100) return 'Moderate';
    if (score <= 150) return 'Unhealthy';
    return 'Hazardous';
  };

  const activeColor = getAqiColor(aqi);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* 🌿 Pure Canvas & Soft Organic Background Glows */}
      <View style={styles.whiteCanvas} />

      <Animated.View
        style={[
          styles.glowBlob,
          {
            backgroundColor: '#EBF7E9', 
            top: -100,
            left: -100,
            transform: [{ scale: blobScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.glowBlob,
          {
            backgroundColor: '#F6FAF5',
            top: 350,
            right: -120,
            width: 300,
            height: 300,
            borderRadius: 150,
            transform: [{ scale: blobScale }],
          },
        ]}
      />

      {/* Animated Glassmorphic Drawer Menu Overlay */}
      {isDrawerOpen && (
        <Animated.View 
          style={[
            styles.drawerOverlay,
            { opacity: overlayOpacity }
          ]}
          pointerEvents={isDrawerOpen ? 'auto' : 'none'}
        >
          <TouchableOpacity 
            style={styles.fillTouch}
            activeOpacity={1}
            onPress={() => toggleDrawer(false)}
          />
        </Animated.View>
      )}

      {/* The Custom Slide-In Drawer Container */}
      <Animated.View 
        style={[
          styles.drawerContainer,
          { width: drawerWidth, transform: [{ translateX: slideAnim }] }
        ]}
      >
        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatarWrapper}>
            <MaterialCommunityIcons name="account-circle" size={54} color={colors.primary} />
          </View>
          <Text style={styles.drawerUserName}>Rahul Sharma</Text>
          <Text style={styles.drawerUserHandle}>@rahul_aerova</Text>
        </View>

        <View style={styles.drawerDivider} />

        <ScrollView style={styles.drawerMenuWrapper}>
          {[
            { name: 'My Profile', icon: 'account-outline' },
            { name: 'Health Shield Info', icon: 'shield-check-outline' },
            { name: 'Notifications', icon: 'bell-outline' },
            { name: 'Historical Analytics', icon: 'chart-timeline-variant' },
            { name: 'App Settings', icon: 'cog-outline' },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.drawerMenuItem}>
              <MaterialCommunityIcons name={item.icon} size={22} color="#5A6D60" style={{marginRight: 16}} />
              <Text style={styles.drawerMenuText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.drawerFooter}>
          <TouchableOpacity style={styles.logoutBtn}>
            <MaterialCommunityIcons name="logout" size={18} color="#C94C4C" style={{marginRight: 10}} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>v1.0.0 Premium</Text>
        </View>
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Header Block: Enhanced Safety Margins and Placement */}
          <View style={styles.header}>
            <View style={styles.topActionRow}>
              <TouchableOpacity 
                style={styles.actionBtn} 
                onPress={() => toggleDrawer(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="menu" size={26} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Feather name="bell" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.headerInfoRow}>
              <View style={styles.locChip}>
                <Feather name="map-pin" size={12} color={colors.primary} style={{marginRight: 6}} />
                <Text style={styles.locChipText}>New Delhi, DL</Text>
              </View>
              <Text style={styles.welcomeTitle}>Good Morning, Rahul</Text>
            </View>
          </View>

          {/* ⭕ HERO VIEWPORT: Only the AQI and The Smart Tip */}
          <View style={styles.heroViewport}>
            {/* 1. THE MAIN AQI GAUGE */}
            <View style={styles.focusedGaugeWrapper}>
              <Svg width={size} height={size}>
                <Defs>
                  <SvgGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#8DC483" />
                    <Stop offset="100%" stopColor={activeColor} />
                  </SvgGradient>
                </Defs>
                
                {/* Outer faint backing orbit */}
                <Circle
                  cx={center}
                  cy={center}
                  r={radiusMetric + 10}
                  stroke="rgba(45, 90, 39, 0.03)"
                  strokeWidth={1}
                  fill="none"
                />

                {/* Track */}
                <Circle
                  cx={center}
                  cy={center}
                  r={radiusMetric}
                  stroke="rgba(0,0,0,0.03)"
                  strokeWidth={strokeWidth - 4}
                  fill="none"
                />
                
                {/* Filled Vector Ring */}
                <AnimatedCircle
                  cx={center}
                  cy={center}
                  r={radiusMetric}
                  stroke="url(#brandGrad)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform={`rotate(-90, ${center}, ${center})`}
                />
              </Svg>

              {/* Inside Stats */}
              <View style={styles.centerMetricWrapper}>
                <Text style={styles.aqiLabel}>AQI SCORE</Text>
                <Text style={styles.aqiBigNum}>{aqi}</Text>
                <View style={[styles.safetyBadge, { backgroundColor: activeColor + '15' }]}>
                  <Text style={[styles.safetyText, { color: activeColor }]}>{getAqiText(aqi)}</Text>
                </View>
              </View>
            </View>

            {/* 2. THE PRIMARY SMART TIP CARD (Highly prominent as requested) */}
            <LinearGradient
              colors={['#FFFFFF', '#F9FDF9']}
              style={styles.prominentTipCard}
              start={{x:0, y:0}}
              end={{x:1, y:1}}
            >
              <View style={styles.tipHeaderRow}>
                <View style={styles.tipIconCirc}>
                  <MaterialCommunityIcons name="shield-star" size={22} color={colors.primary} />
                </View>
                <Text style={styles.tipBadgeLabel}>YOUR AEROVA SHIELD</Text>
              </View>
              <Text style={styles.mainTipMessage}>
                "Hey Rahul, the air looks pretty fair! However, because you selected <Text style={{fontWeight:'bold', color: colors.primary}}>Asthma</Text> in your profile, you might want to avoid heavy cardio outdoors during noon heat today. Stay fresh! 🌿"
              </Text>
            </LinearGradient>
          </View>

          {/* 📊 SUB-DETAILS REVEAL SECTION (Clean & Secondary, below first page view) */}
          <View style={styles.revealIndicatorRow}>
            <View style={styles.lineDash} />
            <Text style={styles.revealLabel}>Scroll for Details</Text>
            <View style={styles.lineDash} />
          </View>

          {/* Grid & Forecast now cleanly sitting "below the fold" */}
          <View style={styles.secondarySection}>
            <Text style={styles.gridSectionTitle}>Live Pollutants</Text>
            <View style={styles.gridWrapper}>
              {[
                { name: 'PM 2.5', val: '36', desc: 'Moderate', clr: '#E8B034' },
                { name: 'PM 10', val: '74', desc: 'Healthy', clr: '#2D5A27' },
                { name: 'NO₂ Gas', val: '18', desc: 'Excellent', clr: '#2D5A27' },
                { name: 'O₃ Gas', val: '42', desc: 'Healthy', clr: '#2D5A27' },
              ].map((el, idx) => (
                <View key={idx} style={styles.miniMetricBox}>
                  <View style={styles.miniHeader}>
                    <Text style={styles.miniTitle}>{el.name}</Text>
                    <View style={[styles.miniDot, {backgroundColor: el.clr}]} />
                  </View>
                  <Text style={styles.miniVal}>{el.val}</Text>
                  <Text style={[styles.miniDesc, {color: el.clr}]}>{el.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hourly Slider */}
          <View style={[styles.secondarySection, { marginBottom: 60 }]}>
            <Text style={styles.gridSectionTitle}>24-Hour Trend</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { t: 'Now', a: 58, active: true },
                { t: '2 PM', a: 64 },
                { t: '4 PM', a: 70 },
                { t: '6 PM', a: 88 },
                { t: '8 PM', a: 104 },
                { t: '10 PM', a: 98 },
              ].map((bar, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.trendCol,
                    bar.active && styles.trendColActive
                  ]}
                >
                  <Text style={[styles.trendTime, bar.active && styles.whiteTxt]}>{bar.t}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barHeight, { height: bar.a * 0.35, backgroundColor: getAqiColor(bar.a) }]} />
                  </View>
                  <Text style={[styles.trendAqi, bar.active && styles.whiteTxt]}>{bar.a}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Custom Sidebar Navigation Styles
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 45, 36, 0.4)',
    zIndex: 1000,
  },
  fillTouch: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1001,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 30 : 60,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 25,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  drawerAvatarWrapper: {
    marginBottom: 16,
  },
  drawerUserName: {
    fontSize: 20,
    fontWeight: typography.extrabold,
    color: '#1E2D24',
  },
  drawerUserHandle: {
    fontSize: typography.sm,
    color: '#8E9C93',
    marginTop: 2,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#EFF3EF',
    marginHorizontal: 24,
    marginBottom: 20,
  },
  drawerMenuWrapper: {
    flex: 1,
    paddingHorizontal: 12,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 4,
  },
  drawerMenuText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: '#1E2D24',
  },
  drawerFooter: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#EFF3EF',
    paddingTop: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: '#C94C4C',
  },
  versionText: {
    fontSize: typography.xs,
    color: '#A8B3AA',
  },
  whiteCanvas: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAFCFA', 
  },
  glowBlob: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    opacity: 0.55,
  },
  scrollContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    // Boosted Padding Top to completely clear system Status Bars on all devices
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 24 : 20,
    marginBottom: spacing.xxl,
  },
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EFE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  headerInfoRow: {
    alignItems: 'flex-start',
  },
  locChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 90, 39, 0.06)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: 10,
  },
  locChipText: {
    fontSize: typography.xs,
    fontWeight: typography.extrabold,
    color: '#2D5A27',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: typography.extrabold,
    color: '#1E2D24',
    letterSpacing: -0.8,
  },
  profileIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EFE8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  heroViewport: {
    alignItems: 'center',
    // This ensures AQI + Tip comfortably fill the initial page screen height
    minHeight: height * 0.58,
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  focusedGaugeWrapper: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerMetricWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aqiLabel: {
    fontSize: 11,
    fontWeight: typography.extrabold,
    color: '#8E9C93',
    letterSpacing: 1.5,
  },
  aqiBigNum: {
    fontSize: 68,
    fontWeight: typography.bold,
    color: '#1E2D24',
    letterSpacing: -2,
    marginVertical: -2,
  },
  safetyBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  safetyText: {
    fontSize: 11,
    fontWeight: typography.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  prominentTipCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E6EFE5',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginTop: 15,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tipIconCirc: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0F9EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipBadgeLabel: {
    fontSize: 11,
    fontWeight: typography.extrabold,
    color: colors.primary,
    letterSpacing: 1,
  },
  mainTipMessage: {
    fontSize: typography.base,
    color: '#5A6D60',
    lineHeight: 24,
    fontWeight: typography.medium,
  },
  revealIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    opacity: 0.6,
  },
  lineDash: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6EFE5',
    marginHorizontal: 15,
  },
  revealLabel: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: '#8E9C93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondarySection: {
    marginBottom: spacing.xxl,
  },
  gridSectionTitle: {
    fontSize: typography.base,
    fontWeight: typography.extrabold,
    color: '#1E2D24',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  miniMetricBox: {
    width: (width - spacing.xl * 2 - 12) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFF3EF',
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  miniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  miniTitle: {
    fontSize: typography.xs,
    fontWeight: typography.bold,
    color: '#8E9C93',
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniVal: {
    fontSize: 24,
    fontWeight: typography.extrabold,
    color: '#1E2D24',
  },
  miniDesc: {
    fontSize: 11,
    fontWeight: typography.extrabold,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  trendCol: {
    width: 68,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFF3EF',
    marginRight: 10,
    alignItems: 'center',
  },
  trendColActive: {
    backgroundColor: '#2D5A27',
    borderColor: '#2D5A27',
  },
  trendTime: {
    fontSize: 11,
    fontWeight: typography.bold,
    color: '#8E9C93',
  },
  whiteTxt: {
    color: '#FFFFFF',
  },
  barTrack: {
    width: 6,
    height: 45,
    backgroundColor: '#F6FAF5',
    borderRadius: 3,
    marginVertical: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barHeight: {
    width: '100%',
    borderRadius: 3,
  },
  trendAqi: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: '#1E2D24',
  },
});
