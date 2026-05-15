import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { gradientPrimaryHorizontal, space, type } from '../design/theme';

const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const pageBg = '#FFFFFF';
const progressTrackBg = '#E5E5EA';

export type StepProgressBlockProps = {
  padH: number;
  step: number;
  totalSteps: number;
  title: string;
  progressRatio: number;
};

/** Pinned progress chrome — shelled track (create-listing step 5 style). */
export function StepProgressBlock({
  padH,
  step,
  totalSteps,
  title,
  progressRatio,
}: StepProgressBlockProps) {
  const caption = `Step ${step} of ${totalSteps} · ${title}`;
  const fillPercent = Math.min(100, progressRatio * 100);

  return (
    <View
      style={[styles.progressBlock, { paddingHorizontal: padH }]}
      accessibilityRole='progressbar'
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: step,
      }}
      accessibilityLabel={caption}
    >
      <View style={styles.progressTrackShell}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={gradientPrimaryHorizontal}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.progressFill,
              { width: `${fillPercent}%` as `${number}%` },
            ]}
          />
        </View>
      </View>
      <Text style={styles.progressCaption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBlock: {
    paddingTop: space.sm,
    paddingBottom: space.md,
    width: '100%',
    backgroundColor: pageBg,
    zIndex: 2,
  },
  progressTrackShell: {
    padding: 2,
    borderRadius: 6,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  progressTrack: {
    height: 4,
    borderRadius: 3,
    backgroundColor: progressTrackBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressCaption: {
    marginTop: space.sm,
    fontSize: type.caption,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.1,
  },
});
