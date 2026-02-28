import { API_BASE_URL, ApiResponse } from '../api-config';
import type { BlockResponse } from './types';

export type { Block, BlockResponse } from './types';

/**
 * GET /api/blocks
 */
export async function fetchAllBlocks(): Promise<ApiResponse<BlockResponse[]>> {
  try {
    console.log('🌐 API_BASE_URL:', API_BASE_URL);

    // Simple approach: just use the API_BASE_URL directly
    const url = `${API_BASE_URL}/blocks`;
    console.log('🌍 Fetching blocks from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    const data = await response.json().catch((e) => {
      console.warn('⚠️ JSON parse failed:', e);
      return null;
    });

    console.log('📦 Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, data);
      return {
        success: false,
        message: data?.message || `Failed to fetch blocks (HTTP ${response.status})`,
        data: [],
      };
    }

    // Normalize response shape: either ApiResponse or raw array
    if (data && data.success !== undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return { success: true, message: 'Blocks fetched successfully', data };
    }

    // If server returns object with `data` property that is array
    if (data && Array.isArray(data.data)) {
      return { success: true, message: 'Blocks fetched successfully', data: data.data };
    }

    console.error('❌ Unexpected response format:', data);
    return {
      success: false,
      message: 'Unexpected response format from server',
      data: [],
    };
  } catch (error) {
    console.error('💥 Fetch blocks error:', error);
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unable to connect'}`,
      data: [],
    };
  }
}
