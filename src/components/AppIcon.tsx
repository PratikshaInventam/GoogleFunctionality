import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

export type IconName =
  | 'map-pin'
  | 'location-pin'
  | 'camera'
  | 'fingerprint'
  | 'check'
  | 'x'
  | 'shield'
  | 'alert-circle'
  | 'clock'
  | 'refresh'
  | 'arrow-right'
  | 'building'
  | 'user'
  | 'calendar'
  | 'arrow-up-right'
  | 'arrow-down-left';

interface AppIconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const ICON_MAP: Record<string, string> = {
  'map-pin': '📍',
  'location-pin': '📍',
  camera: '📷',
  fingerprint: '👆',
  check: '✓',
  x: '✕',
  shield: '🛡️',
  'alert-circle': '⚠️',
  clock: '⏱️',
  refresh: '🔄',
  'arrow-right': '→',
  building: '🏢',
  user: '👤',
  calendar: '📅',
  'arrow-up-right': '↗',
  'arrow-down-left': '↙',
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 18,
  color = '#FFFFFF',
  style,
}) => {
  const glyph = ICON_MAP[name] || '•';

  return (
    <Text
      style={[
        styles.iconText,
        {
          fontSize: size,
          lineHeight: size * 1.2,
          color,
        },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
};

const styles = StyleSheet.create({
  iconText: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
