import { LISTING_TOTAL_STEPS } from '../screens/createListing/createListingTokens';
import { StepProgressBlock, type StepProgressBlockProps } from './StepProgressBlock';

export type ListingProgressBlockProps = Omit<StepProgressBlockProps, 'totalSteps'> & {
  totalSteps?: number;
};

/** Create-listing progress chrome (shelled track). */
export function ListingProgressBlock({
  totalSteps = LISTING_TOTAL_STEPS,
  ...props
}: ListingProgressBlockProps) {
  return <StepProgressBlock totalSteps={totalSteps} {...props} />;
}
