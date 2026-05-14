export type ListingRoomRow = { id: string; kind: string; price: string };

/** Snapshot passed from step 3 → step 4 (and restored when backing into step 3). */
export type ListingStep3Snapshot = {
  propertyTypeId: string | null;
  bedroom: number | null;
  bathroom: number | null;
  rooms: ListingRoomRow[];
};
