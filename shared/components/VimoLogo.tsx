import { Platform, StyleSheet, Text } from 'react-native';

type VimoLogoProps = {
  accessibilityRole?: 'header';
};

export function VimoLogo({ accessibilityRole }: VimoLogoProps) {
  return (
    <Text accessibilityRole={accessibilityRole} style={styles.logo}>
      VIMO
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    color: '#333333',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 48,
    ...Platform.select({
      web: {
        textShadow: '0px 8px 8px rgba(0, 0, 0, 0.34)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.34)',
        textShadowOffset: {
          width: 0,
          height: 8,
        },
        textShadowRadius: 8,
      },
    }),
  },
});
