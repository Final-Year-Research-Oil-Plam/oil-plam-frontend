export interface PredictionRequest {
  blockId: string;
  treeId: string;
  imageUri: string;
}

export interface PredictionResponse {
  bunchId?: number;
  bunchNumber?: string;
  treeNumber?: string;
  cloudinaryUrl?: string;
  predictedBunches?: number;
  confidence?: number;
  timestamp?: string;
  [key: string]: any;
}
