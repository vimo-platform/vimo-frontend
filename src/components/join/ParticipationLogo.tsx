import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function ParticipationLogo() {
  return (
    <Svg height={52} style={styles.logo} viewBox="0 0 92.1562 97.5299" width={50}>
      <Path
        d="M52.4804 46.0959C52.4723 39.2439 62.1848 37.8832 64.0602 44.4737C64.6289 46.4724 64.104 48.6231 62.6793 50.1359L52.4988 60.9453L52.4804 46.0959ZM51.5015 63.4638L51.5097 69.9727C51.5156 75.1918 45.1001 77.3947 41.8434 73.7179L51.5015 63.4638ZM37.808 76.5437C35.1844 79.329 30.5356 78.286 29.3529 74.647C27.5367 69.0573 35.1349 65.4149 38.3547 70.3319L40.4744 73.5685C40.493 73.5969 40.5128 73.6247 40.5316 73.6526L37.808 76.5437Z"
        fill="#222222"
        stroke="#000000"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  logo: {
    marginTop: 12,
    marginLeft: -8,
    transform: [{ rotate: '46.46deg' }],
  },
});

