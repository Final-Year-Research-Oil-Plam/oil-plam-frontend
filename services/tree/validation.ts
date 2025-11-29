import { TreeFormData } from './types';

export const validateTreeForm = (formData: TreeFormData): { valid: boolean; error?: string } => {
  if (!formData.blockId.trim()) {
    return {
      valid: false,
      error: 'Please enter Block ID',
    };
  }

  if (!formData.plantedDate) {
    return {
      valid: false,
      error: 'Please enter Planted Date',
    };
  }

  return { valid: true };
};

export const validateGpsCoordinates = (latitude: number | null, longitude: number | null): boolean => {
  return latitude !== null && longitude !== null;
};

export const validateFertilizerQty = (qty: string): boolean => {
  if (!qty) return true; // Optional field
  const num = parseFloat(qty);
  return !isNaN(num) && num >= 0;
};
