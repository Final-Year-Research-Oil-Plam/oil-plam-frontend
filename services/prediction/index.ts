import { API_BASE_URL, ApiResponse } from '../api-config';
import type { PredictionResponse } from './types';

/**
 * POST /api/bunches/predict
 * Send image and tree data for bunch prediction
 */
export async function predictBunch(
  blockId: string,
  treeId: string,
  imageUri: string
): Promise<ApiResponse<PredictionResponse>> {
  try {
    // First test basic connectivity
    console.log('🔍 Testing backend connectivity...');
    try {
      const healthCheck = await fetch(`${API_BASE_URL}/health`);
      console.log('✅ Backend reachable:', healthCheck.status);
    } catch (healthError) {
      console.warn('⚠️ Backend health check failed:', healthError);
    }

    console.log('🔮 Starting prediction request:', {
      blockId,
      treeId,
      imageUri: imageUri.substring(0, 50) + '...'
    });

    // Create FormData to send image
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || `bunch_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    console.log('📄 Image details:', { filename, type, imageUri });

    // Append image file for React Native with proper structure
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    // Append other data as strings
    formData.append('blockId', String(blockId));
    formData.append('treeId', String(treeId));

    console.log('📡 FormData contents:');
    console.log('  - image:', { uri: imageUri, name: filename, type });
    console.log('  - blockId:', blockId);
    console.log('  - treeId:', treeId);
    console.log('📡 Sending request to:', `${API_BASE_URL}/bunches/predict`);

    const response = await fetch(`${API_BASE_URL}/bunches/predict`, {
      method: 'POST',
      body: formData,
    });

    console.log('📤 Response status:', response.status);
    console.log('📤 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📥 Response data:', data);

    if (!response.ok) {
      console.error('❌ Prediction API Error:', {
        status: response.status,
        statusText: response.statusText,
        message: data.message,
        error: data.error
      });
      
      return {
        success: false,
        message: data.message || `Server error (${response.status}): ${response.statusText}`,
      };
    }

    // Success - log the Cloudinary details
    if (data.success && data.data?.cloudinaryUrl) {
      console.log('✅ Image uploaded to Cloudinary:', data.data.cloudinaryUrl);
      console.log('✅ Bunch created with ID:', data.data.bunchId);
    }

    return data;
  } catch (error) {
    console.error('❌ Prediction request failed:', error);
    
    // Handle specific React Native network errors
    if (error instanceof Error) {
      if (error.message.includes('Network request failed')) {
        return {
          success: false,
          message: 'Network error: Cannot connect to server. Please check your internet connection and ensure the backend server is running.',
        };
      }
      
      if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
        return {
          success: false,
          message: 'Request timeout: The server is taking too long to respond. Please try again.',
        };
      }
      
      if (error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Connection error: Unable to reach the prediction service. Please try again.',
        };
      }
      
      if (error.message.includes('JSON')) {
        return {
          success: false,
          message: 'Server response error: Invalid response format from server.',
        };
      }
    }
    
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
    };
  }
}

export type { PredictionRequest, PredictionResponse } from './types';
