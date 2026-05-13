import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography, spacing, radius } from '../theme/typography';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(''); // 'Male' | 'Female'
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const CONDITION_LIST = [
    { id: 'asthma', label: 'Asthma Risk', icon: 'wind' },
    { id: 'allergy', label: 'Environmental Allergies', icon: 'feather' },
    { id: 'copd', label: 'COPD Tracking', icon: 'activity' },
    { id: 'none', label: 'Optimal / No Condition', icon: 'heart' },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setName(data.name || '');
          setAge(data.age ? data.age.toString() : '');
          setGender(data.gender || '');
          setConditions(data.conditions || []);
        }
      }
    } catch (err) {
      console.log('Error loading cloud profile:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Info', 'Please supply your name.');
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User authentication expired.');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          age: parseInt(age) || null,
          gender: gender,
          conditions: conditions,
        });

      if (error) throw error;

      Alert.alert('Profile Refined', 'Your credentials have been synchronized with the cloud vault.', [
        { text: 'Return Home', onPress: () => navigation.replace('Home') }
      ]);
    } catch (err) {
      Alert.alert('Error Syncing', err.message || 'Check network connectivity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Acquiring Secure Session...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainCanvas}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* 🌿 Organic Logo-Inspired Ambient Glow System */}
      <View style={[styles.glowBlob, { backgroundColor: '#EBF7E9', top: -80, right: -80 }]} />
      <View style={[styles.glowBlob, { backgroundColor: '#F6FAF5', bottom: -100, left: -100 }]} />

      {/* Luxury Top Spaced Header */}
      <View style={styles.appHeader}>
        <TouchableOpacity 
          style={styles.headerActionBtn}
          onPress={() => navigation.replace('Home')}
          activeOpacity={0.7}
        >
          <Feather name="chevron-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.appHeaderTitle}>My Profile</Text>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Elegant Glowing Avatar Core */}
          <View style={styles.avatarDisplayCenter}>
            <View style={styles.avatarRingOuter}>
              <View style={styles.avatarRingInner}>
                <MaterialCommunityIcons name="account-circle" size={78} color={colors.primary} />
              </View>
              <View style={styles.securedShieldBadge}>
                <Feather name="shield" size={11} color="#FFF" />
              </View>
            </View>
            <Text style={styles.avatarWelcomeGreet}>Welcome Back,</Text>
            <Text style={styles.avatarNameLabel}>{name || 'Aerova User'}</Text>
          </View>

          {/* Grouped Luxurious Input Card 1: Demographics */}
          <View style={styles.luxGroupContainer}>
            <View style={styles.luxGroupHeaderRow}>
              <MaterialCommunityIcons name="card-text-outline" size={16} color={colors.primary} style={{marginRight: 8}} />
              <Text style={styles.luxGroupTitle}>Identity Details</Text>
            </View>

            <View style={styles.luxDivider} />

            <View style={styles.inputStackedGroup}>
              <Text style={styles.inputFieldLabel}>Full Display Name</Text>
              <View style={styles.luxInputBox}>
                <Feather name="edit-3" size={16} color={colors.primary} style={{marginRight: 12}} />
                <TextInput
                  style={styles.luxTextInputField}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CB2A2"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.twoColumnInputRow}>
              <View style={[styles.inputStackedGroup, { flex: 1, marginRight: 14 }]}>
                <Text style={styles.inputFieldLabel}>Your Age</Text>
                <View style={styles.luxInputBox}>
                  <TextInput
                    style={[styles.luxTextInputField, { textAlign: 'center', paddingLeft: 0 }]}
                    placeholder="Age"
                    placeholderTextColor="#9CB2A2"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    maxLength={3}
                  />
                </View>
              </View>

              <View style={[styles.inputStackedGroup, { flex: 2.2 }]}>
                <Text style={styles.inputFieldLabel}>Gender Selection</Text>
                <View style={styles.genderPillWrapper}>
                  {['Male', 'Female'].map((g) => {
                    const isAct = gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setGender(g)}
                        style={[styles.genderPillChip, isAct && styles.genderPillChipActive]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.genderPillText, isAct && styles.genderPillTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Grouped Luxurious Input Card 2: Health Focus */}
          <View style={styles.luxGroupContainer}>
            <View style={styles.luxGroupHeaderRow}>
              <MaterialCommunityIcons name="heart-pulse" size={17} color={colors.primary} style={{marginRight: 8}} />
              <Text style={styles.luxGroupTitle}>Respiratory Shield Profiling</Text>
            </View>
            
            <Text style={styles.groupSubHint}>Select any ongoing condition below. Aerova Shield uses this to dynamically compute customized cardio safety alerts for you.</Text>

            <View style={styles.luxDivider} />

            <View style={styles.listConditionsGroup}>
              {CONDITION_LIST.map((item) => {
                const isSel = conditions.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => toggleCondition(item.id)}
                    style={[styles.luxConditionRowItem, isSel && styles.luxConditionRowItemActive]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.luxCondIconBox, isSel && styles.luxCondIconBoxActive]}>
                      <Feather name={item.icon} size={18} color={isSel ? '#FFF' : colors.primary} />
                    </View>
                    <Text style={[styles.luxCondRowLabel, isSel && styles.luxCondRowLabelActive]}>{item.label}</Text>
                    <View style={[styles.luxRadioBubble, isSel && styles.luxRadioBubbleActive]}>
                      {isSel && <View style={styles.luxRadioBubbleCore} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          {/* Spacer for bottom content */}
          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Highly Positioned Airy Save Footer */}
      <View style={styles.appStickyFooter}>
        <TouchableOpacity
          style={styles.masterCallToActionBtn}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#2D5A27', '#48823F']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.masterGradBtnBlock}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Feather name="check-circle" size={18} color="#FFF" style={{marginRight: 10}} />
                <Text style={styles.ctaBtnText}>Save & Update Sync</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainCanvas: {
    flex: 1,
    backgroundColor: '#FAFCFA', // Ultra pure serene light canvas background
  },
  glowBlob: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.55,
    zIndex: 0,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFCFA',
  },
  loaderText: {
    fontFamily: typography.semiBold,
    color: '#718A78',
    marginTop: 15,
    fontSize: 14,
  },
  appHeader: {
    height: Platform.OS === 'ios' ? 64 : 76,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  headerActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF4EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  appHeaderTitle: {
    fontFamily: typography.bold,
    fontSize: 19,
    color: colors.text,
    letterSpacing: -0.3,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  avatarDisplayCenter: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  avatarRingOuter: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFEADF',
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
  },
  avatarRingInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F2F8F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securedShieldBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAFCFA',
  },
  avatarWelcomeGreet: {
    fontFamily: typography.medium,
    fontSize: 13,
    color: '#718A78',
    marginTop: 16,
  },
  avatarNameLabel: {
    fontFamily: typography.bold,
    fontSize: 22,
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  luxGroupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EDF3ED',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  luxGroupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  luxGroupTitle: {
    fontFamily: typography.bold,
    fontSize: 14,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  groupSubHint: {
    fontFamily: typography.medium,
    fontSize: 12,
    color: '#8FA896',
    marginTop: 4,
    lineHeight: 17,
  },
  luxDivider: {
    height: 1,
    backgroundColor: '#F1F7F1',
    marginVertical: 16,
  },
  inputStackedGroup: {
    marginBottom: 16,
  },
  inputFieldLabel: {
    fontFamily: typography.semiBold,
    fontSize: 13,
    color: '#4E6152',
    marginBottom: 8,
  },
  luxInputBox: {
    height: 56,
    backgroundColor: '#F8FBF8',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EEF4ED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  luxTextInputField: {
    flex: 1,
    fontFamily: typography.semiBold,
    fontSize: 15,
    color: colors.text,
  },
  twoColumnInputRow: {
    flexDirection: 'row',
  },
  genderPillWrapper: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#F8FBF8',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EEF4ED',
    padding: 4,
  },
  genderPillChip: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  genderPillChipActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  genderPillText: {
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: '#8E9F92',
  },
  genderPillTextActive: {
    color: colors.primary,
  },
  listConditionsGroup: {
    marginTop: 4,
  },
  luxConditionRowItem: {
    height: 62,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F2F6F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  luxConditionRowItemActive: {
    borderColor: '#2D5A27',
    backgroundColor: '#FAFDFC',
  },
  luxCondIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F4F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  luxCondIconBoxActive: {
    backgroundColor: '#2D5A27',
  },
  luxCondRowLabel: {
    flex: 1,
    fontFamily: typography.semiBold,
    fontSize: 14,
    color: '#556B59',
  },
  luxCondRowLabelActive: {
    color: '#2D5A27',
    fontFamily: typography.bold,
  },
  luxRadioBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCDBCF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  luxRadioBubbleActive: {
    borderColor: '#2D5A27',
  },
  luxRadioBubbleCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D5A27',
  },
  appStickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#EEF4EE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 10,
  },
  masterCallToActionBtn: {
    height: 58,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  masterGradBtnBlock: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaBtnText: {
    fontFamily: typography.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
