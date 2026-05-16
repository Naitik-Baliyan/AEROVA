import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { sendChatMessage } from '../utils/aiService';

export default function AeroChatScreen({ navigation, route }) {
  const { medicalProfile, currentAqi } = route.params || {};
  
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'model',
      text: "Hello! I am AERO, your personal pulmonary AI. I've analyzed your local air conditions and your health profile. How can I assist you today?",
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollViewRef = useRef();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Header pulsing orb animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    const newUserMsg = { id: Date.now().toString(), role: 'user', text };
    const newChatHistory = [...messages, newUserMsg];
    
    setMessages(newChatHistory);
    setInputText('');
    setIsTyping(true);

    // Call Gemini via aiService
    const aiResponseText = await sendChatMessage(newChatHistory, medicalProfile, currentAqi);
    
    const newAiMsg = { id: (Date.now() + 1).toString(), role: 'model', text: aiResponseText };
    setMessages(prev => [...prev, newAiMsg]);
    setIsTyping(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Animated.View style={[styles.pulseOrb, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.headerTitle}>Aero AI</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView 
        style={styles.kav} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <View key={msg.id} style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <Text style={styles.aiAvatarText}>🍃</Text>
                  </View>
                )}
                <View style={[styles.bubbleContent, isUser ? styles.userBubbleContent : styles.aiBubbleContent]}>
                  <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
                    {msg.text}
                  </Text>
                </View>
              </View>
            );
          })}
          
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
               <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>🍃</Text>
                </View>
              <View style={[styles.bubbleContent, styles.aiBubbleContent]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask Aero about your lungs..."
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={400}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Feather name="send" size={20} color={colors.textWhite} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F3',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseOrb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiAvatarText: {
    fontSize: 14,
  },
  bubbleContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubbleContent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubbleContent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF1F3',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.textWhite,
  },
  aiMessageText: {
    color: colors.textPrimary,
  },
  inputArea: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDF1F3',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F7F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 52,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D9E0',
  },
});
