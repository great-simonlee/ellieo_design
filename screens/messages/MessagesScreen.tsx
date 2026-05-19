import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTopBar, appTopBarStyles } from '../../components/AppTopBar';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../../design/theme';
import {
  MESSAGE_THREADS,
  type MessageChannel,
  type MessageThread,
} from './messagesData';

const ink = '#1C1C1E';
const muted = '#687084';
const labelSecondary = '#636366';
const pageBg = '#FFFFFF';
const white = '#FFFFFF';
const cardBorder = 'rgba(31,41,55,0.08)';
const deleteRed = '#FF3B30';

const HEADER_GAP = space.md;

const sheetShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
});

export type MessagesScreenProps = {
  padH: number;
  bottomChromeH: number;
  onOpenProfile?: () => void;
  onOpenThread: (threadId: string) => void;
};

export function MessagesScreen({
  padH,
  bottomChromeH,
  onOpenProfile,
  onOpenThread,
}: MessagesScreenProps) {
  const insets = useSafeAreaInsets();
  const [channel, setChannel] = useState<MessageChannel>('roommate');
  const [hiddenThreadIds, setHiddenThreadIds] = useState<Set<string>>(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState<MessageThread | null>(null);

  const visibleThreads = useMemo(
    () => MESSAGE_THREADS.filter((t) => !hiddenThreadIds.has(t.id)),
    [hiddenThreadIds],
  );

  const threads = useMemo(
    () => visibleThreads.filter((t) => t.channel === channel),
    [channel, visibleThreads],
  );

  const unreadRoommate = visibleThreads.filter(
    (t) => t.channel === 'roommate' && t.unread,
  ).length;
  const unreadAgent = visibleThreads.filter(
    (t) => t.channel === 'agent' && t.unread,
  ).length;

  const deleteThread = (threadId: string) => {
    setHiddenThreadIds((prev) => {
      const next = new Set(prev);
      next.add(threadId);
      return next;
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />

      <AppTopBar
        insetTop={insets.top}
        padH={padH}
        paddingBottom={HEADER_GAP}
        actions={
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Profile'
            onPress={onOpenProfile}
            style={({ pressed }) => [
              appTopBarStyles.iconButton,
              styles.profileBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name='person' size={22} color={white} />
          </Pressable>
        }
      />

      <View style={[styles.body, { paddingHorizontal: padH }]}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Messages</Text>
          <Text style={styles.heroMeta}>
            {channel === 'roommate'
              ? 'Chats with potential roommates'
              : 'Chats with Ellieo agents'}
          </Text>
        </View>

        <ChannelToggle
          channel={channel}
          onChange={setChannel}
          roommateUnread={unreadRoommate}
          agentUnread={unreadAgent}
        />

        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomChromeH + space.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {threads.length === 0 ? (
            <View style={styles.emptyCard}>
              <LinearGradient
                colors={['#EEF3FF', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons
                name='chatbubbles-outline'
                size={32}
                color={colors.primary}
              />
              <Text style={styles.emptyTitle}>No conversations yet</Text>
              <Text style={styles.emptyCopy}>
                When you say hi on Match or message an agent, threads will show
                up here.
              </Text>
            </View>
          ) : (
            threads.map((thread) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                onPress={() => onOpenThread(thread.id)}
                onRequestDelete={() => setDeleteTarget(thread)}
              />
            ))
          )}
        </ScrollView>
      </View>

      <DeleteThreadModal
        thread={deleteTarget}
        bottomInset={insets.bottom}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteThread(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </View>
  );
}

function ChannelToggle({
  channel,
  onChange,
  roommateUnread,
  agentUnread,
}: {
  channel: MessageChannel;
  onChange: (c: MessageChannel) => void;
  roommateUnread: number;
  agentUnread: number;
}) {
  return (
    <View style={styles.segmentTrack}>
      {(
        [
          { id: 'roommate' as const, label: 'Roommate', badge: roommateUnread },
          { id: 'agent' as const, label: 'Agent', badge: agentUnread },
        ] as const
      ).map((opt) => {
        const on = channel === opt.id;
        return (
          <Pressable
            key={opt.id}
            accessibilityRole='button'
            accessibilityState={{ selected: on }}
            onPress={() => onChange(opt.id)}
            style={[styles.segmentItem, on && styles.segmentItemOn]}
          >
            {on ? (
              <LinearGradient
                colors={gradientPrimaryHorizontal}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Text style={[styles.segmentLabel, on && styles.segmentLabelOn]}>
              {opt.label}
            </Text>
            {opt.badge > 0 ? (
              <View
                style={[styles.segmentBadge, on && styles.segmentBadgeOn]}
              >
                <Text
                  style={[styles.segmentBadgeText, on && styles.segmentBadgeTextOn]}
                >
                  {opt.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function ThreadRow({
  thread,
  onPress,
  onRequestDelete,
}: {
  thread: MessageThread;
  onPress: () => void;
  onRequestDelete: () => void;
}) {
  return (
    <View style={styles.threadCard}>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={`Open chat with ${thread.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.threadCardPress,
          pressed && styles.threadCardPressed,
        ]}
      >
      <View style={styles.avatarWrap}>
        {thread.unread ? (
          <LinearGradient
            colors={gradientPrimaryHorizontal}
            style={styles.avatarRingGrad}
          >
            <Image source={thread.avatar} style={styles.avatar} />
          </LinearGradient>
        ) : (
          <Image source={thread.avatar} style={styles.avatarPlain} />
        )}
        {thread.schoolBadge ? (
          <View style={styles.avatarBadge}>
            <Image source={thread.schoolBadge} style={styles.avatarBadgeImg} />
          </View>
        ) : thread.channel === 'agent' ? (
          <View style={[styles.avatarBadge, styles.avatarBadgeAgent]}>
            <Ionicons name='briefcase' size={10} color={colors.primary} />
          </View>
        ) : null}
      </View>

      <View style={styles.threadMain}>
        <View style={styles.threadTop}>
          <Text
            style={[styles.threadName, thread.unread && styles.threadNameUnread]}
            numberOfLines={1}
          >
            {thread.name}
          </Text>
          <View style={styles.threadBadges}>
            {thread.linkedIn ? (
              <Ionicons name='logo-linkedin' size={14} color={colors.primary} />
            ) : null}
            {thread.verified ? (
              <Ionicons
                name='checkmark-circle'
                size={15}
                color={colors.primary}
              />
            ) : null}
          </View>
          <Text style={styles.threadTime}>{thread.timeLabel}</Text>
        </View>
        <Text style={styles.threadSubtitle} numberOfLines={1}>
          {thread.subtitle}
        </Text>
        <Text
          style={[styles.threadPreview, thread.unread && styles.threadPreviewUnread]}
          numberOfLines={2}
        >
          {thread.preview}
        </Text>
      </View>

      {thread.unread ? <View style={styles.unreadDot} /> : null}
      </Pressable>

      <Pressable
        accessibilityRole='button'
        accessibilityLabel={`Delete conversation with ${thread.name}`}
        onPress={onRequestDelete}
        hitSlop={10}
        style={({ pressed }) => [
          styles.threadDeleteTiny,
          pressed && styles.threadDeleteTinyPressed,
        ]}
      >
        <Ionicons name='trash-outline' size={13} color={labelSecondary} />
      </Pressable>
    </View>
  );
}

function DeleteThreadModal({
  thread,
  bottomInset,
  onCancel,
  onConfirm,
}: {
  thread: MessageThread | null;
  bottomInset: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const visible = thread !== null;
  const { height: windowH } = useWindowDimensions();
  const sheetTravel = useMemo(
    () => Math.min(340, Math.round(windowH * 0.38)),
    [windowH],
  );
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(sheetTravel)).current;

  const dismissAnimated = useCallback(
    (after?: () => void) => {
      backdropOpacity.stopAnimation();
      sheetTranslateY.stopAnimation();
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: sheetTravel,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && after) after();
      });
    },
    [backdropOpacity, sheetTranslateY, sheetTravel],
  );

  const runCancel = useCallback(() => {
    if (!visible) return;
    dismissAnimated(onCancel);
  }, [dismissAnimated, onCancel, visible]);

  const runConfirm = useCallback(() => {
    if (!visible) return;
    dismissAnimated(onConfirm);
  }, [dismissAnimated, onConfirm, visible]);

  useEffect(() => {
    if (!visible) return;
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(sheetTravel);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 300,
        damping: 34,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, thread?.id, backdropOpacity, sheetTranslateY, sheetTravel]);

  if (!visible || !thread) return null;

  return (
    <Modal animationType='none' transparent visible onRequestClose={runCancel}>
      <View style={styles.deleteModalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss delete conversation'
            style={StyleSheet.absoluteFill}
            onPress={runCancel}
          >
            <BlurView intensity={48} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.deleteModalDim} />
          </Pressable>
        </Animated.View>

        <View style={styles.deleteSheetStage} pointerEvents='box-none'>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.deleteSheet,
              {
                paddingBottom: Math.max(bottomInset, space.md) + space.sm,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFECEC', '#FFF8F8', '#FFFFFF']}
              locations={[0, 0.42, 1]}
              style={styles.deleteSheetGlow}
              pointerEvents='none'
            />

            <View style={styles.deleteSheetBody}>
              <View style={styles.deleteIconCircle}>
                <Ionicons name='trash-outline' size={24} color={deleteRed} />
              </View>

              <Text style={styles.deleteTitle} accessibilityRole='header'>
                Delete conversation?
              </Text>
              <Text style={styles.deleteHint} numberOfLines={2}>
                This removes your chat with {thread.name}. You can&apos;t undo this.
              </Text>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel={`Delete chat with ${thread.name}`}
                onPress={runConfirm}
                style={({ pressed }) => [
                  styles.deleteConfirmBtn,
                  pressed && styles.deleteBtnPressed,
                ]}
              >
                <Text style={styles.deleteConfirmBtnText}>Delete</Text>
              </Pressable>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Cancel'
                onPress={runCancel}
                style={({ pressed }) => [
                  styles.deleteCancelBtn,
                  pressed && styles.deleteCancelBtnPressed,
                ]}
              >
                <Text style={styles.deleteCancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  android: { elevation: 2 },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  body: {
    flex: 1,
  },
  profileBtn: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  btnPressed: {
    opacity: 0.88,
  },
  hero: {
    marginBottom: space.md,
    gap: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heroMeta: {
    fontSize: type.caption,
    fontWeight: '500',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: space.md,
    borderWidth: 1,
    borderColor: cardBorder,
    ...cardShadow,
  },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    overflow: 'hidden',
  },
  segmentItemOn: {},
  segmentLabel: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.15,
  },
  segmentLabelOn: {
    color: white,
  },
  segmentBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(47, 109, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBadgeOn: {
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  segmentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  segmentBadgeTextOn: {
    color: white,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    gap: space.sm,
  },
  threadCard: {
    position: 'relative',
    borderRadius: radius.xl,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: cardBorder,
    ...cardShadow,
  },
  threadCardPress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    padding: space.md,
    paddingBottom: space.lg + 2,
  },
  threadCardPressed: {
    backgroundColor: '#FAFBFF',
  },
  threadDeleteTiny: {
    position: 'absolute',
    right: space.sm,
    bottom: space.sm,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  threadDeleteTinyPressed: {
    opacity: 0.55,
  },
  deleteModalRoot: {
    flex: 1,
  },
  deleteModalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  deleteSheetStage: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  deleteSheet: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: white,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.2,
        shadowRadius: 36,
      },
      android: { elevation: 32 },
    }),
  },
  deleteSheetGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 140,
  },
  deleteSheetBody: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    alignItems: 'center',
    gap: space.sm,
    zIndex: 1,
  },
  deleteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.18)',
    marginBottom: space.xs,
    ...sheetShadow,
  },
  deleteTitle: {
    fontSize: type.display + 2,
    lineHeight: 34,
    fontWeight: '800',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  deleteHint: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: muted,
    textAlign: 'center',
    letterSpacing: -0.12,
    maxWidth: 300,
    marginBottom: space.md,
  },
  deleteConfirmBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
    backgroundColor: deleteRed,
    marginTop: space.xs,
    ...sheetShadow,
  },
  deleteBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  deleteConfirmBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.25,
  },
  deleteCancelBtn: {
    width: '100%',
    minHeight: 48,
    marginTop: space.xs,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
  },
  deleteCancelBtnPressed: {
    opacity: 0.85,
    backgroundColor: '#EAF0FC',
  },
  deleteCancelBtnText: {
    fontSize: type.body,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.15,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingGrad: {
    width: 52,
    height: 52,
    borderRadius: 26,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: white,
  },
  avatarPlain: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: 'rgba(60,60,67,0.1)',
  },
  avatarBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: white,
    borderWidth: 1.5,
    borderColor: 'rgba(47,109,246,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBadgeAgent: {
    backgroundColor: '#EEF3FF',
  },
  avatarBadgeImg: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  threadMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  threadTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  threadName: {
    flexShrink: 1,
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.25,
  },
  threadNameUnread: {
    fontWeight: '800',
  },
  threadBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  threadTime: {
    marginLeft: 'auto',
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.02,
  },
  threadSubtitle: {
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.02,
  },
  threadPreview: {
    marginTop: 2,
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '500',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
  threadPreviewUnread: {
    color: ink,
    fontWeight: '600',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: space.sm,
  },
  emptyCard: {
    marginTop: space.lg,
    borderRadius: radius.xl,
    padding: space.xxl,
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.1)',
    overflow: 'hidden',
  },
  emptyTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.28,
  },
  emptyCopy: {
    fontSize: type.caption,
    lineHeight: 20,
    fontWeight: '500',
    color: muted,
    textAlign: 'center',
    maxWidth: 280,
  },
});
