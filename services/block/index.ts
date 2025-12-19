import { API_BASE_URL, ApiResponse } from '../api-config';
import type { BlockResponse } from './types';

export type { Block, BlockResponse } from './types';

/**
 * GET /api/blocks
 */
export async function fetchAllBlocks(): Promise<ApiResponse<BlockResponse[]>> {
  try {
    console.log('🌐 API_BASE_URL:', API_BASE_URL);

    // Build candidate endpoints from API_BASE_URL with host fallbacks.
    const candidatePaths: string[] = [];
    try {
      const parsed = new URL(API_BASE_URL);
      const pathname = parsed.pathname.replace(/\/$/, ''); // e.g. /api
      const port = parsed.port ? `:${parsed.port}` : '';
      const protocol = parsed.protocol; // e.g. http:

      // Hosts to try: original, localhost variants, emulator hosts, and common local network IPs
      const hosts = [parsed.hostname, 'localhost', '127.0.0.1', '10.0.2.2', '172.20.10.2'];

      for (const host of hosts) {
        // avoid duplicates
        if (!host) continue;
        const base = `${protocol}//${host}${port}${pathname}`.replace(/\/$/, '');
        candidatePaths.push(`${base}/blocks`);
        candidatePaths.push(`${base}/trees/blocks`);
      }
    } catch (e) {
      // Fallback if API_BASE_URL isn't a full URL
      candidatePaths.push(`${API_BASE_URL.replace(/\/$/, '')}/blocks`);
      candidatePaths.push(`${API_BASE_URL.replace(/\/$/, '')}/trees/blocks`);
    }

    // Deduplicate candidatePaths while preserving order
    const seen = new Set<string>();
    const uniqueCandidates = candidatePaths.filter((p) => (seen.has(p) ? false : seen.add(p)));

    let lastError: any = null;
    for (const url of uniqueCandidates) {
      try {
        console.log('🌍 Trying blocks endpoint:', url);
        const response = await fetch(url);
        console.log('📡 Response status for', url, response.status, response.statusText);

        const data = await response.json().catch((e) => {
          console.warn('⚠️ JSON parse failed for', url, e);
          return null;
        });

        console.log('📦 Response data for', url, JSON.stringify(data, null, 2));

        if (!response.ok) {
          lastError = { url, status: response.status, body: data };
          continue;
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

        lastError = { url, status: response.status, body: data };
      } catch (error) {
        console.error('💥 Network/request error for', url, error);
        lastError = error;
        // try next candidate
      }
    }

    console.error('❌ All candidate endpoints failed for fetching blocks', lastError);
    return { success: false, message: 'Failed to fetch blocks from backend', data: [] };
  } catch (error) {
    console.error('💥 Unexpected fetchAllBlocks error:', error);
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unable to connect'}`,
      data: [],
    };
  }
}
