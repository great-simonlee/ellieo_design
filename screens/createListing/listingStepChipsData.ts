import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type Ion = ComponentProps<typeof Ionicons>['name'];

export type ListingChipDef = { id: string; label: string; icon: Ion };

export const LISTING_AMENITIES: ListingChipDef[] = [
  { id: 'elevator', label: 'Elevator', icon: 'arrow-up-outline' },
  { id: 'fitness', label: 'Fitness Center', icon: 'barbell-outline' },
  { id: 'concierge', label: 'Concierge Service', icon: 'people-outline' },
  { id: 'parking', label: 'Parking Garage', icon: 'car-outline' },
  { id: 'laundry', label: 'Laundry Room', icon: 'shirt-outline' },
  { id: 'cowork', label: 'Working Space', icon: 'laptop-outline' },
  { id: 'bbq', label: 'BBQ Grills', icon: 'flame-outline' },
  { id: 'rooftop', label: 'Rooftop', icon: 'sunny-outline' },
  { id: 'pool', label: 'Indoor Pool', icon: 'water-outline' },
  { id: 'golf', label: 'Indoor Golf', icon: 'flag-outline' },
  { id: 'yoga', label: 'Yoga Room', icon: 'body-outline' },
  { id: 'pilates', label: 'Pilates Room', icon: 'fitness-outline' },
  { id: 'sauna', label: 'Sauna', icon: 'thermometer-outline' },
  { id: 'pickleball', label: 'Pickleball Court', icon: 'tennisball-outline' },
  { id: 'squash', label: 'Squash Court', icon: 'ellipse-outline' },
  { id: 'pingpong', label: 'Ping Pong', icon: 'radio-button-on-outline' },
  { id: 'bowling', label: 'Bowling', icon: 'disc-outline' },
  { id: 'basketball', label: 'Basketball Court', icon: 'basketball-outline' },
  { id: 'arcade', label: 'Arcade Room', icon: 'game-controller-outline' },
  { id: 'karaoke', label: 'Karaoke', icon: 'mic-outline' },
];

export const LISTING_ROOM_FEATURES: ListingChipDef[] = [
  { id: 'washer', label: 'In-unit Washer / Dryer', icon: 'shirt-outline' },
  { id: 'oven', label: 'Oven', icon: 'flame-outline' },
  { id: 'microwave', label: 'Microwave', icon: 'cafe-outline' },
  { id: 'dishwasher', label: 'Dishwasher', icon: 'water-outline' },
  { id: 'fridge', label: 'Refrigerator', icon: 'snow-outline' },
  { id: 'terrace', label: 'Terrace', icon: 'home-outline' },
  { id: 'ac', label: 'Air Conditioner', icon: 'partly-sunny-outline' },
];

export const LISTING_UTILITIES: ListingChipDef[] = [
  { id: 'water', label: 'Water included', icon: 'water-outline' },
  { id: 'gas', label: 'Gas included', icon: 'flame-outline' },
  { id: 'wifi', label: 'WiFi included', icon: 'wifi-outline' },
  { id: 'electric', label: 'Electricity included', icon: 'flash-outline' },
];
