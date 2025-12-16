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
      error: 'Please select Planted Date',
    };
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(formData.plantedDate)) {
    return {
      valid: false,
      error: 'Invalid planted date format',
    };
  }

  // Validate fertilizer quantity if provided
  if (formData.fertilizerQty && formData.fertilizerQty.trim()) {
    const qty = parseFloat(formData.fertilizerQty);
    if (isNaN(qty) || qty < 0) {
      return {
        valid: false,
        error: 'Fertilizer quantity must be a positive number',
      };
    }
  }

  // Validate fertilizer type if quantity is provided
  if (formData.fertilizerQty && formData.fertilizerQty.trim() && !formData.fertilizerType.trim()) {
    return {
      valid: false,
      error: 'Please enter fertilizer type when quantity is provided',
    };
  }

  // Validate GPS coordinates if one is provided, both must be provided
  const hasLat = formData.latitude !== null;
  const hasLng = formData.longitude !== null;
  if (hasLat !== hasLng) {
    return {
      valid: false,
      error: 'Both latitude and longitude are required for GPS location',
    };
  }

  // Validate GPS coordinate ranges
  if (hasLat && hasLng) {
    if (formData.latitude! < -90 || formData.latitude! > 90) {
      return {
        valid: false,
        error: 'Latitude must be between -90 and 90',
      };
    }
    if (formData.longitude! < -180 || formData.longitude! > 180) {
      return {
        valid: false,
        error: 'Longitude must be between -180 and 180',
      };
    }
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
