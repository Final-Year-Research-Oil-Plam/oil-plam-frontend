import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Pressable
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { fetchAllBlocks } from '@/services/block';
import type { Block } from '@/services/block/types';
import { searchTreesByBlock } from '@/services/tree';
import type { TreeResponse } from '@/services/tree/types';
import { predictBunch } from '@/services/prediction';
import type { PredictionResponse } from '@/services/prediction/types';

export default function PredictBunchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Block & Tree State
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [trees, setTrees] = useState<TreeResponse[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTree, setSelectedTree] = useState<TreeResponse | null>(null);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingTrees, setIsLoadingTrees] = useState(false);

  // Modal State
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [treeModalVisible, setTreeModalVisible] = useState(false);

  // Photo State
  const [photo, setPhoto] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  // Load blocks on mount
  useEffect(() => {
    loadBlocks();
  }, []);

  // Load trees when block is selected
  useEffect(() => {
    if (selectedBlock) {
      loadTreesByBlock(selectedBlock.id);
      setSelectedTree(null);
    } else {
      setTrees([]);
      setSelectedTree(null);
    }
  }, [selectedBlock]);

  const loadBlocks = async () => {
    setIsLoadingBlocks(true);
    try {
      console.log('🔄 Loading blocks...');
      const response = await fetchAllBlocks();
      console.log('📦 Blocks response:', response);
      
      if (response.success && response.data) {
        setBlocks(response.data);
        console.log('✅ Loaded', response.data.length, 'blocks');
      } else {
        console.error('❌ Failed to load blocks:', response.message);
        Alert.alert('Error', response.message || 'Failed to load blocks');
      }
    } catch (error) {
      console.error('💥 Error loading blocks:', error);
      Alert.alert('Error', 'Failed to load blocks. Please try again.');
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  const loadTreesByBlock = async (blockId: string) => {
    setIsLoadingTrees(true);
    setSelectedTree(null);
    try {
      console.log('🔄 Loading trees for block:', blockId);
      const response = await searchTreesByBlock(blockId);
      console.log('📦 Trees response:', response);
      
      if (response.success && response.data) {
        setTrees(response.data);
        console.log('✅ Loaded', response.data.length, 'trees');
      } else {
        console.error('❌ Failed to load trees:', response.message);
        Alert.alert('Error', response.message || 'Failed to load trees');
        setTrees([]);
      }
    } catch (error) {
      console.error('💥 Error loading trees:', error);
      Alert.alert('Error', 'Failed to load trees. Please try again.');
      setTrees([]);
    } finally {
      setIsLoadingTrees(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Media library permission is required to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handlePredict = async () => {
    if (!selectedBlock) {
      Alert.alert('Validation Error', 'Please select a block');
      return;
    }
    if (!selectedTree) {
      Alert.alert('Validation Error', 'Please select a tree');
      return;
    }
    if (!photo) {
      Alert.alert('Validation Error', 'Please take or upload a photo');
      return;
    }

    setIsPredicting(true);
    setPredictionResult(null);
    
    try {
      const response = await predictBunch(selectedBlock.id, String(selectedTree.id), photo);
      
      if (response.success && response.data) {
        setPredictionResult(response.data);
        
        const bunchCount = response.data.predictedBunches || 0;
        const confidence = response.data.confidence ? `${(response.data.confidence * 100).toFixed(1)}%` : 'N/A';
        
        Alert.alert(
          '✅ Prediction Complete',
          `Predicted Bunches: ${bunchCount}\nConfidence: ${confidence}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Optionally reset form
                // setPhoto(null);
                // setSelectedBlock(null);
                // setSelectedTree(null);
              }
            }
          ]
        );
      } else {
        Alert.alert('Prediction Failed', response.message || 'Unable to predict bunch yield.');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Failed to predict bunch yield. Please try again.');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
  };

  const renderBlockItem = ({ item }: { item: Block }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedBlock(item);
        setBlockModalVisible(false);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownItemContent}>
        <Ionicons name="cube-outline" size={20} color="#388E3C" />
        <View style={styles.dropdownItemText}>
          <Text style={styles.dropdownItemTitle}>{item.id}</Text>
          <Text style={styles.dropdownItemSubtitle}>{item.name}</Text>
        </View>
        {selectedBlock?.id === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="#388E3C" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTreeItem = ({ item }: { item: TreeResponse }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedTree(item);
        setTreeModalVisible(false);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownItemContent}>
        <Ionicons name="leaf-outline" size={20} color="#388E3C" />
        <Text style={styles.dropdownItemTitle}>Tree {item.treeNumber}</Text>
        {selectedTree?.id === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="#388E3C" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>Predict Bunch Yield</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Block Selection Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="grid-outline" size={24} color="#388E3C" />
            <Text style={styles.cardTitle}>Select Block</Text>
          </View>

          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setBlockModalVisible(true)}
            activeOpacity={0.7}
            disabled={isLoadingBlocks}
          >
            <View style={styles.dropdownButtonContent}>
              <Ionicons name="cube-outline" size={20} color="#388E3C" />
              <Text style={[styles.dropdownButtonText, !selectedBlock && styles.dropdownPlaceholder]}>
                {selectedBlock ? `${selectedBlock.id} - ${selectedBlock.name}` : 'Select a block'}
              </Text>
              {isLoadingBlocks ? (
                <ActivityIndicator size="small" color="#388E3C" />
              ) : (
                <Ionicons name="chevron-down" size={20} color="#388E3C" />
              )}
            </View>
          </TouchableOpacity>

          {blocks.length === 0 && !isLoadingBlocks && (
            <TouchableOpacity style={styles.retryButton} onPress={loadBlocks}>
              <Ionicons name="refresh-outline" size={20} color="#388E3C" />
              <Text style={styles.retryText}>Retry Loading Blocks</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tree Selection Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf-outline" size={24} color="#388E3C" />
            <Text style={styles.cardTitle}>Select Tree</Text>
          </View>

          <TouchableOpacity
            style={[styles.dropdownButton, !selectedBlock && styles.dropdownButtonDisabled]}
            onPress={() => selectedBlock && setTreeModalVisible(true)}
            activeOpacity={0.7}
            disabled={!selectedBlock || isLoadingTrees}
          >
            <View style={styles.dropdownButtonContent}>
              <Ionicons name="leaf-outline" size={20} color={selectedBlock ? "#388E3C" : "#CCC"} />
              <Text style={[styles.dropdownButtonText, !selectedTree && styles.dropdownPlaceholder]}>
                {selectedTree 
                  ? `Tree ${selectedTree.treeNumber}` 
                  : selectedBlock 
                    ? 'Select a tree' 
                    : 'Select a block first'}
              </Text>
              {isLoadingTrees ? (
                <ActivityIndicator size="small" color="#388E3C" />
              ) : (
                <Ionicons name="chevron-down" size={20} color={selectedBlock ? "#388E3C" : "#CCC"} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Photo Capture Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera-outline" size={24} color="#388E3C" />
            <Text style={styles.cardTitle}>Capture Bunch Photo</Text>
            {photo && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={handleRemovePhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={24} color="#D32F2F" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.photoButtonsContainer}>
            <TouchableOpacity 
              style={styles.photoButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#2E7D32', '#388E3C']}
                style={styles.photoButtonGradient}
              >
                <Ionicons name="camera" size={28} color="#FFFFFF" />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.photoButton}
              onPress={handleUploadPhoto}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#388E3C', '#43A047']}
                style={styles.photoButtonGradient}
              >
                <Ionicons name="cloud-upload-outline" size={28} color="#FFFFFF" />
                <Text style={styles.photoButtonText}>Upload Photo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Photo Preview - directly under buttons */}
          {photo && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
            </View>
          )}
        </View>

        {/* Prediction Result Card */}
        {predictionResult && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={24} color="#388E3C" />
              <Text style={styles.cardTitle}>Prediction Result</Text>
            </View>

            <View style={styles.resultContainer}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Predicted Bunches:</Text>
                <Text style={styles.resultValue}>{predictionResult.predictedBunches || 0}</Text>
              </View>

              {predictionResult.confidence && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Confidence:</Text>
                  <Text style={styles.resultValue}>
                    {(predictionResult.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              )}

              {predictionResult.timestamp && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Timestamp:</Text>
                  <Text style={styles.resultValueSmall}>
                    {new Date(predictionResult.timestamp).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Predict Button */}
        <TouchableOpacity 
          style={[styles.predictButton, (!selectedBlock || !selectedTree || !photo || isPredicting) && styles.predictButtonDisabled]}
          onPress={handlePredict}
          disabled={!selectedBlock || !selectedTree || !photo || isPredicting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={(!selectedBlock || !selectedTree || !photo || isPredicting) 
              ? ['#9E9E9E', '#757575'] 
              : ['#1B5E20', '#2E7D32']}
            style={styles.predictButtonGradient}
          >
            {isPredicting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 10 }} />
                <Text style={styles.predictButtonText}>Predicting...</Text>
              </>
            ) : (
              <>
                <Ionicons name="analytics-outline" size={24} color="#FFFFFF" />
                <Text style={styles.predictButtonText}>Predict Bunch Yield</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Block Selection Modal */}
      <Modal
        visible={blockModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBlockModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setBlockModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Block</Text>
              <TouchableOpacity onPress={() => setBlockModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={blocks}
              renderItem={renderBlockItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="cube-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyListText}>No blocks available</Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Tree Selection Modal */}
      <Modal
        visible={treeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTreeModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setTreeModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Tree</Text>
              <TouchableOpacity onPress={() => setTreeModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={trees}
              renderItem={renderTreeItem}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Ionicons name="leaf-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyListText}>
                    {selectedBlock ? 'No trees in this block' : 'Select a block first'}
                  </Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
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

  card: {
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

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginLeft: 10,
    flex: 1,
  },

  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#388E3C',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  dropdownButtonDisabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },

  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  dropdownPlaceholder: {
    color: '#999',
    fontWeight: '400',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },

  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  dropdownItemText: {
    flex: 1,
  },

  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  dropdownItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyListText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#388E3C',
  },

  retryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#388E3C',
  },

  photoButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  photoButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  photoButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  removeButton: {
    padding: 4,
  },

  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
  },

  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },

  predictButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  predictButtonDisabled: {
    opacity: 0.6,
  },

  predictButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },

  predictButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },

  resultContainer: {
    backgroundColor: '#F5FBF7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  resultLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },

  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
  },

  resultValueSmall: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    maxWidth: '60%',
    textAlign: 'right',
  },
});
