import {
  LISTING_AMENITIES,
  LISTING_ROOM_FEATURES,
  LISTING_UTILITIES,
} from './listingStepChipsData';
import { CreateListingChipSelectScreen } from './CreateListingChipSelectScreen';
import { STEP_LISTING_TAGS } from './createListingTokens';

export type CreateListingScreenFiveProps = {
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
};

/** Step 5: Amenity, room features, and utility — one scrollable screen. */
export function CreateListingScreenFive({
  onClose,
  onBack,
  onContinue,
}: CreateListingScreenFiveProps) {
  return (
    <CreateListingChipSelectScreen
      step={STEP_LISTING_TAGS}
      progressCaptionSuffix='Tags & inclusions'
      sections={[
        { title: 'Building & community', items: LISTING_AMENITIES },
        { title: 'Inside your unit', items: LISTING_ROOM_FEATURES },
        { title: "What's covered in rent", items: LISTING_UTILITIES },
      ]}
      requireEachSection
      onClose={onClose}
      onBack={onBack}
      onContinue={onContinue}
    />
  );
}
