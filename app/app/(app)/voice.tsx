import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Orb from '@/components/Orb';
import { Palette } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Assistant</Text>
      </View>

      <View style={styles.orbContainer}>
        <Orb active={isListening} />
      </View>

      <View style={styles.controls}>
          <Text style={styles.statusText}>
              {isListening ? "Listening..." : "Tap the mic to speak"}
          </Text>
          
        <TouchableOpacity 
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={() => setIsListening(!isListening)}
        >
          <Ionicons name={isListening ? "mic" : "mic-outline"} size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.blueSecondary,
  },
  orbContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120, // Space for bottom bar
  },
  statusText: {
      marginBottom: 20,
      fontSize: 16,
      color: '#666',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.blueSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.blueSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
      backgroundColor: Palette.green,
      shadowColor: Palette.green,
  }
});
