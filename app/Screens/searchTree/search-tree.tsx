import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import { getTreeById } from '@/services/tree';

export default function SearchTreeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Handle manual search by tree ID or tree number
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a Tree ID or Tree Number');
      return;
    }

    setLoading(true);
    setTreeData(null);

    try {
      console.log('🔍 Searching for tree:', searchQuery);
      
      // Try to search by ID (if numeric) or tree number
      const response = await getTreeById(searchQuery.trim());

      if (response.success && response.data) {
        console.log('✅ Tree found:', response.data);
        setTreeData(response.data);
      } else {
        Alert.alert('Not Found', response.message || 'Tree not found. Please check the ID or Tree Number.');
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      Alert.alert('Error', 'Failed to search for tree. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle QR code scan
  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log('📷 QR Code scanned:', data);

    // Extract tree ID from QR code data
    // Expected format: "TREE-ID-123" or just "123" or full tree number "TREE-BLOCK-A-001"
    let treeId = data;
    
    // If QR contains full tree number, extract just the ID or use as is
    if (data.startsWith('TREE-')) {
      // For now, use the full tree number to search
      treeId = data;
    }

    setShowScanner(false);
    setSearchQuery(treeId);
    
    // Automatically search after scan
    setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getTreeById(treeId);
        if (response.success && response.data) {
          setTreeData(response.data);
        } else {
          Alert.alert('Not Found', 'Tree not found with scanned QR code');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch tree details');
      } finally {
        setLoading(false);
        setScanned(false);
      }
    }, 500);
  };

  // Open QR scanner
  const openQRScanner = () => {
    if (hasPermission === null) {
      Alert.alert('Permission', 'Requesting camera permission...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert(
        'Camera Permission',
        'Camera permission is required to scan QR codes. Please enable it in settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    setScanned(false);
    setShowScanner(true);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#388E3C']}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="search" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Search Tree</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Search Input Card */}
        <View style={styles.searchCard}>
          <Text style={styles.sectionTitle}>Find Tree</Text>
          <Text style={styles.subtitle}>Enter Tree ID or Tree Number</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="leaf-outline" size={20} color="#4CAF50" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., 1 or TREE-BLOCK-A-001"
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.searchButton]}
              onPress={handleManualSearch}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Search</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.qrButton]}
              onPress={openQRScanner}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2E7D32', '#388E3C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="qr-code-outline" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Scan QR</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tree Details Card */}
        {treeData && (
          <View style={styles.treeCard}>
            <View style={styles.treeHeader}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.treeTitle}>{treeData.treeNumber || 'Tree Details'}</Text>
            </View>

            <View style={styles.divider} />

            {/* Tree Information */}
            <View style={styles.detailsContainer}>
              <DetailRow icon="finger-print" label="Tree ID" value={treeData.id} />
              <DetailRow icon="pricetag" label="Tree Number" value={treeData.treeNumber} />
              <DetailRow icon="grid" label="Block" value={treeData.blockId} />
              <DetailRow icon="calendar" label="Planted Date" value={formatDate(treeData.plantedDate)} />
              <DetailRow icon="time" label="Age" value={treeData.age ? `${treeData.age} years` : 'N/A'} />
              
              {(treeData.latitude && treeData.longitude) && (
                <DetailRow 
                  icon="location" 
                  label="GPS Location" 
                  value={`${treeData.latitude.toFixed(6)}, ${treeData.longitude.toFixed(6)}`} 
                />
              )}

              {treeData.fertilizerType && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>Fertilizer Information</Text>
                  <DetailRow icon="flask" label="Type" value={treeData.fertilizerType} />
                  <DetailRow icon="scale" label="Quantity" value={treeData.fertilizerQty || 'N/A'} />
                  <DetailRow icon="calendar" label="Last Applied" value={formatDate(treeData.lastFertilizerDate)} />
                </>
              )}

              {(treeData.lastPruningDate || treeData.lastWeedingDate) && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>Maintenance History</Text>
                  {treeData.lastPruningDate && (
                    <DetailRow icon="cut" label="Last Pruning" value={formatDate(treeData.lastPruningDate)} />
                  )}
                  {treeData.lastWeedingDate && (
                    <DetailRow icon="leaf" label="Last Weeding" value={formatDate(treeData.lastWeedingDate)} />
                  )}
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.viewBunchesButton} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FF6F00', '#FF8F00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.smallButtonGradient}
                >
                  <Ionicons name="eye" size={18} color="#FFFFFF" />
                  <Text style={styles.smallButtonText}>View Bunches</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Empty State */}
        {!treeData && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No Tree Selected</Text>
            <Text style={styles.emptyText}>
              Enter a Tree ID/Number or scan a QR code to view tree details
            </Text>
          </View>
        )}
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <View style={styles.scannerContainer}>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32']}
            style={[styles.scannerHeader, { paddingTop: insets.top + 10 }]}
          >
            <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.scannerTitle}>Scan QR Code</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>

          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>Position QR code within the frame</Text>
            </View>
          </CameraView>
        </View>
      </Modal>
    </View>
  );
}

// Detail Row Component
const DetailRow = ({ icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabel}>
      <Ionicons name={icon} size={18} color="#757575" />
      <Text style={styles.labelText}>{label}</Text>
    </View>
    <Text style={styles.valueText}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF7',
  },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButton: {},
  qrButton: {},
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  treeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  treeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  treeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  labelText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  valueText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  actionContainer: {
    marginTop: 20,
  },
  viewBunchesButton: {
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  smallButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // QR Scanner Styles
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
