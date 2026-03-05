import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { PredictionResponse } from '@/services/prediction/types';

export default function PredictionResultScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ result?: string; selectedBlockId?: string; selectedTreeNumber?: string }>();

  const predictionResult = useMemo<PredictionResponse | null>(() => {
    if (!params.result) return null;
    try {
      return JSON.parse(String(params.result));
    } catch (error) {
      console.error('Failed to parse prediction result params:', error);
      return null;
    }
  }, [params.result]);

  const selectedBlockId = params.selectedBlockId ? String(params.selectedBlockId) : '';
  const selectedTreeNumber = params.selectedTreeNumber ? String(params.selectedTreeNumber) : '';

  if (!predictionResult) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}> 
        <LinearGradient
          colors={['#1B5E20', '#2E7D32', '#388E3C']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>predection result</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={56} color="#F57C00" />
          <Text style={styles.emptyTitle}>No result data found</Text>
          <Text style={styles.emptySubtitle}>Please run prediction again.</Text>
        </View>
      </View>
    );
  }

  const hasNoDetection = predictionResult.bunchCount === 0 || !predictionResult.detectionSuccess;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#388E3C']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>predection result</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.predictionResultCard}>
          {hasNoDetection ? (
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successHeader}
            >
              <View style={styles.successIconContainer}>
                <Ionicons name="alert-circle" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>No Bunch Detected</Text>
              <Text style={styles.successSubtitle}>Unable to locate a bunch in the image</Text>
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successHeader}
            >
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Prediction Successful!</Text>
              <Text style={styles.successSubtitle}>Bunch analysis completed</Text>
            </LinearGradient>
          )}

          {hasNoDetection ? (
            <View style={styles.noDetectionContent}>
              <Text style={styles.noDetectionMessage}>
                {predictionResult.mlMessage || 'No object was detected in this image.'}
              </Text>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Tip: Make sure the bunch is clearly visible in the photo. Try:{'\n'}
                  • Get closer to the bunch{ '\n'}
                  • Ensure good lighting{ '\n'}
                  • Capture the entire bunch in frame
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>🔍 Detection Results</Text>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="albums-outline" size={20} color="#2E7D32" />
                    </View>
                    <Text style={styles.detailLabel}>Bunches Detected</Text>
                    <Text style={styles.detailValue}>{predictionResult.bunchCount ?? 0}</Text>
                  </View>

                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="analytics-outline" size={20} color="#2E7D32" />
                    </View>
                    <Text style={styles.detailLabel}>Detection Confidence</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color:
                            (predictionResult.classConfidence ?? 0) > 80
                              ? '#2E7D32'
                              : (predictionResult.classConfidence ?? 0) > 60
                                ? '#F57C00'
                                : '#D32F2F',
                        },
                      ]}
                    >
                      {(predictionResult.classConfidence ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>📊 Ripeness Classification</Text>
                <View style={styles.detailsGrid}>
                  <View
                    style={[
                      styles.detailCard,
                      {
                        backgroundColor:
                          predictionResult.bunchClass === 'ripe' ? '#E8F5E9' : '#FFF8E1',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.detailIconContainer,
                        {
                          backgroundColor:
                            predictionResult.bunchClass === 'ripe' ? '#C8E6C9' : '#FFE0B2',
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>
                        {predictionResult.bunchClass === 'ripe' ? '🟢' : '🟡'}
                      </Text>
                    </View>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color: predictionResult.bunchClass === 'ripe' ? '#2E7D32' : '#F57C00',
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {predictionResult.bunchClass?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </View>

                  <View style={styles.detailCard}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="radio-button-on-outline" size={20} color="#2E7D32" />
                    </View>
                    <Text style={styles.detailLabel}>Classification Confidence</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        {
                          color:
                            (predictionResult.classConfidence ?? 0) > 80
                              ? '#2E7D32'
                              : (predictionResult.classConfidence ?? 0) > 60
                                ? '#F57C00'
                                : '#D32F2F',
                        },
                      ]}
                    >
                      {(predictionResult.classConfidence ?? 0).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>

              {predictionResult.harvestDay && (
                <View style={[styles.resultSection, styles.harvestSection]}>
                  <Text style={styles.sectionTitle}>📅 Harvest Prediction</Text>
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                      Estimated Harvest Time:
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.harvestPill}>
                        <Text style={styles.harvestPillText}>{predictionResult.harvestDay}</Text>
                      </View>
                      <Text style={{ fontSize: 14, color: '#333', flex: 1 }}>
                        Ready for harvest in {predictionResult.harvestDay?.match(/\d+/)?.[0]} days
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.resultSection}>
            <Text style={styles.sectionTitle}>📋 Metadata</Text>
            <View style={styles.detailsGrid}>
              {(predictionResult.treeNumber || selectedTreeNumber) && (
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
                  </View>
                  <Text style={styles.detailLabel}>Tree</Text>
                  <Text style={styles.detailValue}>{predictionResult.treeNumber || selectedTreeNumber}</Text>
                </View>
              )}

              {selectedBlockId && (
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="cube-outline" size={20} color="#2E7D32" />
                  </View>
                  <Text style={styles.detailLabel}>Block</Text>
                  <Text style={styles.detailValue}>{selectedBlockId}</Text>
                </View>
              )}

              {predictionResult.bunchNumber && (
                <View style={styles.detailCard}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="library-outline" size={20} color="#2E7D32" />
                  </View>
                  <Text style={styles.detailLabel}>Bunch ID</Text>
                  <Text style={styles.detailValue}>{predictionResult.bunchNumber}</Text>
                </View>
              )}
            </View>
          </View>

          {predictionResult.timestamp && (
            <View style={styles.timestampContainer}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.timestamp}>{new Date(predictionResult.timestamp).toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() =>
                router.replace({
                  pathname: '/Screens/predictBunch/predictbunch',
                  params: { reset: '1' },
                })
              }
            >
              <Ionicons name="camera-outline" size={20} color="#2E7D32" />
              <Text style={styles.secondaryButtonText}>Predict Another</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/Screens/home/home')}
            >
              <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF7',
  },
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  predictionResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  successHeader: {
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 12,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  noDetectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  noDetectionMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FFF9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  detailIconContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 50,
    padding: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    textAlign: 'center',
  },
  resultSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  harvestSection: {
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
  },
  harvestPill: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 12,
  },
  harvestPillText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resultActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});