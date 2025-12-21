import { API_BASE_URL, ApiResponse } from '../api-config';
import type { PredictionResponse } from './types';

/**
 * POST /api/predict/bunch
 * Send image and tree data for bunch prediction
 */
export async function predictBunch(
  blockId: string,
  treeId: string,
  imageUri: string
): Promise<ApiResponse<PredictionResponse>> {
  try {
    // Create FormData to send image
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'bunch.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Append image file
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    // Append other data
    formData.append('blockId', blockId);
    formData.append('treeId', treeId);

    const response = await fetch(`${API_BASE_URL}/bunches/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to predict bunch yield. Please try again.',
      };
    }

    return data;
  } catch (error) {
    console.error('Prediction error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

export type { PredictionRequest, PredictionResponse } from './types';
