import { API_BASE_URL, ApiResponse } from '../api-config';
import { TreeData, TreeResponse, TreeFormData } from './types';

// Add tree
export async function addTree(treeData: TreeData): Promise<ApiResponse<TreeResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/trees/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(treeData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to add tree. Please try again.',
      };
    }

    return data;
  } catch (error) {
    console.error('Add tree error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

// Get tree by ID
export async function getTreeById(treeId: string): Promise<ApiResponse<TreeResponse>> {
  try {
    const response = await fetch(`${API_BASE_URL}/trees/${treeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch tree. Please try again.',
      };
    }

    return data;
  } catch (error) {
    console.error('Get tree error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

// Get all trees
export async function getAllTrees(): Promise<ApiResponse<TreeResponse[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/trees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch trees. Please try again.',
      };
    }

    return data;
  } catch (error) {
    console.error('Get trees error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

// Search/filter trees by block_id (Cascading Dropdown)
export async function searchTreesByBlock(blockId: string): Promise<ApiResponse<TreeResponse[]>> {
  try {
    console.log('🌲 Fetching trees for block:', blockId);
    const url = `${API_BASE_URL}/trees/by-block/${encodeURIComponent(blockId)}`;
    console.log('🌍 URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('📦 Trees response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch trees for this block. Please try again.',
        data: [],
      };
    }

    return data;
  } catch (error) {
    console.error('Search trees by block error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

// Export types and utilities
export type { TreeData, TreeResponse, TreeFormData };
export { validateTreeForm, validateGpsCoordinates, validateFertilizerQty } from './validation';
export {
  formatDate,
  formatDateDisplay,
  calculateTreeAge,
  isValidDate,
  isDateInPast,
} from './utils';
