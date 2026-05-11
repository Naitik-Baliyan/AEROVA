import React, { useEffect, useRef } from 'react';
import { Animated, Text, Easing } from 'react-native';

// Leaf emojis pool
const LEAF_CHARS = ['🍃', '🌿', '🍀'];

// Each leaf gets random initial props
const randomBetween = (a, b) => Math.random() * (b - a) + a;

export default function AnimatedLeaf({ screenWidth, screenHeight, delay = 0 }) {
  // Starting position
  const startX = randomBetween(-40, screenWidth * 0.6);
  const startY = randomBetween(-60, screenHeight * 0.5);

  // Animation targets
  const endX = startX + randomBetween(60, 200);
  const endY = startY + randomBetween(100, 350);

  const duration = randomBetween(4000, 8000);
  const size = randomBetween(14, 26);

  // Animated values
  const posX = useRef(new Animated.Value(startX)).current;
  const posY = useRef(new Animated.Value(startY)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(randomBetween(0.6, 1.2))).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const leaf = LEAF_CHARS[Math.floor(Math.random() * LEAF_CHARS.length)];

  useEffect(() => {
    const loop = () => {
      // Reset to start
      posX.setValue(startX);
      posY.setValue(startY);
      rotate.setValue(0);
      opacity.setValue(0);

      Animated.parallel([
        // Fade in then out
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: randomBetween(0.55, 0.95),
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.delay(duration - 1200),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        // Move X with slight wave
        Animated.timing(posX, {
          toValue: endX,
          duration,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        // Move Y downward
        Animated.timing(posY, {
          toValue: endY,
          duration,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          useNativeDriver: true,
        }),
        // Spin for 3D tumbling effect
        Animated.timing(rotate, {
          toValue: randomBetween(2, 5),
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Scale pulse — simulates 3D depth
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: randomBetween(0.4, 0.8),
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: randomBetween(0.9, 1.3),
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => loop());
    };

    const timer = setTimeout(loop, delay);
    return () => clearTimeout(timer);
  }, []);

  const rotateDeg = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        fontSize: size,
        opacity,
        transform: [
          { translateX: posX },
          { translateY: posY },
          { rotate: rotateDeg },
          { scale: scaleAnim },
        ],
      }}
    >
      {leaf}
    </Animated.Text>
  );
}
