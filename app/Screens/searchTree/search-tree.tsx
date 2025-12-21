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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import { getTreeById } from '@/services/tree';
import { getPublicTreeDetails } from '@/services/qr';
import * as ImagePicker from 'expo-image-picker';
import type { PublicTreeDetails } from '@/services/qr/types';

export default function SearchTreeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<PublicTreeDetails | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [predicting, setPredicting] = useState(false);

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
      
      // Use public endpoint for consistency
      const response = await getPublicTreeDetails(searchQuery.trim());

      if (response.success && response.data) {
        console.log('✅ Tree found:', response.data);
        setTreeData(response.data);
      } else {
        Alert.alert('Not Found', response.message || 'Tree not found. Please check the Tree Number.');
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

    // QR code contains tree number (e.g., "TREE-BLOCK-A-001")
    const treeNumber = data.trim();

    setShowScanner(false);
    setSearchQuery(treeNumber);
    
    // Automatically fetch tree details using PUBLIC endpoint
    setTimeout(async () => {
      setLoading(true);
      setTreeData(null);
      try {
        console.log('🔍 Fetching public tree details for:', treeNumber);
        const response = await getPublicTreeDetails(treeNumber);
        
        if (response.success && response.data) {
          console.log('✅ Tree details loaded:', response.data);
          setTreeData(response.data);
        } else {
          Alert.alert('Not Found', response.message || 'Tree not found with scanned QR code');
        }
      } catch (error) {
        console.error('❌ Error fetching tree details:', error);
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

  // Pick image for bunch prediction
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant photo library access to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Take photo for bunch prediction
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera access to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Predict bunch count from image
  const predictBunch = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    if (!treeData) {
      Alert.alert('No Tree Selected', 'Please search for a tree first');
      return;
    }

    setPredicting(true);
    try {
      // TODO: Call your ML prediction endpoint here
      // For now, navigate to prediction screen
      router.push({
        pathname: '/Screens/predictBunch/predictbunch',
        params: {
          imageUri: selectedImage,
          treeNumber: treeData.treeNumber,
          blockId: treeData.blockId,
        },
      });
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Failed to predict bunch count');
    } finally {
      setPredicting(false);
    }
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

            {/* Basic Information */}
            <View style={styles.detailsContainer}>
              <Text style={styles.sectionLabel}>Basic Information</Text>
              <DetailRow icon="pricetag" label="Tree Number" value={treeData.treeNumber} />
              <DetailRow icon="grid" label="Block" value={treeData.blockId} />
              <DetailRow icon="calendar" label="Planted Date" value={formatDate(treeData.plantedDate)} />
              <DetailRow icon="time" label="Age" value={treeData.age ? `${treeData.age} years` : 'N/A'} />
              
              {(treeData.location?.latitude && treeData.location?.longitude) && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>GPS Location</Text>
                  <DetailRow 
                    icon="location" 
                    label="Coordinates" 
                    value={`${treeData.location.latitude.toFixed(6)}, ${treeData.location.longitude.toFixed(6)}`} 
                  />
                </>
              )}

              {treeData.fertilizer && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>Fertilizer Information</Text>
                  <DetailRow icon="flask" label="Type" value={treeData.fertilizer.type} />
                  <DetailRow icon="scale" label="Quantity" value={treeData.fertilizer.quantity} />
                  <DetailRow icon="calendar" label="Last Applied" value={formatDate(treeData.fertilizer.lastApplied)} />
                </>
              )}

              {treeData.maintenance && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>Maintenance History</Text>
                  {treeData.maintenance.lastPruning && (
                    <DetailRow icon="cut" label="Last Pruning" value={formatDate(treeData.maintenance.lastPruning)} />
                  )}
                  {treeData.maintenance.lastWeeding && (
                    <DetailRow icon="leaf" label="Last Weeding" value={formatDate(treeData.maintenance.lastWeeding)} />
                  )}
                </>
              )}

              {treeData.harvest && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>Harvest Information</Text>
                  {treeData.harvest.estimatedNextHarvest && (
                    <View style={styles.highlightRow}>
                      <Ionicons name="calendar" size={18} color="#FF6F00" />
                      <Text style={styles.highlightLabel}>Next Harvest</Text>
                      <Text style={styles.highlightValue}>{formatDate(treeData.harvest.estimatedNextHarvest)}</Text>
                    </View>
                  )}
                  {treeData.harvest.recentBunches && treeData.harvest.recentBunches.length > 0 && (
                    <>
                      <Text style={styles.subLabel}>Recent Harvests:</Text>
                      {treeData.harvest.recentBunches.slice(0, 3).map((bunch, index) => (
                        <View key={index} style={styles.bunchItem}>
                          <Text style={styles.bunchDate}>{formatDate(bunch.date)}</Text>
                          <Text style={styles.bunchInfo}>
                            {bunch.count} bunch{bunch.count > 1 ? 'es' : ''}
                            {bunch.weight ? ` • ${bunch.weight}kg` : ''}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                </>
              )}

              {treeData.scanCount !== undefined && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>QR Scan Statistics</Text>
                  <DetailRow icon="eye" label="Total Scans" value={treeData.scanCount.toString()} />
                  {treeData.lastScanned && (
                    <DetailRow icon="time" label="Last Scanned" value={formatDate(treeData.lastScanned)} />
                  )}
                </>
              )}
            </View>

            {/* Bunch Prediction Section */}
            <View style={styles.predictionSection}>
              <Text style={styles.predictionTitle}>🌾 Bunch Prediction</Text>
              
              {selectedImage ? (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePickerRow}>
                  <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={24} color="#2E7D32" />
                    <Text style={styles.imagePickerText}>Take Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                    <Ionicons name="images" size={24} color="#2E7D32" />
                    <Text style={styles.imagePickerText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedImage && (
                <TouchableOpacity
                  style={styles.predictButton}
                  onPress={predictBunch}
                  disabled={predicting}
                >
                  <LinearGradient
                    colors={['#FF6F00', '#FF8F00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.predictGradient}
                  >
                    {predicting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="analytics" size={20} color="#FFFFFF" />
                        <Text style={styles.predictButtonText}>Predict Bunch Count</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!treeData && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="qr-code-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>Scan QR or Search Tree</Text>
            <Text style={styles.emptyText}>
              Scan a QR code on the tree or enter the tree number to view details and predict bunch count
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
  // Highlight row for important info
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  highlightLabel: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
    flex: 1,
  },
  highlightValue: {
    fontSize: 14,
    color: '#FF6F00',
    fontWeight: '700',
  },
  subLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  bunchItem: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bunchDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  bunchInfo: {
    fontSize: 12,
    color: '#757575',
  },
  // Prediction Section
  predictionSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6F00',
    marginBottom: 12,
  },
  imagePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  predictButton: {
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  predictGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  predictButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
