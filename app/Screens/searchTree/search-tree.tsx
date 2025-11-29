import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchTreeScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // Placeholder: implement actual search against API or local DB
    console.log('Searching for tree:', query);
    alert(`Search for: ${query}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }] }>
      <View style={styles.content}>
        <Text style={styles.title}>Search Tree</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter tree name or ID"
          placeholderTextColor="#9E9E9E"
          value={query}
          onChangeText={setQuery}
        />

        <TouchableOpacity style={styles.button} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FBF7' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#2E7D32', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 16 },
  button: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
