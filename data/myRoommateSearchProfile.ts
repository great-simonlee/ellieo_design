import { ONBOARDING_PREVIEW_PROFILE } from '../components/RoommateProfileDetail';

/** Design-only — current user's roommate-matching preferences. */
export type MyRoommateSearchProfile = {
  gender: string;
  budget: string;
  moveIn: string;
  preferredRoommateGender: string;
  preferredStatus: string;
  preferredRoom: string;
  preferredLocations: string;
  briefIntroduction: string;
  lifestyleSummary: string;
};

export const MY_ROOMMATE_SEARCH_PROFILE: MyRoommateSearchProfile = {
  gender: 'He / him',
  budget: ONBOARDING_PREVIEW_PROFILE.budget,
  moveIn: ONBOARDING_PREVIEW_PROFILE.moveIn,
  preferredRoommateGender: ONBOARDING_PREVIEW_PROFILE.roommatePreference,
  preferredStatus: ONBOARDING_PREVIEW_PROFILE.statusPreference,
  preferredRoom: ONBOARDING_PREVIEW_PROFILE.roomPreference,
  preferredLocations: ONBOARDING_PREVIEW_PROFILE.preferredLocation,
  briefIntroduction:
    'Quiet weekdays, gallery walks on weekends, and early-morning coffee runs. Looking for a tidy 2BR near Midtown.',
  lifestyleSummary: ONBOARDING_PREVIEW_PROFILE.tags.join(' · '),
};

export type RoommatePrefReviewFieldId =
  | 'gender'
  | 'budget'
  | 'moveIn'
  | 'preferredRoommateGender'
  | 'preferredStatus'
  | 'preferredRoom'
  | 'preferredLocations'
  | 'briefIntroduction'
  | 'lifestyle';

export const ROOMMATE_PREF_REVIEW_FIELDS: {
  id: RoommatePrefReviewFieldId;
  label: string;
  icon: import('@expo/vector-icons').Ionicons['name'];
}[] = [
  { id: 'gender', label: 'My gender', icon: 'person-outline' },
  { id: 'budget', label: 'Budget', icon: 'wallet-outline' },
  { id: 'moveIn', label: 'Move-in date', icon: 'calendar-outline' },
  {
    id: 'preferredRoommateGender',
    label: 'Preferred roommate gender',
    icon: 'people-outline',
  },
  {
    id: 'preferredStatus',
    label: 'Preferred status',
    icon: 'school-outline',
  },
  { id: 'preferredRoom', label: 'Preferred room', icon: 'bed-outline' },
  {
    id: 'preferredLocations',
    label: 'Preferred locations',
    icon: 'location-outline',
  },
  {
    id: 'briefIntroduction',
    label: 'Brief introduction',
    icon: 'document-text-outline',
  },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'sparkles-outline' },
];

export function roommatePrefValue(
  profile: MyRoommateSearchProfile,
  id: RoommatePrefReviewFieldId,
): string {
  switch (id) {
    case 'gender':
      return profile.gender;
    case 'budget':
      return profile.budget;
    case 'moveIn':
      return profile.moveIn;
    case 'preferredRoommateGender':
      return profile.preferredRoommateGender;
    case 'preferredStatus':
      return profile.preferredStatus;
    case 'preferredRoom':
      return profile.preferredRoom;
    case 'preferredLocations':
      return profile.preferredLocations;
    case 'briefIntroduction':
      return profile.briefIntroduction;
    case 'lifestyle':
      return profile.lifestyleSummary;
    default:
      return '';
  }
}
