export interface QRCodeResponse {
  treeId: string;
  treeNumber: string;
  qrCodeImage: string; // base64 PNG image
  message?: string;
}

export interface BulkQRResponse {
  trees: Array<{
    treeId: string;
    treeNumber: string;
    qrCodeImage: string; // base64 PNG image
  }>;
  count: number;
}

export interface PublicTreeDetails {
  treeNumber: string;
  blockId: string;
  age: number;
  plantedDate: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  fertilizer?: {
    type: string;
    quantity: string;
    lastApplied: string;
  };
  maintenance?: {
    lastPruning: string;
    lastWeeding: string;
  };
  harvest?: {
    recentBunches: Array<{
      date: string;
      count: number;
      weight?: number;
    }>;
    estimatedNextHarvest?: string;
  };
  scanCount?: number;
  lastScanned?: string;
}

export interface QRScanStats {
  treeId: string;
  treeNumber: string;
  scanCount: number;
  lastScanned: string;
  scans: Array<{
    timestamp: string;
    location?: string;
  }>;
}
