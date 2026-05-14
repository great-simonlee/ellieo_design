import { useState } from 'react';
import { CreateListingScreenOneAndTwo } from './createListing/CreateListingScreenOneAndTwo';
import { CreateListingScreenThree } from './createListing/CreateListingScreenThree';
import { CreateListingScreenFour } from './createListing/CreateListingScreenFour';
import { CreateListingScreenFive } from './createListing/CreateListingScreenFive';
import { CreateListingScreenSix } from './createListing/CreateListingScreenSix';
import type { ListingStep3Snapshot } from './createListing/createListingTypes';

export type CreateListingScreenProps = {
  onClose: () => void;
};

type CreatePhase = 'oneTwo' | 'three' | 'four' | 'five' | 'six';

/**
 * Create-listing flow through step 6: photos/address, property, layouts,
 * amenities + features + utility, then move-in & lease.
 */
export function CreateListingScreen({ onClose }: CreateListingScreenProps) {
  const [phase, setPhase] = useState<CreatePhase>('oneTwo');
  const [step3Snapshot, setStep3Snapshot] = useState<ListingStep3Snapshot | null>(null);

  if (phase === 'six') {
    return (
      <CreateListingScreenSix
        onClose={onClose}
        onBack={() => setPhase('five')}
        onContinue={onClose}
      />
    );
  }

  if (phase === 'five') {
    return (
      <CreateListingScreenFive
        onClose={onClose}
        onBack={() => setPhase('four')}
        onContinue={() => setPhase('six')}
      />
    );
  }

  if (phase === 'four' && step3Snapshot) {
    return (
      <CreateListingScreenFour
        step3={step3Snapshot}
        onClose={onClose}
        onBack={() => setPhase('three')}
        onContinue={() => setPhase('five')}
      />
    );
  }

  if (phase === 'three') {
    return (
      <CreateListingScreenThree
        restoredSnapshot={step3Snapshot}
        onClose={onClose}
        onBack={() => {
          setStep3Snapshot(null);
          setPhase('oneTwo');
        }}
        onContinue={(snapshot) => {
          setStep3Snapshot(snapshot);
          setPhase('four');
        }}
      />
    );
  }

  return (
    <CreateListingScreenOneAndTwo
      onClose={onClose}
      onContinuePastAddress={() => {
        setStep3Snapshot(null);
        setPhase('three');
      }}
    />
  );
}
