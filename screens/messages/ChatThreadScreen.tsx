import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../../design/theme';
import {
  CHAT_BY_THREAD,
  ICEBREAKER_SUGGESTIONS,
  getThread,
  type ChatMessage,
  type ListingPreview,
} from './messagesData';
import { ReportUserFlow } from './ReportUserFlow';

const ink = '#1C1C1E';
const muted = '#687084';
const labelSecondary = '#636366';
const pageBg = '#FFFFFF';
const white = '#FFFFFF';

export type ChatThreadScreenProps = {
  threadId: string;
  onBack: () => void;
};

function dummyReplyForThread(threadId: string): string {
  switch (threadId) {
    case 'simon':
      return 'Thanks for reaching out! When would work for a tour?';
    case 'zhikun':
      return 'Yes! When is your move-in date?';
    default:
      return 'Yes! When is your move-in date?';
  }
}

export function ChatThreadScreen({ threadId, onBack }: ChatThreadScreenProps) {
  const insets = useSafeAreaInsets();
  const thread = getThread(threadId);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => CHAT_BY_THREAD[threadId] ?? [],
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportFlowOpen, setReportFlowOpen] = useState(false);
  const [icebreakersDismissed, setIcebreakersDismissed] = useState(
    () => !(CHAT_BY_THREAD[threadId]?.length === 0 && getThread(threadId)?.showIcebreakers),
  );

  const showIcebreakers =
    thread?.showIcebreakers && messages.length === 0 && !icebreakersDismissed;

  const sendText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        fromMe: true,
        time: 'Now',
        kind: 'text',
        text: trimmed,
      },
    ]);
    setDraft('');
    setIcebreakersDismissed(true);

    const replyText = dummyReplyForThread(threadId);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          fromMe: false,
          time: 'Now',
          kind: 'text',
          text: replyText,
        },
      ]);
    }, 700);
  };

  const headerSubtitle = thread?.subtitle ?? '';

  if (!thread) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Pressable onPress={onBack} style={styles.backOnly}>
          <Ionicons name='chevron-back' size={26} color={ink} />
        </Pressable>
        <Text style={styles.missing}>Conversation not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />

      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + space.xs,
            paddingHorizontal: space.md,
          },
        ]}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back'
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
        >
          <Ionicons name='chevron-back' size={26} color={ink} />
        </Pressable>

        <Pressable
          accessibilityRole='button'
          style={({ pressed }) => [
            styles.headerIdentity,
            pressed && styles.btnPressed,
          ]}
        >
          <Image source={thread.avatar} style={styles.headerAvatar} />
          <View style={styles.headerCopy}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>
                {thread.name}
              </Text>
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
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {headerSubtitle}
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='More options'
          onPress={() => setMenuOpen(true)}
          hitSlop={12}
          style={({ pressed }) => [styles.menuBtn, pressed && styles.btnPressed]}
        >
          <Ionicons name='ellipsis-horizontal' size={22} color={ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.threadScroll}
          contentContainerStyle={[
            styles.threadContent,
            showIcebreakers && styles.threadContentIce,
            { paddingBottom: space.lg },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {showIcebreakers ? (
            <IcebreakerPanel
              onPick={sendText}
              onSkip={() => setIcebreakersDismissed(true)}
            />
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
        </ScrollView>

        <View
          style={[
            styles.composerDock,
            {
              paddingBottom: insets.bottom + space.sm,
              paddingHorizontal: space.md,
            },
          ]}
        >
          <View style={styles.composerRow}>
            <View style={styles.composerInputShell}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder='Write a message…'
                placeholderTextColor={labelSecondary}
                style={styles.composerInput}
                multiline
                maxLength={2000}
                textAlignVertical='center'
              />
            </View>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Send message'
              accessibilityState={{ disabled: !draft.trim() }}
              disabled={!draft.trim()}
              onPress={() => sendText(draft)}
              style={({ pressed }) => [
                styles.sendBtn,
                !draft.trim() && styles.sendBtnDisabled,
                pressed && draft.trim() && styles.sendBtnPressed,
              ]}
            >
              <LinearGradient
                colors={
                  draft.trim()
                    ? gradientPrimaryHorizontal
                    : (['#C7C7CC', '#AEAEB2'] as [string, string])
                }
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.sendBtnGrad}
              >
                <Ionicons
                  name='send'
                  size={19}
                  color={white}
                  style={styles.sendIcon}
                />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <SafetyMenu
        visible={menuOpen}
        name={thread.name}
        bottomInset={insets.bottom}
        onClose={() => setMenuOpen(false)}
        onReportBlock={() => {
          setMenuOpen(false);
          setReportFlowOpen(true);
        }}
      />

      <ReportUserFlow
        visible={reportFlowOpen}
        reportedName={thread.name}
        onClose={() => setReportFlowOpen(false)}
      />
    </View>
  );
}

function IcebreakerPanel({
  onPick,
  onSkip,
}: {
  onPick: (text: string) => void;
  onSkip: () => void;
}) {
  return (
    <View style={styles.iceShell}>
      <LinearGradient
        colors={['#F4F7FF', '#FAFBFF', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.iceShellInner}>
        <View style={styles.iceHeader}>
          <LinearGradient
            colors={gradientPrimaryHorizontal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iceHeaderIcon}
          >
            <Ionicons name='chatbubble-ellipses' size={18} color={white} />
          </LinearGradient>
          <View style={styles.iceHeaderCopy}>
            <Text style={styles.iceEyebrow}>Suggested openers</Text>
            <Text style={styles.iceHeadline}>Break the ice</Text>
          </View>
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss suggestions'
            onPress={onSkip}
            hitSlop={10}
            style={({ pressed }) => [
              styles.iceDismissBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Ionicons name='close' size={18} color={labelSecondary} />
          </Pressable>
        </View>

        <View style={styles.iceList}>
          {ICEBREAKER_SUGGESTIONS.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole='button'
              accessibilityLabel={`Send: ${item.prompt}`}
              onPress={() => onPick(item.prompt)}
              style={({ pressed }) => [
                styles.iceRow,
                index < ICEBREAKER_SUGGESTIONS.length - 1 && styles.iceRowBorder,
                pressed && styles.iceRowPressed,
              ]}
            >
              <View style={styles.iceRowEmojiWrap}>
                <Text style={styles.iceRowEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.iceRowText}>{item.prompt}</Text>
              <LinearGradient
                colors={gradientPrimaryHorizontal}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.iceRowSend}
              >
                <Ionicons name='arrow-up' size={16} color={white} />
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Write your own message'
          onPress={onSkip}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iceOwnLink,
            pressed && styles.btnPressed,
          ]}
        >
          <Ionicons
            name='create-outline'
            size={15}
            color={colors.primary}
            style={styles.iceOwnLinkIcon}
          />
          <Text style={styles.iceOwnLinkText}>Write your own message</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MessageItem({ message }: { message: ChatMessage }) {
  if (message.kind === 'date') {
    return (
      <View style={styles.dateRow}>
        <View style={styles.dateLine} />
        <Text style={styles.dateLabel}>{message.label}</Text>
        <View style={styles.dateLine} />
      </View>
    );
  }

  const mine = message.fromMe;

  return (
    <View style={[styles.msgRow, mine && styles.msgRowMine]}>
      {mine ? (
        <Text style={[styles.msgTime, styles.msgTimeBeforeMine]}>
          {message.time}
        </Text>
      ) : null}
      <View style={[styles.msgCol, mine && styles.msgColMine]}>
        {message.kind === 'text' ? (
          <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
            {mine ? (
              <LinearGradient
                colors={['#E8EFFE', '#DCE8FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <Text style={styles.bubbleText}>{message.text}</Text>
          </View>
        ) : (
          <ListingBubble listing={message.listing} mine={mine} />
        )}
      </View>
      {!mine ? (
        <Text style={[styles.msgTime, styles.msgTimeAfterTheirs]}>
          {message.time}
        </Text>
      ) : null}
    </View>
  );
}

function ListingBubble({
  listing,
  mine,
}: {
  listing: ListingPreview;
  mine: boolean;
}) {
  return (
    <View style={[styles.listingBubble, mine && styles.listingBubbleMine]}>
      <Image source={listing.image} style={styles.listingImage} />
      <View style={styles.listingBody}>
        <Text style={styles.listingId}>ID · {listing.id}</Text>
        <Text style={styles.listingSpecs}>
          {listing.bedsBaths}
          {listing.rooms ? ` · ${listing.rooms}` : ''}
        </Text>
        <Text style={styles.listingPrices}>{listing.prices}</Text>
        <Text style={styles.listingMoveIn}>Move-in · {listing.moveIn}</Text>
      </View>
    </View>
  );
}

const dangerRed = '#FF3B30';

const sheetShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
});

function SafetyMenu({
  visible,
  name,
  bottomInset,
  onClose,
  onReportBlock,
}: {
  visible: boolean;
  name: string;
  bottomInset: number;
  onClose: () => void;
  onReportBlock: () => void;
}) {
  const { height: windowH } = useWindowDimensions();
  const sheetTravel = useMemo(
    () => Math.min(380, Math.round(windowH * 0.42)),
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

  const runClose = useCallback(() => {
    if (!visible) return;
    dismissAnimated(onClose);
  }, [dismissAnimated, onClose, visible]);

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
  }, [visible, backdropOpacity, sheetTranslateY, sheetTravel]);

  if (!visible) return null;

  return (
    <Modal animationType='none' transparent visible onRequestClose={runClose}>
      <View style={styles.safetyModalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss safety options'
            style={StyleSheet.absoluteFill}
            onPress={runClose}
          >
            <BlurView intensity={48} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.safetyModalDim} />
          </Pressable>
        </Animated.View>

        <View style={styles.safetySheetStage} pointerEvents='box-none'>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.safetySheet,
              {
                paddingBottom: Math.max(bottomInset, space.md) + space.sm,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFECEC', '#FFF8F8', '#FFFFFF']}
              locations={[0, 0.42, 1]}
              style={styles.safetySheetGlow}
              pointerEvents='none'
            />

            <View style={styles.safetySheetBody}>
              <View style={styles.safetyIconCircle}>
                <Ionicons name='shield-outline' size={24} color={dangerRed} />
              </View>

              <Text style={styles.safetyTitle} accessibilityRole='header'>
                Safety options
              </Text>
              <Text style={styles.safetyHint} numberOfLines={2}>
                Block or report {name} if something feels off.
              </Text>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel={`Block ${name}`}
                onPress={runClose}
                style={({ pressed }) => [
                  styles.safetyBlockBtn,
                  pressed && styles.safetyBtnPressed,
                ]}
              >
                <Text style={styles.safetyBlockBtnText}>Block &apos;{name}&apos;</Text>
              </Pressable>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel={`Report and block ${name}`}
                onPress={() => dismissAnimated(onReportBlock)}
                style={({ pressed }) => [
                  styles.safetyDangerBtn,
                  pressed && styles.safetyBtnPressed,
                ]}
              >
                <Text style={styles.safetyDangerBtnText}>
                  Report & block &apos;{name}&apos;
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Cancel'
                onPress={runClose}
                style={({ pressed }) => [
                  styles.safetyCancelBtn,
                  pressed && styles.safetyCancelBtnPressed,
                ]}
              >
                <Text style={styles.safetyCancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  flex: {
    flex: 1,
  },
  backOnly: {
    padding: space.lg,
  },
  missing: {
    padding: space.lg,
    fontSize: type.body,
    color: muted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingBottom: space.sm,
    backgroundColor: white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.1)',
  },
  backBtn: {
    marginLeft: -space.xs,
    padding: space.xs,
  },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minWidth: 0,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(47,109,246,0.15)',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    flexShrink: 1,
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.02,
  },
  menuBtn: {
    padding: space.xs,
  },
  btnPressed: {
    opacity: 0.55,
  },
  threadScroll: {
    flex: 1,
  },
  threadContent: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
    gap: space.md,
  },
  threadContentIce: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: space.sm,
  },
  iceShell: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.14)',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 3 },
    }),
  },
  iceShellInner: {
    paddingTop: space.md,
    paddingBottom: space.md,
    gap: space.md,
  },
  iceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
  },
  iceHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iceHeaderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  iceEyebrow: {
    fontSize: type.micro,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  iceHeadline: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.35,
  },
  iceDismissBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(60,60,67,0.06)',
  },
  iceList: {
    marginHorizontal: space.md,
    borderRadius: radius.lg,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.08)',
    overflow: 'hidden',
  },
  iceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    backgroundColor: white,
  },
  iceRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.1)',
  },
  iceRowPressed: {
    backgroundColor: '#F4F7FF',
  },
  iceRowEmojiWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(47, 109, 246, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iceRowEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  iceRowText: {
    flex: 1,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.18,
  },
  iceRowSend: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iceOwnLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
  iceOwnLinkIcon: {
    marginTop: 1,
  },
  iceOwnLinkText: {
    fontSize: type.caption,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.08,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.xs,
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgCol: {
    maxWidth: '82%',
  },
  msgColMine: {
    alignItems: 'flex-end',
  },
  msgTime: {
    fontSize: 10,
    fontWeight: '600',
    color: muted,
    marginBottom: 8,
    flexShrink: 0,
    minWidth: 48,
  },
  msgTimeBeforeMine: {
    textAlign: 'right',
  },
  msgTimeAfterTheirs: {
    textAlign: 'left',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    backgroundColor: white,
  },
  bubbleMine: {
    borderColor: 'rgba(47, 109, 246, 0.18)',
  },
  bubbleTheirs: {
    backgroundColor: '#F2F2F7',
    borderColor: 'rgba(60,60,67,0.06)',
  },
  bubbleText: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.15,
  },
  listingBubble: {
    width: 260,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.15)',
  },
  listingBubbleMine: {
    alignSelf: 'flex-end',
  },
  listingImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8ECEF',
  },
  listingBody: {
    padding: space.md,
    gap: 4,
  },
  listingId: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.02,
  },
  listingSpecs: {
    fontSize: type.caption,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  listingPrices: {
    fontSize: type.caption,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.08,
  },
  listingMoveIn: {
    fontSize: type.micro,
    fontWeight: '600',
    color: labelSecondary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginVertical: space.xs,
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.14)',
  },
  dateLabel: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.02,
  },
  composerDock: {
    paddingTop: space.sm + 2,
    backgroundColor: white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.08)',
    gap: space.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
  },
  composerInputShell: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.1)',
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  composerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    fontSize: type.body,
    lineHeight: 22,
    color: ink,
    letterSpacing: -0.15,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    ...Platform.select({
      android: { includeFontPadding: false, textAlignVertical: 'center' },
      default: {},
    }),
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    flexShrink: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  sendBtnDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: { elevation: 0 },
    }),
  },
  sendBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  sendBtnGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    marginLeft: 2,
    marginTop: 1,
  },
  safetyModalRoot: {
    flex: 1,
  },
  safetyModalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  safetySheetStage: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  safetySheet: {
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
  safetySheetGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 140,
  },
  safetySheetBody: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    alignItems: 'center',
    gap: space.sm,
    zIndex: 1,
  },
  safetyIconCircle: {
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
  safetyTitle: {
    fontSize: type.display + 2,
    lineHeight: 34,
    fontWeight: '800',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  safetyHint: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: muted,
    textAlign: 'center',
    letterSpacing: -0.12,
    maxWidth: 300,
    marginBottom: space.md,
  },
  safetyBlockBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
    backgroundColor: ink,
    marginTop: space.xs,
    ...sheetShadow,
  },
  safetyDangerBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
    backgroundColor: dangerRed,
    ...sheetShadow,
  },
  safetyBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  safetyBlockBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.25,
  },
  safetyDangerBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.25,
  },
  safetyCancelBtn: {
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
  safetyCancelBtnPressed: {
    opacity: 0.85,
    backgroundColor: '#EAF0FC',
  },
  safetyCancelBtnText: {
    fontSize: type.body,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.15,
  },
});
