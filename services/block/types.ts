// Frontend Block type (matches API response)
export interface Block {
  id: string;        // BLOCK-A
  name: string;      // North Section A
  areaSize: string;  // 2.5 hectares
}

// Explicit API response type (same shape)
export interface BlockResponse {
  id: string;
  name: string;
  areaSize: string;
}
