import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography, radius, spacing } from '../theme/typography';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const BREATH_MODES = [
  {
    id: '478',
    name: 'Detox Lung Expansion',
    desc: 'Great for high-smog recovery.',
    pattern: [
      { phase: 'Inhale', duration: 4, cue: 'Breathe in deeply through your nose...' },
      { phase: 'Hold', duration: 7, cue: 'Gently hold and retain...' },
      { phase: 'Exhale', duration: 8, cue: 'Release fully with an exhale...' },
    ],
  },
  {
    id: 'box',
    name: 'Box Pranayama',
    desc: 'Calm heart & clear airway.',
    pattern: [
      { phase: 'Inhale', duration: 4, cue: 'Inhale slowly...' },
      { phase: 'Hold', duration: 4, cue: 'Hold...' },
      { phase: 'Exhale', duration: 4, cue: 'Exhale...' },
      { phase: 'Hold', duration: 4, cue: 'Hold empty...' },
    ],
  },
  {
    id: 'relax',
    name: 'Quick Reliever',
    desc: 'Short & easy clearing flow.',
    pattern: [
      { phase: 'Inhale', duration: 4, cue: 'Breathe in...' },
      { phase: 'Exhale', duration: 6, cue: 'Let it all out...' },
    ],
  },
];

// Offline high-fidelity royalty free meditation background loop
const AMBIENT_SOUND = require('../assets/sounds/meditation.m4a');

