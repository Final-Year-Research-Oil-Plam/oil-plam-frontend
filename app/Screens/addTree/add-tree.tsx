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

export default function AddTreeScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showPlantedDatePicker, setShowPlantedDatePicker] = useState(false);
  const [plantedDateValue, setPlantedDateValue] = useState<Date>(new Date());
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
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
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

  // Show date picker for other date fields (keeping simple for now)
  const showDatePicker = (field: 'lastFertilizerDate' | 'lastPruningDate' | 'lastWeedingDate') => {
    Alert.prompt(
      'Select Date',
      'Enter date in YYYY-MM-DD format',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Use Today',
          onPress: () => {
            const today = formatDate(new Date());
            setFormData((prev) => ({ ...prev, [field]: today }));
          },
        },
        {
          text: 'OK',
          onPress: (date?: string) => {
            if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
              setFormData((prev) => ({ ...prev, [field]: date }));
            } else {
              Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format');
            }
          },
        },
      ],
      'plain-text',
      formData[field] || formatDate(new Date())
    );
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
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="add-circle" size={40} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.headerTitle}>Add New Tree</Text>
          <Text style={styles.headerSubtitle}>Register oil palm tree information</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          {/* Block ID */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Block ID *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="grid-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter Block ID"
                  placeholderTextColor="#9E9E9E"
                  value={formData.blockId}
                  onChangeText={(value) => updateFormData('blockId', value)}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tree Number</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="code-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  placeholder="Auto-generated"
                  placeholderTextColor="#9E9E9E"
                  value={formData.treeNumber}
                  editable={false}
                />
                <Ionicons name="lock-closed" size={16} color="#9E9E9E" />
              </View>
              <Text style={styles.helperText}>Tree number will be auto-generated in database</Text>
            </View>
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
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Fertilizer Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => showDatePicker('lastFertilizerDate')}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !formData.lastFertilizerDate && styles.placeholderText]}>
                  {formData.lastFertilizerDate || 'Select Last Fertilizer Date'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Maintenance Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maintenance Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Pruning Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => showDatePicker('lastPruningDate')}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !formData.lastPruningDate && styles.placeholderText]}>
                  {formData.lastPruningDate || 'Select Last Pruning Date'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Weeding Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => showDatePicker('lastWeedingDate')}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" style={styles.inputIcon} />
                <Text style={[styles.dateText, !formData.lastWeedingDate && styles.placeholderText]}>
                  {formData.lastWeedingDate || 'Select Last Weeding Date'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
              </TouchableOpacity>
            </View>
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
    paddingVertical: 18,
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
  datePicker: {
    width: '100%',
    height: 200,
  },
});

