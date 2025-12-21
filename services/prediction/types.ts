export interface PredictionRequest {
  blockId: string;
  treeId: string;
  imageUri: string;
}

export interface PredictionResponse {
  predictedBunches?: number;
  confidence?: number;
  imageUrl?: string;
  timestamp?: string;
  [key: string]: any;
}