export default function BreatheScreen({ navigation }) {
  const [selectedMode, setSelectedMode] = useState(BREATH_MODES[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Audio Ref
  const soundRef = useRef(null);
  
  // Animation Values
  const circleScale = useRef(new Animated.Value(1)).current;
  const circleOpacity = useRef(new Animated.Value(0.6)).current;
  
  const timerInterval = useRef(null);

  const currentPhase = selectedMode.pattern[currentPhaseIdx];

  // Setup Audio on start
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return () => {
      stopSession();
    };
  }, []);

  // Handle audio play/pause states
  useEffect(() => {
    if (isActive && soundEnabled) {
      playBackgroundTrack();
    } else {
      pauseBackgroundTrack();
    }
  }, [isActive, soundEnabled]);

  const playBackgroundTrack = async () => {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          AMBIENT_SOUND,
          { shouldPlay: true, isLooping: true, volume: 0.35 }
        );
        soundRef.current = sound;
      } else {
        await soundRef.current.playAsync();
      }
    } catch (err) {
      console.log('Local Audio Playback Error:', err);
    }
  };

  const pauseBackgroundTrack = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    } catch (err) {
      console.log('Audio Pause Error:', err);
    }
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentPhaseIdx(0);
    const firstStep = selectedMode.pattern[0];
    setTimeLeft(firstStep.duration);
    triggerPhaseAnimation(firstStep.phase, firstStep.duration);
    startTickTimer(0, firstStep.duration);
  };

  const stopSession = async () => {
    setIsActive(false);
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    // Reset visual bubble
    Animated.parallel([
      Animated.spring(circleScale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(circleOpacity, { toValue: 0.6, useNativeDriver: true })
    ]).start();
  };
  const triggerPhaseAnimation = (phase, duration) => {
    let targetScale = 1;
    let targetOpacity = 0.6;

    if (phase === 'Inhale') {
      targetScale = 1.85;
      targetOpacity = 0.95;
    } else if (phase === 'Hold') {
      targetScale = 1.85;
      targetOpacity = 0.85;
    } else {
      targetScale = 1.0;
      targetOpacity = 0.5;
    }

    Animated.parallel([
      Animated.timing(circleScale, {
        toValue: targetScale,
        duration: duration * 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacity, {
        toValue: targetOpacity,
        duration: duration * 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  };

  const startTickTimer = (phaseIdx, duration) => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    
    let localTimeLeft = duration;
    setTimeLeft(localTimeLeft);

    timerInterval.current = setInterval(() => {
      localTimeLeft -= 1;
      
      if (localTimeLeft <= 0) {
        // Advance to next phase
        const nextPhaseIdx = (phaseIdx + 1) % selectedMode.pattern.length;
        const nextPhase = selectedMode.pattern[nextPhaseIdx];
        
        setCurrentPhaseIdx(nextPhaseIdx);
        triggerPhaseAnimation(nextPhase.phase, nextPhase.duration);
        
        clearInterval(timerInterval.current);
        startTickTimer(nextPhaseIdx, nextPhase.duration);
      } else {
        setTimeLeft(localTimeLeft);
      }
    }, 1000);
  };

  const toggleSoundSetting = () => setSoundEnabled(!soundEnabled);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* 🌅 Deep Serene Zen Gradient Backdrop */}
      <LinearGradient
        colors={isActive ? ['#0D2414', '#183D24'] : ['#224A2E', '#3A6E47']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Minimal Floating Control Bar */}
      <View style={styles.topControlBar}>
        <TouchableOpacity 
          style={styles.backCircleBtn} 
          onPress={async () => {
            await stopSession();
            navigation.replace('Home');
          }}
        >
          <Feather name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.soundSwitchesRow}>
          <TouchableOpacity 
            style={[styles.controlIconBtn, !soundEnabled && styles.disabledBtn]} 
            onPress={toggleSoundSetting}
          >
            <Feather name={soundEnabled ? "music" : "volume-x"} size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainVisualCenter}>
        {/* The Glowing Breathing Halo */}
        <View style={styles.haloOuterRing}>
          <Animated.View 
            style={[
              styles.breathingCoreOrb,
              {
                transform: [{ scale: circleScale }],
                opacity: circleOpacity,
                backgroundColor: currentPhase?.phase === 'Inhale' ? '#A5FFAA' : 
                                currentPhase?.phase === 'Hold' ? '#5ECF84' : '#328D53'
              }
            ]}
          />
          
          {/* Absolute Centered Instructional Text */}
          <View style={styles.orbOverlayTextPanel}>
            {isActive ? (
              <>
                <Text style={styles.actionLabelText}>{currentPhase?.phase.toUpperCase()}</Text>
                <Text style={styles.timerCounterText}>{timeLeft}</Text>
              </>
            ) : (
              <Feather name="wind" size={48} color="#FFF" opacity={0.7} />
            )}
          </View>
        </View>

        {/* Live Text Cue Box */}
        <View style={styles.cueContainer}>
          <Text style={styles.cueText}>
            {isActive ? currentPhase?.cue : 'Select a routine below and tap Start to synchronize your lungs.'}
          </Text>
        </View>
      </View>

      {/* Bottom Settings Section */}
      <View style={styles.bottomPanelBlock}>
        {!isActive ? (
          <>
            <Text style={styles.panelHeaderLabel}>Select Breathing Ritual</Text>
            <View style={styles.optionsCarousel}>
              {BREATH_MODES.map((m) => {
                const isSel = selectedMode.id === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedMode(m)}
                    style={[styles.ritualCard, isSel && styles.ritualCardActive]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.ritualBadge, isSel && styles.ritualBadgeActive]}>
                      <Feather name={isSel ? "check" : "circle"} size={14} color={isSel ? '#FFF' : '#A3B5A9'} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.ritualTitle, isSel && styles.ritualTitleActive]}>{m.name}</Text>
                      <Text style={styles.ritualDesc}>{m.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity 
              style={styles.actionTriggerBtn}
              onPress={startSession}
            >
              <LinearGradient
                colors={['#5ECF84', '#2D9E5A']}
                start={{x:0,y:0}} end={{x:1,y:1}}
                style={styles.gradBtnContent}
              >
                <Feather name="play" size={18} color="#FFF" style={{marginRight: 8}} />
                <Text style={styles.actionBtnText}>Begin Sanctuary Flow</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.activeControlsRow}>
            <Text style={styles.ritualSessionTitle}>{selectedMode.name}</Text>
            <Text style={styles.ritualSessionStatus}>Sonic Engine: Active 🔊🌿</Text>
            
            <TouchableOpacity 
              style={styles.stopSessionBtn}
              onPress={stopSession}
            >
              <Feather name="square" size={16} color="#FF6B6B" style={{marginRight: 8}} />
              <Text style={styles.stopBtnText}>End Breathing Session</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topControlBar: {
    height: Platform.OS === 'ios' ? 64 : 80,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundSwitchesRow: {
    flexDirection: 'row',
  },
  controlIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: 'rgba(255,100,100,0.2)',
    opacity: 0.7,
  },
  mainVisualCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haloOuterRing: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  breathingCoreOrb: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: (width * 0.28) / 2,
    shadowColor: '#5ECF84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 15,
  },
  orbOverlayTextPanel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabelText: {
    fontFamily: typography.bold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  timerCounterText: {
    fontFamily: typography.bold,
    fontSize: 46,
    color: '#FFFFFF',
    marginTop: 2,
  },
  cueContainer: {
    marginTop: 50,
    paddingHorizontal: 40,
    height: 60,
    justifyContent: 'center',
  },
  cueText: {
    fontFamily: typography.medium,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPanelBlock: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  panelHeaderLabel: {
    fontFamily: typography.bold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  optionsCarousel: {
    marginBottom: 20,
  },
  ritualCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F8F6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#EEF2EF',
    alignItems: 'center',
  },
  ritualCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FAFDFC',
  },
  ritualBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D3DFD7',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ritualBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ritualTitle: {
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: '#4A5C50',
  },
  ritualTitleActive: {
    color: colors.primary,
    fontFamily: typography.bold,
  },
  ritualDesc: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: '#8A9C90',
    marginTop: 2,
  },
  actionTriggerBtn: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
  },
  gradBtnContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: typography.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  activeControlsRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  ritualSessionTitle: {
    fontFamily: typography.bold,
    fontSize: 18,
    color: colors.text,
  },
  ritualSessionStatus: {
    fontFamily: typography.semiBold,
    fontSize: 13,
    color: colors.primary,
    marginTop: 4,
    marginBottom: 24,
  },
  stopSessionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: '100%',
    backgroundColor: '#FFF2F2',
    borderWidth: 1,
    borderColor: '#FFE5E5',
    borderRadius: 16,
  },
  stopBtnText: {
    fontFamily: typography.bold,
    fontSize: 14,
    color: '#FF5252',
  },
});
