import { LinearGradient } from 'expo-linear-gradient';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { PencilDarkIcon, PencilLightIcon } from './Icons';

type TagVariant = 'keyword' | 'editable';

type TagProps = Omit<PressableProps, 'children'> & {
  label: string;
  selected?: boolean;
  variant?: TagVariant;
  size?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
};

export function Tag({
  label,
  selected = false,
  variant = 'keyword',
  disabled,
  size = 'default',
  style,
  ...props
}: TagProps) {
  const isEditable = variant === 'editable';
  const textStyle = selected ? styles.selectedLabel : isEditable ? styles.editableLabel : styles.defaultLabel;
  const compact = size === 'compact';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [pressed && !disabled && styles.pressed, disabled && styles.disabled, style]}
      {...props}>
      {selected && isEditable ? (
        <LinearGradient
          colors={['#000000', '#474747']}
          style={[styles.container, compact && styles.compactContainer, styles.editableContainer]}>
          <TagContent
            compact={compact}
            label={label}
            selected={selected}
            textStyle={textStyle}
            variant={variant}
          />
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.container,
            compact && styles.compactContainer,
            selected ? styles.selectedContainer : styles.defaultContainer,
            isEditable && styles.editableContainer,
            isEditable && !selected && styles.editableDefaultContainer,
          ]}>
          <TagContent
            compact={compact}
            label={label}
            selected={selected}
            textStyle={textStyle}
            variant={variant}
          />
        </View>
      )}
    </Pressable>
  );
}

type TagContentProps = {
  compact: boolean;
  label: string;
  selected: boolean;
  textStyle: object;
  variant: TagVariant;
};

function TagContent({ compact, label, selected, textStyle, variant }: TagContentProps) {
  return (
    <>
      {variant === 'editable' && (
        selected ? <PencilLightIcon width={18} height={18} /> : <PencilDarkIcon width={18} height={18} />
      )}
      <Text style={[styles.label, compact && styles.compactLabel, textStyle]}>{label}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  compactContainer: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  defaultContainer: {
    backgroundColor: '#E8E8E8',
  },
  selectedContainer: {
    backgroundColor: '#222222',
  },
  editableContainer: {
    gap: 5,
    borderWidth: 1,
    borderColor: '#767676',
  },
  editableDefaultContainer: {
    backgroundColor: '#F5F5F5',
  },
  label: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19.6,
    letterSpacing: -0.35,
    textAlign: 'center',
  },
  compactLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  defaultLabel: {
    color: '#818181',
  },
  editableLabel: {
    color: '#222222',
  },
  selectedLabel: {
    color: '#F5F5F5',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
