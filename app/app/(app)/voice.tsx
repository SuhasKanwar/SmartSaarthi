import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform, Keyboard, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Orb from '@/components/Orb';
import { Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, requestRecordingPermissionsAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as DocumentPicker from 'expo-document-picker';
import { createConversation, sendMessage, getConversations, deleteConversation, renameConversation, getConversationMessages } from '@/lib/api';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate, Extrapolation } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.75;
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
}

interface Conversation {
    id: string;
    title?: string;
    lastUpdated: string;
}

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null); // { uri, name, mimeType }
  const [audioSource, setAudioSource] = useState<any>(null);

  const player = useAudioPlayer(audioSource);
  const playerStatus = useAudioPlayerStatus(player);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const drawerTranslateY = useSharedValue(DRAWER_HEIGHT);
  const sidebarTranslateX = useSharedValue(-SIDEBAR_WIDTH);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    initConversation();
    fetchHistory();
  }, []);

  useEffect(() => {
      if (player && audioSource) {
          player.play();
      }
  }, [player, audioSource]);

  useEffect(() => {
      setIsSpeaking(playerStatus.playing);
  }, [playerStatus.playing]);

  const playAudio = async (base64Data: string) => {
      setAudioSource({ uri: `data:audio/mp3;base64,${base64Data}` });
  };

  // Chat Drawer Animation
  useEffect(() => {
      drawerTranslateY.value = withSpring(isChatOpen ? 0 : DRAWER_HEIGHT, {
          damping: 20,
          stiffness: 100
      });
      if (!isChatOpen) Keyboard.dismiss();
  }, [isChatOpen]);

  // Sidebar Animation
  useEffect(() => {
      sidebarTranslateX.value = withSpring(isSidebarOpen ? 0 : -SIDEBAR_WIDTH, {
          damping: 20,
          stiffness: 100
      });
      if (isSidebarOpen) fetchHistory();
  }, [isSidebarOpen]);

  const fetchHistory = async () => {
      try {
          const res = await getConversations();
          if (res.success) {
              setConversations(res.conversations);
          }
      } catch (e) {
          console.error("Failed to fetch history", e);
      }
  };

  const initConversation = async (existingId?: string) => {
      setLoading(true);
      try {
          if (existingId) {
              setConversationId(existingId);
              setIsSidebarOpen(false);
              
              // Load full history
              const res = await getConversationMessages(existingId);
              if (res.success) {
                  setMessages(res.messages);
                  speak("Session loaded.");
              }
              setIsChatOpen(true);
          } else {
              const res = await createConversation();
              if (res.success && res.conversation) {
                  setConversationId(res.conversation.id);
                  setMessages([]);
                  speak("Hello! I am SmartSaarthi. How can I help you today?");
                  fetchHistory();
              }
          }
      } catch (err) {
          console.error("Failed to init conversation", err);
          Alert.alert("Error", "Could not start session.");
      } finally {
          setLoading(false);
      }
  };

  const deleteSession = async (id: string, e: any) => {
      e.stopPropagation();
      Alert.alert(
          "Delete Conversation",
          "Are you sure?",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: 'destructive', onPress: async () => {
                  try {
                      await deleteConversation(id);
                      if (conversationId === id) {
                          setConversationId(null);
                          setMessages([]);
                      }
                      fetchHistory();
                  } catch (err) {
                      Alert.alert("Error", "Failed to delete.");
                  }
              }}
          ]
      );
  };

  const startRename = (id: string, currentTitle: string, e: any) => {
      e.stopPropagation();
      setEditingConvoId(id);
      setEditTitle(currentTitle || "New Conversation");
  };

  const saveRename = async (id: string) => {
      try {
          await renameConversation(id, editTitle);
          setEditingConvoId(null);
          fetchHistory();
      } catch (err) {
          Alert.alert("Error", "Failed to rename.");
      }
  };

  const speak = (text: string) => {
      if (!text) return;
      setIsSpeaking(true);
      Speech.speak(text, {
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          pitch: 1.0,
          rate: 0.9,
      });
      // Don't add to messages here, backend does it. 
      // Oops, `speak` was adding to messages in previous version for initial greeting.
      // But for normal flow `handleSend` adds them.
      // I'll keep it simple: initial greeting adds to local state if I want it displayed?
      // Actually backend `getMessages` returns past messages, but local "Hello" isn't saved unless I save it.
      // I'll just speak it.
  };

  const pickDocument = async () => {
      try {
          const result = await DocumentPicker.getDocumentAsync({
              type: '*/*',
              copyToCacheDirectory: true
          });
          
          if (result.canceled) return;
          
          const file = result.assets[0];
          setSelectedFile(file);
          // Auto-open chat to show selected file indicator?
          setIsChatOpen(true);
      } catch (err) {
          console.error("File pick error", err);
      }
  };

  const handleSend = async () => {
        if ((!inputText.trim() && !selectedFile) || !conversationId) return;

        const text = inputText.trim();
        const fileToSend = selectedFile;
        
        setInputText('');
        setSelectedFile(null);
        
        // Optimistic update
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            text: text || (fileToSend ? `[File: ${fileToSend.name}]` : ""), 
            sender: 'user' 
        }]);

        setLoading(true);
        try {
            const res = await sendMessage(conversationId, text, fileToSend);
            if (res.success && res.botMessage) {
                setMessages(prev => [...prev, { 
                    id: res.botMessage.id || Date.now().toString(), 
                    text: res.botMessage.content, 
                    sender: 'bot' 
                }]);
                
                if (res.audio) {
                    playAudio(res.audio);
                } else {
                    speak(res.botMessage.content);
                }

                // Refresh history title if first msg
                if (messages.length === 0) fetchHistory(); 
            }
        } catch (err) {
            Alert.alert("Error", "Failed to get response.");
        } finally {
            setLoading(false);
        }
  };

  // Auto-scroll
  useEffect(() => {
      if (isChatOpen) {
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
      }
  }, [messages, isChatOpen]);

  // Audio Recording
  const recordingOptions: any = {
      extension: '.m4a',
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      android: {
          extension: '.m4a',
          outputFormat: 'mpeg4',
          audioEncoder: 'aac',
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
      },
      ios: {
          extension: '.m4a',
          audioQuality: 127,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
      },
      web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
      },
  };

  const recorder = useAudioRecorder(recordingOptions, (status) => {
     // Optional: track duration or metering here if needed
  });

  const toggleListening = async () => {
      if (isListening) {
          await recorder.stop();
          setIsListening(false);
          
          if (recorder.uri) {
              sendVoiceMessage(recorder.uri);
          }
      } else {
          const perm = await requestRecordingPermissionsAsync();
          if (perm.granted) {
             setIsListening(true);
             recorder.record();
          } else {
             Alert.alert("Permission required", "Microphone access is needed.");
          }
      }
  };

  const sendVoiceMessage = async (uri: string) => {
      if (!conversationId) {
          Alert.alert("Error", "No active session.");
          return;
      }
      
      // Create file object
      const file = {
          uri: uri,
          name: 'voice_message.m4a',
          type: 'audio/m4a'
      };

      // Optimistic update
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          text: "[Voice Message]", 
          sender: 'user' 
      }]);

      setLoading(true);
      try {
          const res = await sendMessage(conversationId, "", file);
          if (res.success && res.botMessage) {
              setMessages(prev => [...prev, { 
                  id: res.botMessage.id || Date.now().toString(), 
                  text: res.botMessage.content, 
                  sender: 'bot' 
              }]);
              
              if (res.audio) {
                  playAudio(res.audio);
              } else {
                  speak(res.botMessage.content);
              }
              if (messages.length === 0) fetchHistory(); 
          }
      } catch (err) {
          Alert.alert("Error", "Failed to send voice.");
      } finally {
          setLoading(false);
      }
  };

  const drawerStyle = useAnimatedStyle(() => {
      return {
          transform: [{ translateY: drawerTranslateY.value }]
      };
  });

  const sidebarStyle = useAnimatedStyle(() => {
      return {
          transform: [{ translateX: sidebarTranslateX.value }]
      };
  });

  const backdropStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
          drawerTranslateY.value,
          [0, DRAWER_HEIGHT],
          [0.5, 0],
          Extrapolation.CLAMP
      );
      return {
          opacity,
          zIndex: isChatOpen ? 1 : -1,
      };
  });

  const sidebarBackdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
        sidebarTranslateX.value,
        [-SIDEBAR_WIDTH, 0],
        [0, 0.5],
        Extrapolation.CLAMP
    );
    return {
        opacity,
        zIndex: isSidebarOpen ? 2 : -1,
    };
});

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        
        {/* Main Voice Interface */}
        <View style={styles.voiceLayer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={styles.menuBtn}>
                     <Ionicons name="menu" size={28} color={Palette.blueSecondary} />
                </TouchableOpacity>

                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.title}>SmartSaarthi</Text>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: isSpeaking || loading ? Palette.green : '#ccc' }]} />
                        <Text style={styles.statusText}>
                            {loading ? 'Thinking...' : isSpeaking ? 'Speaking...' : 'Listening'}
                        </Text>
                    </View>
                </View>

                <View style={{ width: 28 }} /> 
            </View>

            <View style={styles.orbWrapper}>
                <Orb active={isListening || loading || isSpeaking} />
            </View>

            <TouchableOpacity 
                style={[styles.micButton, isListening && styles.micButtonActive]}
                onPress={toggleListening}
                activeOpacity={0.8}
            >
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={40} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.showChatBtn} onPress={() => setIsChatOpen(true)}>
                <Ionicons name="chatbubble-ellipses-outline" size={24} color={Palette.blueSecondary} />
                <Text style={styles.showChatText}>Type / View History</Text>
            </TouchableOpacity>
        </View>

        {/* Backdrops */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
            <TouchableOpacity style={{flex:1}} onPress={() => setIsChatOpen(false)} />
        </Animated.View>
        <Animated.View style={[styles.backdrop, sidebarBackdropStyle]}>
            <TouchableOpacity style={{flex:1}} onPress={() => setIsSidebarOpen(false)} />
        </Animated.View>

        {/* Sidebar */}
        <Animated.View style={[styles.sidebar, sidebarStyle]}>
            <SafeAreaView edges={['top', 'left']} style={{ flex: 1 }}>
                <Text style={styles.sidebarTitle}>History</Text>
                <TouchableOpacity style={styles.newChatBtn} onPress={() => initConversation()}>
                    <Ionicons name="add-circle" size={24} color="#fff" />
                    <Text style={styles.newChatText}>New Session</Text>
                </TouchableOpacity>

                <FlatList 
                    data={conversations}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                         <View style={styles.historyRow}>
                             {editingConvoId === item.id ? (
                                 <View style={styles.editRow}>
                                     <TextInput 
                                        style={styles.editInput} 
                                        value={editTitle} 
                                        onChangeText={setEditTitle} 
                                        autoFocus
                                    />
                                     <TouchableOpacity onPress={() => saveRename(item.id)}>
                                         <Ionicons name="checkmark-circle" size={24} color={Palette.green} />
                                     </TouchableOpacity>
                                 </View>
                             ) : (
                                <TouchableOpacity 
                                    style={[
                                        styles.historyItem, 
                                        item.id === conversationId && styles.historyItemActive
                                    ]}
                                    onPress={() => initConversation(item.id)}
                                >
                                    <Ionicons name="chatbubble-outline" size={18} color={item.id === conversationId ? Palette.blueSecondary : '#666'} />
                                    <Text style={styles.historyText} numberOfLines={1}>
                                        {item.title || "New Conversation"}
                                    </Text>
                                    
                                    <View style={styles.actionIcons}>
                                        <TouchableOpacity onPress={(e) => startRename(item.id, item.title || "", e)} style={styles.iconBtn}>
                                            <Ionicons name="create-outline" size={18} color="#999" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={(e) => deleteSession(item.id, e)} style={styles.iconBtn}>
                                            <Ionicons name="trash-outline" size={18} color="#ff4444" />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                             )}
                         </View>
                    )}
                />
            </SafeAreaView>
        </Animated.View>

        {/* Chat Drawer */}
        <Animated.View style={[styles.drawer, drawerStyle]}>
            <View style={styles.drawerHandleContainer}>
                <View style={styles.drawerHandle} />
                <TouchableOpacity style={styles.closeDrawerBtn} onPress={() => setIsChatOpen(false)}>
                    <Ionicons name="close-circle" size={24} color="#ccc" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No messages yet.</Text>
                        </View>
                    )}
                    {messages.map((msg) => (
                        <View 
                            key={msg.id} 
                            style={[
                                styles.messageBubble, 
                                msg.sender === 'user' ? styles.userBubble : styles.botBubble
                            ]}
                        >
                            <Text style={[
                                styles.messageText, 
                                msg.sender === 'user' ? styles.userText : styles.botText
                            ]}>
                                {msg.text}
                            </Text>
                        </View>
                    ))}
                    {loading && (
                        <View style={styles.botBubble}>
                            <ActivityIndicator size="small" color="#555" />
                        </View>
                    )}
                </ScrollView>

                {/* File Preview */}
                {selectedFile && (
                    <View style={styles.filePreview}>
                        <Ionicons name="document-text" size={20} color={Palette.blueSecondary} />
                        <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.inputArea}>
                    <TouchableOpacity style={styles.attachBtn} onPress={pickDocument}>
                        <Ionicons name="attach" size={24} color="#666" />
                    </TouchableOpacity>

                    <TextInput 
                        ref={inputRef}
                        style={styles.textInput}
                        placeholder="Type your query..."
                        value={inputText}
                        placeholderTextColor="#999"
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  voiceLayer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuBtn: {
      padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.blueSecondary,
    marginBottom: 4,
  },
  statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
  },
  statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 6,
  },
  statusText: {
      fontSize: 10,
      color: '#666',
      fontWeight: '600',
  },
  orbWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.blueSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.blueSecondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 10,
  },
  micButtonActive: {
      backgroundColor: Palette.green,
      shadowColor: Palette.green,
      transform: [{ scale: 1.1 }]
  },
  showChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#f8f9fa',
      borderRadius: 20,
      paddingHorizontal: 20,
  },
  showChatText: {
      marginLeft: 8,
      color: Palette.blueSecondary,
      fontWeight: '600',
      fontSize: 14,
  },
  backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 85,
      height: DRAWER_HEIGHT,
      backgroundColor: '#fff',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 20,
      zIndex: 10,
  },
  drawerHandleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
  },
  drawerHandle: {
      width: 40,
      height: 5,
      backgroundColor: '#ddd',
      borderRadius: 3,
      position: 'absolute', 
      left: '50%',
      marginLeft: -20,
  },
  closeDrawerBtn: {
      marginLeft: 'auto', 
  },
  chatContent: {
      padding: 20,
      paddingBottom: 20,
  },
  emptyState: {
      alignItems: 'center',
      marginTop: 40,
  },
  emptyStateText: {
      color: '#ccc',
      fontStyle: 'italic',
  },
  messageBubble: {
      maxWidth: '85%',
      padding: 12,
      borderRadius: 18,
      marginBottom: 12,
  },
  userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: Palette.bluePrimary,
      borderBottomRightRadius: 4,
  },
  botBubble: {
      alignSelf: 'flex-start',
      backgroundColor: '#f5f5f5',
      borderBottomLeftRadius: 4,
  },
  messageText: {
      fontSize: 15,
      lineHeight: 22,
  },
  userText: {
      color: '#fff',
  },
  botText: {
      color: '#333',
  },
  inputArea: {
      flexDirection: 'row',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      alignItems: 'center',
  },
  attachBtn: {
      padding: 10,
      marginRight: 4,
  },
  textInput: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingVertical: 12,
      fontSize: 16,
      color: '#333',
      marginRight: 12,
      maxHeight: 100,
  },
  sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Palette.blueSecondary,
      alignItems: 'center',
      justifyContent: 'center',
  },
  sidebar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: '#fff',
      zIndex: 100,
      shadowColor: '#000',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 20,
  },
  sidebarTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Palette.bluePrimary,
      padding: 20,
  },
  newChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Palette.green,
      marginHorizontal: 16,
      padding: 12,
      borderRadius: 12,
      marginBottom: 20,
  },
  newChatText: {
      color: '#fff',
      fontWeight: '600',
      marginLeft: 8,
      fontSize: 16,
  },
  historyRow: {
      marginBottom: 4,
  },
  historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      justifyContent: 'space-between',
  },
  historyItemActive: {
      backgroundColor: 'rgba(44, 89, 255, 0.1)',
  },
  historyText: {
      marginLeft: 10,
      fontSize: 15,
      color: '#333',
      flex: 1,
  },
  actionIcons: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  iconBtn: {
      padding: 6,
      marginLeft: 4,
  },
  editRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
  },
  editInput: {
      flex: 1,
      fontSize: 15,
      color: '#333',
      borderBottomWidth: 1,
      borderBottomColor: Palette.blueSecondary,
      marginRight: 10,
      paddingVertical: 4,
  },
  filePreview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e6f0ff',
      padding: 10,
      marginHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
  },
  fileName: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      color: Palette.blueSecondary,
  },
});
