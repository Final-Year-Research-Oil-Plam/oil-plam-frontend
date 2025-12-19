import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateQRCode } from '@/services/qr';

interface QRCodeGeneratorProps {
  treeId: string;
  treeNumber?: string;
}

export default function QRCodeGenerator({ treeId, treeNumber }: QRCodeGeneratorProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const response = await generateQRCode(treeId);
      
      if (response.success && response.data) {
        setQrImage(response.data.qrCodeImage);
      } else {
        Alert.alert('Error', response.message || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    Alert.alert(
      'Download QR Code',
      'To save this QR code, take a screenshot or use the Share feature.',
      [{ text: 'OK' }]
    );
  };

  const handleShareQR = () => {
    Alert.alert(
      'Share QR Code',
      'QR Code sharing requires additional setup. For now, take a screenshot to share.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {!qrImage ? (
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateQR}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="qr-code-outline" size={24} color="#fff" />
              <Text style={styles.generateText}>Generate QR Code</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.qrContainer}>
          <Image
            source={{ uri: qrImage }}
            style={styles.qrImage}
            resizeMode="contain"
          />
          
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleDownloadQR}>
              <Ionicons name="download-outline" size={20} color="#2E7D32" />
              <Text style={styles.actionText}>Screenshot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShareQR}>
              <Ionicons name="share-outline" size={20} color="#2E7D32" />
              <Text style={styles.actionText}>Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setQrImage(null);
                handleGenerateQR();
              }}
            >
              <Ionicons name="refresh-outline" size={20} color="#2E7D32" />
              <Text style={styles.actionText}>Regenerate</Text>
            </TouchableOpacity>
          </View>

          {treeNumber && (
            <Text style={styles.treeLabel}>Tree: {treeNumber}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrImage: {
    width: 250,
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  treeLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
});
