import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const STORE_ITEMS = [
  { id: 'default', name: 'Oak Tree', emoji: '🌳', price: 0, desc: 'The sturdy classic.' },
  { id: 'pine', name: 'Alpine Pine', emoji: '🌲', price: 300, desc: 'Breathe the crisp mountain air.' },
  { id: 'sakura', name: 'Zen Sakura', emoji: '🌸', price: 500, desc: 'A beautiful cherry blossom.' },
  { id: 'maple', name: 'Autumn Maple', emoji: '🍁', price: 800, desc: 'Golden leaves falling softly.' },
  { id: 'mystic', name: 'Mystic Mushroom', emoji: '🍄', price: 1000, desc: 'A glowing rare fungi.' },
];

export default function NurseryScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('forest');
  const [coins, setCoins] = useState(0);
  const [forest, setForest] = useState([]);
  const [unlockedSkins, setUnlockedSkins] = useState(['default']);
  const [equippedSkin, setEquippedSkin] = useState('default');

  useEffect(() => {
    loadNurseryData();
  }, []);

  const loadNurseryData = async () => {
    try {
      const storedCoins = await AsyncStorage.getItem('@aero_coins');
      setCoins(storedCoins ? parseInt(storedCoins, 10) : 0);

      const storedForest = await AsyncStorage.getItem('@aero_forest');
      setForest(storedForest ? JSON.parse(storedForest) : []);

      const storedSkins = await AsyncStorage.getItem('@aero_skins');
      if (storedSkins) setUnlockedSkins(JSON.parse(storedSkins));

      const storedEquipped = await AsyncStorage.getItem('@aero_equipped_skin');
      if (storedEquipped) setEquippedSkin(storedEquipped);
    } catch (e) {
      console.log('Nursery Error:', e);
    }
  };

  const purchaseSkin = async (item) => {
    if (unlockedSkins.includes(item.id)) {
      // Equip it
      setEquippedSkin(item.id);
      await AsyncStorage.setItem('@aero_equipped_skin', item.id);
      return;
    }

    if (coins >= item.price) {
      Alert.alert(
        'Unlock Tree',
        `Do you want to unlock ${item.name} for ${item.price} AeroCoins?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Purchase', 
            onPress: async () => {
              const newCoins = coins - item.price;
              const newSkins = [...unlockedSkins, item.id];
              setCoins(newCoins);
              setUnlockedSkins(newSkins);
              setEquippedSkin(item.id);

              await AsyncStorage.setItem('@aero_coins', newCoins.toString());
              await AsyncStorage.setItem('@aero_skins', JSON.stringify(newSkins));
              await AsyncStorage.setItem('@aero_equipped_skin', item.id);
            }
          }
        ]
      );
    } else {
      Alert.alert('Not enough coins!', 'Complete more breathing sessions to earn AeroCoins.');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sanctuary Nursery</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinText}>{coins} 🪙</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'forest' && styles.tabBtnActive]}
          onPress={() => setActiveTab('forest')}
        >
          <Text style={[styles.tabTxt, activeTab === 'forest' && styles.tabTxtActive]}>My Forest</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'store' && styles.tabBtnActive]}
          onPress={() => setActiveTab('store')}
        >
          <Text style={[styles.tabTxt, activeTab === 'store' && styles.tabTxtActive]}>Seed Store</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea}>
        {activeTab === 'forest' ? (
          <View>
            <Text style={styles.sectionHeading}>Your Grown Trees ({forest.length})</Text>
            {forest.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{fontSize: 50, marginBottom: 15}}>🌱</Text>
                <Text style={styles.emptyStateTxt}>Your forest is empty.</Text>
                <Text style={styles.emptyStateSubTxt}>Complete Breathe sessions to plant your first tree!</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {forest.map((tree, i) => (
                  <View key={i} style={styles.treeCard}>
                    <Text style={styles.treeEmoji}>{tree.emoji || '🌳'}</Text>
                    <Text style={styles.treeType}>{tree.type}</Text>
                    <Text style={styles.treeDuration}>{tree.duration} min</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionHeading}>Unlock Premium Trees</Text>
            {STORE_ITEMS.map((item) => {
              const isUnlocked = unlockedSkins.includes(item.id);
              const isEquipped = equippedSkin === item.id;

              return (
                <View key={item.id} style={styles.storeItem}>
                  <View style={styles.storeIconWrap}>
                    <Text style={{fontSize: 32}}>{item.emoji}</Text>
                  </View>
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{item.name}</Text>
                    <Text style={styles.storeDesc}>{item.desc}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[
                      styles.buyBtn, 
                      isEquipped ? styles.buyBtnEquipped : isUnlocked ? styles.buyBtnUnlocked : null
                    ]}
                    onPress={() => purchaseSkin(item)}
                  >
                    <Text style={[
                      styles.buyBtnTxt,
                      (isUnlocked || isEquipped) && {color: '#FFF'}
                    ]}>
                      {isEquipped ? 'Equipped' : isUnlocked ? 'Equip' : `${item.price} 🪙`}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFCFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F3',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 12,
  },
  backBtn: {
    width: 40,
  },
  headerTitle: {
    fontFamily: typography.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  coinBadge: {
    backgroundColor: '#FFF2CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE599'
  },
  coinText: {
    fontFamily: typography.bold,
    fontSize: 14,
    color: '#B38E00',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F3',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#E6F4EA',
  },
  tabTxt: {
    fontFamily: typography.medium,
    fontSize: 15,
    color: colors.textMuted,
  },
  tabTxtActive: {
    fontFamily: typography.bold,
    color: '#2D9E5A',
  },
  scrollArea: {
    padding: 20,
  },
  sectionHeading: {
    fontFamily: typography.bold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateTxt: {
    fontFamily: typography.bold,
    fontSize: 18,
    color: colors.text,
  },
  emptyStateSubTxt: {
    fontFamily: typography.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  treeCard: {
    width: (width - 55) / 2,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  treeEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  treeType: {
    fontFamily: typography.bold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center'
  },
  treeDuration: {
    fontFamily: typography.medium,
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  storeIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F5F7F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontFamily: typography.bold,
    fontSize: 16,
    color: colors.text,
  },
  storeDesc: {
    fontFamily: typography.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  buyBtn: {
    backgroundColor: '#FFF2CC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buyBtnUnlocked: {
    backgroundColor: colors.primaryLight,
  },
  buyBtnEquipped: {
    backgroundColor: colors.primary,
  },
  buyBtnTxt: {
    fontFamily: typography.bold,
    fontSize: 13,
    color: '#B38E00',
  }
});
