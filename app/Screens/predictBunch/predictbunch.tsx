import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Dummy data for Block and Tree IDs
const blockOptions = [
  { label: 'Block A', value: 'A' },
  { label: 'Block B', value: 'B' },
  { label: 'Block C', value: 'C' },
];
const treeOptions = {
  A: [ { label: 'Tree 1', value: '1' }, { label: 'Tree 2', value: '2' } ],
  B: [ { label: 'Tree 3', value: '3' }, { label: 'Tree 4', value: '4' } ],
  C: [ { label: 'Tree 5', value: '5' }, { label: 'Tree 6', value: '6' } ],
};
const bunchOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i+1}`, value: `${i+1}` }));

export default function PredictBunchScreen() {
  const [blockId, setBlockId] = useState('A');
  const [treeId, setTreeId] = useState('1');
  const [bunchId, setBunchId] = useState('1');
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSaveUpload = async () => {
    setUploading(true);
    // TODO: Implement upload logic
    setTimeout(() => setUploading(false), 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Predict Bunch</Text>
      <Text style={styles.label}>Select Block ID</Text>
      <Picker
        selectedValue={blockId}
        onValueChange={value => {
          setBlockId(value);
          setTreeId(treeOptions[value][0].value);
        }}
        style={styles.picker}
      >
        {blockOptions.map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Tree ID</Text>
      <Picker
        selectedValue={treeId}
        onValueChange={value => setTreeId(value)}
        style={styles.picker}
      >
        {treeOptions[blockId].map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Select Bunch ID</Text>
      <Picker
        selectedValue={bunchId}
        onValueChange={value => setBunchId(value)}
        style={styles.picker}
      >
        {bunchOptions.map(opt => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Take a Bunch Photo</Text>
      <View style={styles.photoRow}>
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          <Ionicons name="camera" size={24} color="#fff" />
          <Text style={styles.photoButtonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
          <Ionicons name="image" size={24} color="#fff" />
          <Text style={styles.photoButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
      {photo && (
        <Image source={{ uri: photo }} style={styles.preview} />
      )}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveUpload} disabled={uploading}>
        <Text style={styles.saveButtonText}>{uploading ? 'Uploading...' : 'Save & Upload'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF7',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#388E3C',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    color: '#2E7D32',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#388E3C',
    padding: 10,
    borderRadius: 8,
  },
  photoButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  preview: {
    width: 180,
    height: 180,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 12,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
