import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography, spacing, radius } from '../theme/typography';
import { Feather } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Breathe in Cleanliness',
    description: 'Real-time AI tracking monitors pollution across the city keeping you informed and secure.',
    image: require('../../assets/images/onboard1.webp'),
    accent: '#2D5A27', // Green
  },
  {
    id: '2',
    title: 'Measure Every Breath',
    description: 'Analyze accurate AQI stats and predict conditions before stepping out into the city haze.',
    image: require('../../assets/images/onboard2.webp'),
    accent: '#E67E22', // Warn Orange
  },
  {
    id: '3',
    title: 'Reclaim Your Streets',
    description: 'Personalized health safety warnings for clean pathways, so your lifestyle stays undisturbed.',
    image: require('../../assets/images/onboard3.webp'),
    accent: '#2D5A27', 
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.replace('ProfileSetup');
    }
  };

  const handleSkip = () => {
    navigation.replace('ProfileSetup');
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        {/* Top Artistic Image */}
        <View style={styles.imageWrapper}>
          <Image source={item.image} style={styles.illustration} resizeMode="cover" />
          
          {/* Professional gradient fade to blend the image with the background */}
          <LinearGradient
            colors={['transparent', colors.backgroundMist]}
            style={styles.bottomFade}
          />
        </View>

        {/* Content Section (Takes up approx 40% height) */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header skip button */}
      {currentIndex < ONBOARDING_DATA.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={32}
      />

      {/* Bottom Navigation Row */}
      <View style={styles.footer}>
        {currentIndex === ONBOARDING_DATA.length - 1 ? (
          // Full Width High-Emphasis Get Started Button for Final Screen
          <TouchableOpacity
            style={styles.fullGetStartedBtn}
            activeOpacity={0.85}
            onPress={handleNext}
          >
            <Text style={styles.fullGsText}>Get Started</Text>
            <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : (
          <>
            {/* Standard pagination logic for previous screens */}
            <View style={styles.paginator}>
              {ONBOARDING_DATA.map((_, index) => {
                const inputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ];

                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [10, 24, 10],
                  extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.4, 1, 0.4],
                  extrapolate: 'clamp',
                });

                const dotBg = scrollX.interpolate({
                  inputRange,
                  outputRange: ['#AAB8A3', '#2D5A27', '#AAB8A3'],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={index.toString()}
                    style={[
                      styles.dot,
                      { width: dotWidth, opacity, backgroundColor: dotBg },
                    ]}
                  />
                );
              })}
            </View>

            {/* Interactive Circular Next Button */}
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Feather name="chevron-right" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMist, // Ultra light beige/green mist
  },
  slide: {
    width: width,
    flex: 1,
  },
  imageWrapper: {
    width: width,
    height: height * 0.58,
    overflow: 'hidden',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.extrabold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  description: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.85,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xxxl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  paginator: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fullGetStartedBtn: {
    flex: 1,
    height: 60,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // Premium Shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fullGsText: {
    color: colors.textWhite,
    fontSize: typography.lg,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  skipBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: spacing.xl,
    zIndex: 100,
    padding: spacing.sm,
  },
  skipText: {
    color: colors.textSecondary,
    fontWeight: typography.semibold,
    fontSize: typography.base,
  },
});
