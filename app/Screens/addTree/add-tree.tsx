import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addTree,
  validateTreeForm,
  calculateTreeAge,
  formatDate,
  formatDateDisplay,
  type TreeFormData,
  type TreeData,
} from '@/services/tree';
import { fetchAllBlocks } from '@/services/block';
import type { BlockResponse } from '@/services/block/types';

export default function AddTreeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showPlantedDatePicker, setShowPlantedDatePicker] = useState(false);
  const [plantedDateValue, setPlantedDateValue] = useState<Date>(new Date());
  const [showFertilizerDatePicker, setShowFertilizerDatePicker] = useState(false);
  const [fertilizerDateValue, setFertilizerDateValue] = useState<Date>(new Date());
  const [showPruningDatePicker, setShowPruningDatePicker] = useState(false);
  const [pruningDateValue, setPruningDateValue] = useState<Date>(new Date());
  const [showWeedingDatePicker, setShowWeedingDatePicker] = useState(false);
  const [weedingDateValue, setWeedingDateValue] = useState<Date>(new Date());
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [blocks, setBlocks] = useState<BlockResponse[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [formData, setFormData] = useState<TreeFormData>({
    blockId: '',
    treeNumber: '',
    latitude: null,
    longitude: null,
    placeId: '',
    plantedDate: '',
    age: 0,
    fertilizerType: '',
    fertilizerQty: '',
    lastFertilizerDate: '',
    lastPruningDate: '',
    lastWeedingDate: '',
  });

  // Auto-calculate age when planted date changes
  useEffect(() => {
    const age = calculateTreeAge(formData.plantedDate);
    setFormData((prev) => ({ ...prev, age }));
  }, [formData.plantedDate]);

  // Fetch blocks on component mount
  useEffect(() => {
    fetchBlocks();
  }, []);

  // Fetch blocks from API using service layer
  const fetchBlocks = async () => {
    setBlocksLoading(true);
    try {
      console.log('🔗 Fetching blocks...');
      
      const result = await fetchAllBlocks();
      console.log('📦 Blocks API Response:', result);
      
      if (result.success && result.data) {
        setBlocks(result.data);
        console.log('✅ Blocks loaded successfully:', result.data.length, 'blocks');
      } else {
        console.warn('⚠️ No blocks data in response:', result.message);
        Alert.alert('Warning', result.message || 'Could not load blocks. You can still enter Block ID manually.');
      }
    } catch (error) {
      console.error('❌ Error fetching blocks:', error);
      Alert.alert('Warning', 'Could not load blocks. You can still enter Block ID manually.');
    } finally {
      setBlocksLoading(false);
    }
  };

  // Get current GPS location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to set GPS coordinates.'
        );
        setLocationLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setFormData((prev) => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));

      Alert.alert(
        'Location Set',
        `GPS coordinates set:\nLatitude: ${location.coords.latitude.toFixed(6)}\nLongitude: ${location.coords.longitude.toFixed(6)}`
      );
    } catch (error: any) {
      console.error('Error getting location:', error);
      let errorMessage = 'Failed to get location. Please try again.';
      
      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = 'Location services are disabled. Please enable them in settings.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = 'Location request timed out. Please try again.';
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = 'Location unavailable. Please check your GPS signal.';
      }
      
      Alert.alert('Location Error', errorMessage);
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle planted date picker
  const handlePlantedDatePress = () => {
    if (formData.plantedDate) {
      const date = new Date(formData.plantedDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setPlantedDateValue(date);
      }
    }
    setShowPlantedDatePicker(true);
  };

  const handlePlantedDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPlantedDatePicker(false);

      if (event.type === 'set' && selectedDate) {
        const formattedDate = formatDate(selectedDate);
        setFormData((prev) => ({
          ...prev,
          plantedDate: formattedDate,
        }));
      }
    } else {
      // iOS - handled in the modal's Done button
      if (event.type === 'set' && selectedDate) {
        setPlantedDateValue(selectedDate);
      } else if (event.type === 'dismissed') {
        setShowPlantedDatePicker(false);
      }
    }
  };

  // Handlers for other date pickers
  const handleFertilizerDatePress = () => {
    if (formData.lastFertilizerDate) {
      const date = new Date(formData.lastFertilizerDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setFertilizerDateValue(date);
      }
    }
    setShowFertilizerDatePicker(true);
  };

  const handleFertilizerDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowFertilizerDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = formatDate(selectedDate);
        setFormData((prev) => ({ ...prev, lastFertilizerDate: formattedDate }));
      }
    } else if (event.type === 'set' && selectedDate) {
      setFertilizerDateValue(selectedDate);
    }
  };

  const handlePruningDatePress = () => {
    if (formData.lastPruningDate) {
      const date = new Date(formData.lastPruningDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setPruningDateValue(date);
      }
    }
    setShowPruningDatePicker(true);
  };

  const handlePruningDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPruningDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = formatDate(selectedDate);
        setFormData((prev) => ({ ...prev, lastPruningDate: formattedDate }));
      }
    } else if (event.type === 'set' && selectedDate) {
      setPruningDateValue(selectedDate);
    }
  };

  const handleWeedingDatePress = () => {
    if (formData.lastWeedingDate) {
      const date = new Date(formData.lastWeedingDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        setWeedingDateValue(date);
      }
    }
    setShowWeedingDatePicker(true);
  };

  const handleWeedingDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowWeedingDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        const formattedDate = formatDate(selectedDate);
        setFormData((prev) => ({ ...prev, lastWeedingDate: formattedDate }));
      }
    } else if (event.type === 'set' && selectedDate) {
      setWeedingDateValue(selectedDate);
    }
  };

  // Validate and submit form
  const handleSubmit = async () => {
    // Validate form
    const validation = validateTreeForm(formData);
    if (!validation.valid) {
      Alert.alert('Error', validation.error || 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare tree data for API
      const treeData: TreeData = {
        blockId: formData.blockId.trim(),
        treeNumber: formData.treeNumber || undefined, // Will be auto-generated by backend
        latitude: formData.latitude,
        longitude: formData.longitude,
        placeId: formData.placeId.trim() || undefined,
        plantedDate: formData.plantedDate || undefined,
        age: formData.age > 0 ? formData.age : undefined,
        fertilizerType: formData.fertilizerType.trim() || undefined,
        fertilizerQty: formData.fertilizerQty.trim() || undefined,
        lastFertilizerDate: formData.lastFertilizerDate || undefined,
        lastPruningDate: formData.lastPruningDate || undefined,
        lastWeedingDate: formData.lastWeedingDate || undefined,
      };

      console.log('Submitting tree data:', treeData);
      
      const response = await addTree(treeData);

      if (response.success) {
        Alert.alert(
          'Success',
          response.message || 'Tree added successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to add tree. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting tree:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof TreeFormData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#388E3C']}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="leaf" size={40} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.headerTitle}>Add New Tree</Text>
          <Text style={styles.headerSubtitle}>Register a new oil palm tree</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* Block ID Dropdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Block ID *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowBlockDropdown(true)}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="grid-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  {formData.blockId ? (
                    <>
                      <Text style={[styles.dateText, { marginBottom: 2 }]}>
                        {formData.blockId}
                      </Text>
                      <Text style={[styles.helperText, { marginTop: 0 }]}>
                        {blocks.find(b => b.id === formData.blockId)?.name || 'Loading...'}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.dateText, styles.placeholderText]}>
                      Select Block
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-down" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>

            {/* Block Dropdown Modal */}
            <Modal
              visible={showBlockDropdown}
              transparent
              animationType="slide"
              onRequestClose={() => setShowBlockDropdown(false)}
            >
              <View style={styles.dropdownModal}>
                <View style={styles.dropdownContainer}>
                  <View style={styles.dropdownHeader}>
                    <Text style={styles.dropdownTitle}>Select Block</Text>
                    <TouchableOpacity
                      onPress={() => setShowBlockDropdown(false)}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color="#757575" />
                    </TouchableOpacity>
                  </View>

                  {blocksLoading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#2E7D32" />
                      <Text style={styles.loadingText}>Loading blocks...</Text>
                    </View>
                  ) : blocks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="folder-open-outline" size={48} color="#9E9E9E" />
                      <Text style={styles.emptyText}>No blocks available</Text>
                      <Text style={styles.emptySubtext}>Please contact administrator to add blocks</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={blocks}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            formData.blockId === item.id && styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            updateFormData('blockId', item.id);
                            setShowBlockDropdown(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownItemContent}>
                            <View style={styles.dropdownItemLeft}>
                              <Ionicons 
                                name="grid" 
                                size={20} 
                                color={formData.blockId === item.id ? '#2E7D32' : '#757575'} 
                              />
                              <View style={styles.dropdownItemText}>
                                <Text style={[
                                  styles.dropdownItemTitle,
                                  formData.blockId === item.id && styles.dropdownItemTitleSelected,
                                ]}>
                                  {item.id}
                                </Text>
                                <Text style={styles.dropdownItemSubtitle}>
                                  {item.name} • {item.areaSize}
                                </Text>
                              </View>
                            </View>
                            {formData.blockId === item.id && (
                              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                            )}
                          </View>
                        </TouchableOpacity>
                      )}
                      ItemSeparatorComponent={() => <View style={styles.dropdownSeparator} />}
                    />
                  )}
                </View>
              </View>
            </Modal>
          </View>

          {/* GPS Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location (Optional)</Text>
            
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              activeOpacity={0.8}
              disabled={locationLoading}
            >
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.locationButtonGradient}
              >
                {locationLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="location" size={20} color="#FFFFFF" />
                    <Text style={styles.locationButtonText}>Set GPS Location</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {formData.latitude !== null && formData.longitude !== null && (
              <View style={styles.locationInfo}>
                <View style={styles.locationRow}>
                  <Ionicons name="pin" size={16} color="#4CAF50" />
                  <Text style={styles.locationText}>
                    Lat: {formData.latitude.toFixed(6)}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="pin" size={16} color="#4CAF50" />
                  <Text style={styles.locationText}>
                    Lng: {formData.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Google Place ID (Optional)</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="map-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Place ID"
                  placeholderTextColor="#9E9E9E"
                  value={formData.placeId}
                  onChangeText={(value) => updateFormData('placeId', value)}
                  editable={!loading}
                />
              </View>
              <Text style={styles.helperText}>Optional: Google Maps Place ID for location reference</Text>
            </View>
          </View>

          {/* Planting Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planting Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Planted Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={handlePlantedDatePress}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !formData.plantedDate && styles.placeholderText]}>
                  {formData.plantedDate ? formatDateDisplay(formData.plantedDate) : 'Tap to select date from calendar'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
            
            {/* Date Picker Modal for Planted Date */}
            {showPlantedDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal
                  visible={showPlantedDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowPlantedDatePicker(false)}
                >
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity
                          onPress={() => setShowPlantedDatePicker(false)}
                          style={styles.datePickerCancelButton}
                        >
                          <Text style={styles.datePickerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.datePickerTitle}>Select Planted Date</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const formattedDate = formatDate(plantedDateValue);
                            setFormData((prev) => ({
                              ...prev,
                              plantedDate: formattedDate,
                            }));
                            setShowPlantedDatePicker(false);
                          }}
                          style={styles.datePickerDoneButton}
                        >
                          <Text style={styles.datePickerDoneText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={plantedDateValue}
                        mode="date"
                        display="spinner"
                        onChange={(event, date) => {
                          if (event.type === 'set' && date) {
                            setPlantedDateValue(date);
                          }
                        }}
                        maximumDate={new Date()}
                        style={styles.datePicker}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={plantedDateValue}
                  mode="date"
                  display="default"
                  onChange={handlePlantedDateChange}
                  maximumDate={new Date()}
                />
              )
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tree Age</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="time-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  placeholder="Auto-calculated"
                  placeholderTextColor="#9E9E9E"
                  value={formData.age > 0 ? `${formData.age} years` : ''}
                  editable={false}
                />
                <Ionicons name="lock-closed" size={16} color="#9E9E9E" />
              </View>
              <Text style={styles.helperText}>Automatically calculated from planted date</Text>
            </View>
          </View>

          {/* Fertilizer Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fertilizer Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fertilizer Type</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="leaf-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter fertilizer type"
                  placeholderTextColor="#9E9E9E"
                  value={formData.fertilizerType}
                  onChangeText={(value) => updateFormData('fertilizerType', value)}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fertilizer Quantity</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="scale-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity (kg)"
                  placeholderTextColor="#9E9E9E"
                  value={formData.fertilizerQty}
                  onChangeText={(value) => updateFormData('fertilizerQty', value)}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Fertilizer Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={handleFertilizerDatePress}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !formData.lastFertilizerDate && styles.placeholderText]}>
                  {formData.lastFertilizerDate ? formatDateDisplay(formData.lastFertilizerDate) : 'Select Last Fertilizer Date'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>

            {/* Fertilizer Date Picker */}
            {showFertilizerDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal
                  visible={showFertilizerDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowFertilizerDatePicker(false)}
                >
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity
                          onPress={() => setShowFertilizerDatePicker(false)}
                          style={styles.datePickerCancelButton}
                        >
                          <Text style={styles.datePickerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.datePickerTitle}>Last Fertilizer Date</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const formattedDate = formatDate(fertilizerDateValue);
                            setFormData((prev) => ({ ...prev, lastFertilizerDate: formattedDate }));
                            setShowFertilizerDatePicker(false);
                          }}
                          style={styles.datePickerDoneButton}
                        >
                          <Text style={styles.datePickerDoneText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={fertilizerDateValue}
                        mode="date"
                        display="spinner"
                        onChange={handleFertilizerDateChange}
                        maximumDate={new Date()}
                        style={styles.datePicker}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={fertilizerDateValue}
                  mode="date"
                  display="default"
                  onChange={handleFertilizerDateChange}
                  maximumDate={new Date()}
                />
              )
            )}
          </View>

          {/* Maintenance Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maintenance Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Pruning Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={handlePruningDatePress}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !formData.lastPruningDate && styles.placeholderText]}>
                  {formData.lastPruningDate ? formatDateDisplay(formData.lastPruningDate) : 'Select Last Pruning Date'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>

            {/* Pruning Date Picker */}
            {showPruningDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal
                  visible={showPruningDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowPruningDatePicker(false)}
                >
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity
                          onPress={() => setShowPruningDatePicker(false)}
                          style={styles.datePickerCancelButton}
                        >
                          <Text style={styles.datePickerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.datePickerTitle}>Last Pruning Date</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const formattedDate = formatDate(pruningDateValue);
                            setFormData((prev) => ({ ...prev, lastPruningDate: formattedDate }));
                            setShowPruningDatePicker(false);
                          }}
                          style={styles.datePickerDoneButton}
                        >
                          <Text style={styles.datePickerDoneText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={pruningDateValue}
                        mode="date"
                        display="spinner"
                        onChange={handlePruningDateChange}
                        maximumDate={new Date()}
                        style={styles.datePicker}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={pruningDateValue}
                  mode="date"
                  display="default"
                  onChange={handlePruningDateChange}
                  maximumDate={new Date()}
                />
              )
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Weeding Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={handleWeedingDatePress}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !formData.lastWeedingDate && styles.placeholderText]}>
                  {formData.lastWeedingDate ? formatDateDisplay(formData.lastWeedingDate) : 'Select Last Weeding Date'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>

            {/* Weeding Date Picker */}
            {showWeedingDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal
                  visible={showWeedingDatePicker}
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowWeedingDatePicker(false)}
                >
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerContainer}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity
                          onPress={() => setShowWeedingDatePicker(false)}
                          style={styles.datePickerCancelButton}
                        >
                          <Text style={styles.datePickerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.datePickerTitle}>Last Weeding Date</Text>
                        <TouchableOpacity
                          onPress={() => {
                            const formattedDate = formatDate(weedingDateValue);
                            setFormData((prev) => ({ ...prev, lastWeedingDate: formattedDate }));
                            setShowWeedingDatePicker(false);
                          }}
                          style={styles.datePickerDoneButton}
                        >
                          <Text style={styles.datePickerDoneText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={weedingDateValue}
                        mode="date"
                        display="spinner"
                        onChange={handleWeedingDateChange}
                        maximumDate={new Date()}
                        style={styles.datePicker}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={weedingDateValue}
                  mode="date"
                  display="default"
                  onChange={handleWeedingDateChange}
                  maximumDate={new Date()}
                />
              )
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={loading}
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
                  <Text style={styles.submitButtonText}>Save Tree</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FBF7',
  },
  headerGradient: {
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 32,
    top: 0,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  disabledInput: {
    backgroundColor: '#FAFAFA',
    color: '#9E9E9E',
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    fontStyle: 'italic',
  },
  locationButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  locationButtonGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  locationInfo: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 8,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 12,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  placeholderText: {
    color: '#9E9E9E',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  datePicker: {
    width: '100%',
    height: 200,
  },
  dropdownModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dropdownItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemText: {
    marginLeft: 12,
    flex: 1,
  },
  dropdownItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  dropdownItemTitleSelected: {
    color: '#2E7D32',
  },
  dropdownItemSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 52,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  datePickerCancelText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif' },
    }),
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
  datePickerDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  datePickerDoneText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-medium' },
    }),
  },
});

