import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPublicTreeDetails } from '@/services/qr';
import type { PublicTreeDetails } from '@/services/qr/types';

export default function QRScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [treeDetails, setTreeDetails] = useState<PublicTreeDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  if (!permission) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator />
        <Text style={styles.info}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.info}>No access to camera. Please enable it in settings.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.scanAgainButton}>
          <Text style={styles.scanAgainText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: any) => {
    if (scanned) return;
    setScanned(true);
    setLoading(true);

    try {
      // Extract tree number from QR code data
      const treeNumber = data.trim();
      console.log('📱 Scanned tree number:', treeNumber);

      // Fetch tree details from backend
      const response = await getPublicTreeDetails(treeNumber);

      if (response.success && response.data) {
        setTreeDetails(response.data);
        setShowDetailsModal(true);
      } else {
        Alert.alert('Tree Not Found', response.message || 'Unable to fetch tree details', [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error fetching tree details:', error);
      Alert.alert('Error', 'Failed to load tree details. Please try again.', [
        { text: 'Scan Again', onPress: () => setScanned(false) },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setTreeDetails(null);
    setScanned(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading tree details...</Text>
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
        </View>

        <View style={styles.scanFrame} />
      </View>

      {/* Tree Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🌴 Tree Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#212121" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
              {treeDetails && (
                <>
                  {/* Basic Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <DetailRow icon="barcode-outline" label="Tree Number" value={treeDetails.treeNumber} />
                    <DetailRow icon="grid-outline" label="Block ID" value={treeDetails.blockId} />
                    <DetailRow icon="time-outline" label="Age" value={`${treeDetails.age} years`} />
                    <DetailRow icon="calendar-outline" label="Planted Date" value={treeDetails.plantedDate} />
                  </View>

                  {/* Location */}
                  {treeDetails.location && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Location</Text>
                      <DetailRow icon="location-outline" label="Latitude" value={treeDetails.location.latitude.toFixed(6)} />
                      <DetailRow icon="location-outline" label="Longitude" value={treeDetails.location.longitude.toFixed(6)} />
                    </View>
                  )}

                  {/* Fertilizer */}
                  {treeDetails.fertilizer && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Fertilizer Information</Text>
                      <DetailRow icon="leaf-outline" label="Type" value={treeDetails.fertilizer.type} />
                      <DetailRow icon="scale-outline" label="Quantity" value={treeDetails.fertilizer.quantity} />
                      <DetailRow icon="calendar-outline" label="Last Applied" value={treeDetails.fertilizer.lastApplied} />
                    </View>
                  )}

                  {/* Maintenance */}
                  {treeDetails.maintenance && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Maintenance</Text>
                      <DetailRow icon="cut-outline" label="Last Pruning" value={treeDetails.maintenance.lastPruning} />
                      <DetailRow icon="leaf-outline" label="Last Weeding" value={treeDetails.maintenance.lastWeeding} />
                    </View>
                  )}

                  {/* Harvest */}
                  {treeDetails.harvest && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Harvest Information</Text>
                      {treeDetails.harvest.estimatedNextHarvest && (
                        <DetailRow 
                          icon="calendar-outline" 
                          label="Next Harvest" 
                          value={treeDetails.harvest.estimatedNextHarvest}
                          highlight={true}
                        />
                      )}
                      {treeDetails.harvest.recentBunches && treeDetails.harvest.recentBunches.length > 0 && (
                        <>
                          <Text style={styles.subSectionTitle}>Recent Harvests:</Text>
                          {treeDetails.harvest.recentBunches.map((bunch, index) => (
                            <View key={index} style={styles.harvestItem}>
                              <Text style={styles.harvestDate}>{bunch.date}</Text>
                              <Text style={styles.harvestInfo}>
                                {bunch.count} bunch{bunch.count > 1 ? 'es' : ''}
                                {bunch.weight ? ` • ${bunch.weight}kg` : ''}
                              </Text>
                            </View>
                          ))}
                        </>
                      )}
                    </View>
                  )}

                  {/* Scan Stats */}
                  {treeDetails.scanCount !== undefined && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>QR Code Statistics</Text>
                      <DetailRow icon="eye-outline" label="Total Scans" value={treeDetails.scanCount.toString()} />
                      {treeDetails.lastScanned && (
                        <DetailRow icon="time-outline" label="Last Scanned" value={treeDetails.lastScanned} />
                      )}
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.scanAgainButton} onPress={closeModal}>
              <Ionicons name="qr-code-outline" size={20} color="#fff" />
              <Text style={styles.scanAgainText}>Scan Another Tree</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper component for detail rows
function DetailRow({ icon, label, value, highlight = false }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLabel}>
        <Ionicons name={icon} size={18} color={highlight ? '#4CAF50' : '#757575'} />
        <Text style={styles.detailLabelText}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, highlight && styles.highlightValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scannerContainer: { flex: 1, overflow: 'hidden' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  info: { color: '#fff', marginTop: 12, fontSize: 16, textAlign: 'center' },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 16 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginLeft: 12 },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '30%',
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#212121' },
  closeButton: { padding: 4 },
  detailsScroll: { paddingHorizontal: 20 },
  detailSection: {
    marginTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailLabelText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    textAlign: 'right',
  },
  highlightValue: { color: '#4CAF50', fontSize: 15, fontWeight: '700' },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginTop: 8,
    marginBottom: 4,
  },
  harvestItem: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  harvestDate: { fontSize: 13, fontWeight: '600', color: '#212121' },
  harvestInfo: { fontSize: 12, color: '#757575', marginTop: 2 },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  scanAgainText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
