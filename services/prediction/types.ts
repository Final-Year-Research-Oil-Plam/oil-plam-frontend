export interface PredictionRequest {
  blockId: string;
  treeId: string;
  imageUri: string;
}

export interface BunchCoordinate {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PredictionResponse {
  bunchId?: number;
  predictionId?: number;
  bunchNumber?: string;
  treeNumber?: string;
  blockId?: string;
  imageUrl?: string;
  cloudinaryUrl?: string;
  
  // YOLO Detection & Classification Results
  bunchCount?: number;                    // Number of bunches detected
  bunchCoordinates?: BunchCoordinate[];   // Bounding boxes [x1, y1, x2, y2]
  bunchClass?: 'ripe' | 'unripe';       // Classification result
  classConfidence?: number;              // Confidence 0-100
  harvestDay?: string;                   // "Day 2" to "Day 16"
  
  // Legacy fields
  predictedBunches?: number;
  confidence?: number;
  timestamp?: string;
  prediction?: any;
  
  [key: string]: any;
}
