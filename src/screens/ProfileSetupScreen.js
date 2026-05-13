import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography, spacing, radius } from '../theme/typography';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileSetupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(''); // 'male' | 'female' | 'other'
  const [conditions, setConditions] = useState([]); // array of health states

  const CONDITION_LIST = [
    { id: 'asthma', label: 'Asthma', icon: 'wind' },
    { id: 'allergy', label: 'Allergies', icon: 'feather' },
    { id: 'copd', label: 'COPD', icon: 'activity' },
    { id: 'none', label: 'I am healthy!', icon: 'heart' },
  ];

  const toggleCondition = (id) => {
    if (id === 'none') {
      setConditions(['none']);
      return;
    }
    let newList = conditions.filter((item) => item !== 'none');
    if (newList.includes(id)) {
      newList = newList.filter((item) => item !== id);
    } else {
      newList.push(id);
    }
    setConditions(newList);
  };

  const handleComplete = () => {
    // Direct path into the dashboard!
    navigation.replace('Home');
  };

  const isComplete = name && age && gender && conditions.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Header - Just Logo as requested */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/LOGO_REFINED.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Body */}
          <View style={styles.form}>
            {/* Input: Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hi! What's your name?</Text>
              <View style={styles.inputBox}>
                <Feather name="smile" size={20} color={colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Type your name here..."
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Row: Age & Gender Selection */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Your Age</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={[styles.input, { paddingLeft: 16 }]}
                    placeholder="Years"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderGrid}>
                  {['Male', 'Female'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setGender(item)}
                      style={[
                        styles.genderChip,
                        gender === item && styles.genderChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderChipText,
                          gender === item && styles.genderChipTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Health Conditions Multi-select */}
            <View style={[styles.inputGroup, { marginTop: 8 }]}>
              <Text style={styles.label}>Any breathing troubles?</Text>
              <Text style={styles.inputTip}>Choose any that apply to help us protect you better.</Text>
              
              <View style={styles.chipContainer}>
                {CONDITION_LIST.map((item) => {
                  const isActive = conditions.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleCondition(item.id)}
                      style={[
                        styles.pillChip,
                        isActive && styles.pillChipActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Feather
                        name={item.icon}
                        size={16}
                        color={isActive ? colors.textWhite : colors.primary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.pillText,
                          isActive && styles.pillTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Bottom Call to Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                !isComplete && styles.submitBtnDisabled
              ]}
              onPress={handleComplete}
              activeOpacity={0.85}
              disabled={!isComplete}
            >
              <LinearGradient
                colors={isComplete ? [colors.primaryLight, colors.primary] : ['#D1D5C5', '#BFC3B2']}
                style={styles.btnGradient}
              >
                <Text style={styles.submitBtnText}>Let's Go!</Text>
                <Feather name="check-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMist,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: 240,
    height: 120, // Suitable size to clearly display Logo+Text together natively
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    // Inner Shadow Replacement
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
  },
  genderGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 4,
    height: 56,
  },
  genderChip: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  genderChipActive: {
    backgroundColor: '#FFF',
    // Floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  genderChipText: {
    fontWeight: typography.semibold,
    color: colors.textMuted,
    fontSize: typography.md,
  },
  genderChipTextActive: {
    color: colors.primary,
    fontWeight: typography.bold,
  },
  inputTip: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  pillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(45, 90, 39, 0.1)',
  },
  pillChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: typography.md,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  pillTextActive: {
    color: colors.textWhite,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  submitBtn: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    // Shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitBtnDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.textWhite,
    fontSize: typography.lg,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
});
