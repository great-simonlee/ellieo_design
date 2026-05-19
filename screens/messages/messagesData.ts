import type { ImageSourcePropType } from 'react-native';

export type MessageChannel = 'roommate' | 'agent';

export type ListingPreview = {
  id: string;
  bedsBaths: string;
  rooms?: string;
  prices: string;
  moveIn: string;
  image: ImageSourcePropType;
};

export type ChatMessage =
  | {
      id: string;
      fromMe: boolean;
      time: string;
      kind: 'text';
      text: string;
    }
  | {
      id: string;
      fromMe: boolean;
      time: string;
      kind: 'listing';
      listing: ListingPreview;
    }
  | {
      id: string;
      kind: 'date';
      label: string;
    };

export type MessageThread = {
  id: string;
  channel: MessageChannel;
  name: string;
  subtitle: string;
  avatar: ImageSourcePropType;
  schoolBadge?: ImageSourcePropType;
  preview: string;
  timeLabel: string;
  unread?: boolean;
  verified?: boolean;
  linkedIn?: boolean;
  showIcebreakers?: boolean;
};

export type IcebreakerSuggestion = {
  id: string;
  emoji: string;
  prompt: string;
};

export const ICEBREAKER_SUGGESTIONS: IcebreakerSuggestion[] = [
  {
    id: 'match',
    emoji: '👋',
    prompt: 'Hi! I think we might be a good roommate match.',
  },
  {
    id: 'looking',
    emoji: '🏠',
    prompt: 'Hey! Are you still looking for a roommate?',
  },
  {
    id: 'connect',
    emoji: '✨',
    prompt: 'Hi there! Want to connect about housing?',
  },
];

export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'jenny',
    channel: 'roommate',
    name: 'Jenny Lee',
    subtitle: 'Design student · FIT',
    avatar: require('../../assets/img/mock/IMG_2585.png'),
    schoolBadge: require('../../assets/img/mock/nyu_logo.png'),
    preview: 'Did you know that honey never spoils…',
    timeLabel: '2m',
    unread: true,
    verified: true,
    linkedIn: true,
    showIcebreakers: true,
  },
  {
    id: 'zhikun',
    channel: 'roommate',
    name: 'Zhikun Devin Chen',
    subtitle: 'Senior Consultant · Ipsos USA',
    avatar: require('../../assets/img/agent_onboarding.png'),
    preview: 'I can schedule a tour for us. When are you free…',
    timeLabel: '12:08 AM',
    verified: true,
    linkedIn: true,
  },
  {
    id: 'simon',
    channel: 'agent',
    name: 'Seunghoon Simon Lee',
    subtitle: 'Associate Broker · Ellieo',
    avatar: require('../../assets/img/personal_onboarding.png'),
    preview: 'Thanks for your interest, Jenny! The unit is available…',
    timeLabel: '1:40 PM',
    verified: true,
    linkedIn: true,
  },
];

const LISTING_W48: ListingPreview = {
  id: '10561607263',
  bedsBaths: '2 Beds 1 Bath',
  rooms: '3 Rooms',
  prices: '$2,300 · $2,050 · $1,950',
  moveIn: 'Nov 1, 2025',
  image: require('../../assets/img/banner1.png'),
};

export const CHAT_BY_THREAD: Record<string, ChatMessage[]> = {
  jenny: [],
  zhikun: [
    { id: 'd1', kind: 'date', label: '10/07/2025' },
    {
      id: 'm1',
      fromMe: true,
      time: '11:59 PM',
      kind: 'text',
      text: 'Hey! Are you still looking for a roommate? 😊',
    },
    {
      id: 'm2',
      fromMe: false,
      time: '11:59 PM',
      kind: 'text',
      text: 'Yes! When is your move-in date?',
    },
    {
      id: 'm3',
      fromMe: true,
      time: '12:01 AM',
      kind: 'text',
      text: 'My semester starts early November — I should find a place by Nov 2 or 5 at least.',
    },
    {
      id: 'm4',
      fromMe: true,
      time: '12:03 AM',
      kind: 'listing',
      listing: LISTING_W48,
    },
    {
      id: 'm5',
      fromMe: true,
      time: '12:08 AM',
      kind: 'text',
      text: "I found a place yesterday. Want to tour together? When are you free to see the apartment?",
    },
  ],
  simon: [
    {
      id: 'a1',
      fromMe: true,
      time: '11:40 AM',
      kind: 'text',
      text: "Hi Simon! I'm interested in one of your listings below. Hoping to schedule a tour if it's still available.",
    },
    {
      id: 'a2',
      fromMe: true,
      time: '11:40 AM',
      kind: 'listing',
      listing: {
        ...LISTING_W48,
        bedsBaths: '2 Beds 1 Bath',
        prices: '$2,300 · $2,050 · $1,950',
        moveIn: 'Early November',
      },
    },
    {
      id: 'a3',
      fromMe: false,
      time: '1:40 PM',
      kind: 'text',
      text: 'Thanks for your interest! The unit is available — when works for a tour? We can usually schedule between 11 AM and 6 PM.',
    },
  ],
};

export function getThread(id: string): MessageThread | undefined {
  return MESSAGE_THREADS.find((t) => t.id === id);
}
