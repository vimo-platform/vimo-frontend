import Svg, { Circle, Path, Rect, type SvgProps } from 'react-native-svg';

type IconProps = SvgProps & {
  size?: number;
  color?: string;
};

export function LoginArrowIcon({ size = 70, color = '#818181', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 70 70" fill="none" {...props}>
      <Circle cx={35} cy={35} r={26} stroke={color} strokeWidth={4} />
      <Path
        d="M13 35H43"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M34 26L43 35L34 44"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function WarningIcon({ size = 80, color = '#F45A5A', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none" {...props}>
      <Path
        d="M34.2 19.8L15.1 52.9C12.5 57.4 15.7 63 20.9 63H59.1C64.3 63 67.5 57.4 64.9 52.9L45.8 19.8C43.2 15.3 36.8 15.3 34.2 19.8Z"
        stroke={color}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path d="M40 31V44" stroke={color} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={40} cy={53} r={2.5} fill={color} />
    </Svg>
  );
}

export function SchoolIcon({ size = 24, color = '#818181', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 8L12 4L21 8L12 12L3 8Z"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 10V14.5C7 15.9 9.2 17 12 17C14.8 17 17 15.9 17 14.5V10"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M20 9V14" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

export function LockIcon({ size = 24, color = '#818181', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect
        x={5}
        y={10}
        width={14}
        height={10}
        rx={1.5}
        stroke={color}
        strokeWidth={1.2}
      />
      <Path
        d="M8 10V7.5C8 5.3 9.8 3.5 12 3.5C14.2 3.5 16 5.3 16 7.5V10"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={15} r={1} fill={color} />
    </Svg>
  );
}

export function CheckIcon({ size = 13, color = '#FFFFFF', ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
      <Path
        d="M2.3 6.7L5.1 9.4L10.7 3.7"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
