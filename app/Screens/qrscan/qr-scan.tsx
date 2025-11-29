import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function QRScanScreen() {
  const insets = useSafeAreaInsets();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    // Do something with scanned data (e.g., navigate or fetch tree info)
    Alert.alert('QR Code Scanned', `Type: ${type}\nData: ${data}`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator />
        <Text style={styles.info}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.info}>No access to camera. Please enable it in settings.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.scannerContainer}>
        <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
        {scanned && (
          <TouchableOpacity style={styles.rescan} onPress={() => setScanned(false)}>
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scannerContainer: { flex: 1, overflow: 'hidden' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  info: { color: '#fff', marginTop: 12 },
  rescan: { position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  rescanText: { color: '#000', fontWeight: '600' },
});
