import { API_BASE_URL, ApiResponse } from '../api-config';
import type { BlockResponse } from './types';

export type { Block, BlockResponse } from './types';

/**
 * GET /api/blocks
 */
export async function fetchAllBlocks(): Promise<ApiResponse<BlockResponse[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/blocks`);
    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message };
    }

    return data.success !== undefined
      ? data
      : { success: true, message: 'Blocks fetched successfully', data };
  } catch (error) {
    return {
      success: false,
      message: 'Network error while fetching blocks',
    };
  }
}
