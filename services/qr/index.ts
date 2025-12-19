import { API_BASE_URL, ApiResponse } from '../api-config';
import type { QRCodeResponse, BulkQRResponse, PublicTreeDetails, QRScanStats } from './types';

/**
 * Generate QR code for a specific tree
 * POST /api/qr/:treeId/generate-qr
 */
export async function generateQRCode(treeId: string): Promise<ApiResponse<QRCodeResponse>> {
  try {
    console.log('🔄 Generating QR code for tree:', treeId);
    const response = await fetch(`${API_BASE_URL}/qr/${treeId}/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to generate QR code',
      };
    }

    return {
      success: true,
      message: 'QR code generated successfully',
      data: data.data || data,
    };
  } catch (error) {
    console.error('💥 Generate QR code error:', error);
    return {
      success: false,
      message: 'Network error while generating QR code',
    };
  }
}

/**
 * Bulk generate QR codes for printing (web dashboard)
 * GET /api/qr/bulk-qr?blockId=BLOCK-A
 */
export async function bulkGenerateQRCodes(blockId?: string): Promise<ApiResponse<BulkQRResponse>> {
  try {
    const url = blockId 
      ? `${API_BASE_URL}/qr/bulk-qr?blockId=${encodeURIComponent(blockId)}`
      : `${API_BASE_URL}/qr/bulk-qr`;
    
    console.log('🔄 Bulk generating QR codes:', url);
    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to generate QR codes',
      };
    }

    return {
      success: true,
      message: 'QR codes generated successfully',
      data: data.data || data,
    };
  } catch (error) {
    console.error('💥 Bulk generate QR codes error:', error);
    return {
      success: false,
      message: 'Network error while generating QR codes',
    };
  }
}

/**
 * Get public tree details by tree number (NO AUTH REQUIRED)
 * GET /api/qr/public/:treeNumber
 */
export async function getPublicTreeDetails(treeNumber: string): Promise<ApiResponse<PublicTreeDetails>> {
  try {
    console.log('🔄 Fetching public tree details:', treeNumber);
    const response = await fetch(`${API_BASE_URL}/qr/public/${encodeURIComponent(treeNumber)}`);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Tree not found',
      };
    }

    return {
      success: true,
      message: 'Tree details fetched successfully',
      data: data.data || data,
    };
  } catch (error) {
    console.error('💥 Get public tree details error:', error);
    return {
      success: false,
      message: 'Network error while fetching tree details',
    };
  }
}

/**
 * Get QR scan statistics for a tree
 * GET /api/qr/:treeId/stats
 */
export async function getQRScanStats(treeId: string): Promise<ApiResponse<QRScanStats>> {
  try {
    console.log('🔄 Fetching QR scan stats:', treeId);
    const response = await fetch(`${API_BASE_URL}/qr/${treeId}/stats`);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to fetch scan stats',
      };
    }

    return {
      success: true,
      message: 'Scan stats fetched successfully',
      data: data.data || data,
    };
  } catch (error) {
    console.error('💥 Get scan stats error:', error);
    return {
      success: false,
      message: 'Network error while fetching scan stats',
    };
  }
}

// Export types
export type { QRCodeResponse, BulkQRResponse, PublicTreeDetails, QRScanStats };
