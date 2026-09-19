import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { pretendard } from '@/styles/common/fonts';

export type GnbTabKey = 'participation' | 'search' | 'verification' | 'myPage';

type GnbItem = {
  key: GnbTabKey;
  label: string;
  onPress?: () => void;
};

type GnbProps = {
  activeKey?: GnbTabKey;
  items?: GnbItem[];
  style?: StyleProp<ViewStyle>;
};

const participationActiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.4199 20.0115L10.8073 12.1735C10.5258 11.3292 11.3292 10.5258 12.1735 10.8073L20.0115 13.4199C20.9962 13.7482 20.9962 15.1411 20.0115 15.4693L17.1172 16.4341C16.7947 16.5416 16.5416 16.7947 16.4341 17.1172L15.4693 20.0115C15.1411 20.9962 13.7482 20.9962 13.4199 20.0115Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 6.5C8.40279 6.5 6.5 8.40279 6.5 10.75C6.5 12.5335 7.59882 14.0622 9.15922 14.6925C9.54328 14.8476 9.72885 15.2847 9.57371 15.6688C9.41857 16.0529 8.98145 16.2384 8.59739 16.0833C6.4895 15.2318 5 13.1657 5 10.75C5 7.57436 7.57436 5 10.75 5C13.1657 5 15.2318 6.4895 16.0833 8.59739C16.2384 8.98145 16.0529 9.41857 15.6688 9.57371C15.2847 9.72885 14.8476 9.54328 14.6925 9.15922C14.0622 7.59882 12.5335 6.5 10.75 6.5Z" fill="#28303F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 1.5C5.64137 1.5 1.5 5.64137 1.5 10.75C1.5 15.8325 5.59923 19.9577 10.6718 19.9997C11.086 20.0031 11.419 20.3417 11.4155 20.7559C11.4121 21.1701 11.0736 21.5031 10.6594 21.4996C4.76395 21.4509 0 16.6568 0 10.75C0 4.81294 4.81294 0 10.75 0C16.6568 0 21.4509 4.76395 21.4996 10.6594C21.5031 11.0736 21.1701 11.4121 20.7559 11.4155C20.3417 11.419 20.0031 11.086 19.9997 10.6718C19.9577 5.59923 15.8325 1.5 10.75 1.5Z" fill="#28303F"/>
</svg>`;

const participationInactiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="10.75" cy="10.75" r="9" fill="#A9ACB2"/>
<path d="M13.4199 20.0114L10.8073 12.1735C10.5258 11.3292 11.3292 10.5258 12.1735 10.8073L20.0114 13.4199C20.9962 13.7482 20.9962 15.1411 20.0114 15.4693L17.1172 16.4341C16.7947 16.5416 16.5416 16.7947 16.4341 17.1172L15.4693 20.0114C15.1411 20.9962 13.7482 20.9962 13.4199 20.0114Z" fill="#28303F" stroke="#28303F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 6.5C8.40279 6.5 6.5 8.40279 6.5 10.75C6.5 12.5335 7.59882 14.0622 9.15922 14.6925C9.54328 14.8476 9.72885 15.2847 9.57371 15.6688C9.41857 16.0529 8.98145 16.2384 8.59739 16.0833C6.4895 15.2318 5 13.1657 5 10.75C5 7.57436 7.57436 5 10.75 5C13.1657 5 15.2318 6.4895 16.0833 8.59739C16.2384 8.98145 16.0529 9.41857 15.6688 9.57371C15.2847 9.72885 14.8476 9.54328 14.6925 9.15922C14.0622 7.59882 12.5335 6.5 10.75 6.5Z" fill="#28303F"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 1.5C5.64137 1.5 1.5 5.64137 1.5 10.75C1.5 15.8325 5.59923 19.9577 10.6718 19.9997C11.086 20.0031 11.419 20.3417 11.4155 20.7559C11.4121 21.1701 11.0736 21.5031 10.6594 21.4996C4.76395 21.4509 0 16.6568 0 10.75C0 4.81294 4.81294 0 10.75 0C16.6568 0 21.4509 4.76395 21.4996 10.6594C21.5031 11.0736 21.1701 11.4121 20.7559 11.4155C20.3417 11.419 20.0031 11.086 19.9997 10.6718C19.9577 5.59923 15.8325 1.5 10.75 1.5Z" fill="#28303F"/>
</svg>`;

const searchActiveXml = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.62821C0 2.07212 2.07212 0 4.62821 0H14.3718C16.9279 0 19 2.07212 19 4.62821V5.66346C19 6.06705 18.6728 6.39423 18.2692 6.39423C17.8656 6.39423 17.5385 6.06705 17.5385 5.66346V4.62821C17.5385 2.8793 16.1207 1.46154 14.3718 1.46154H4.62821C2.8793 1.46154 1.46154 2.8793 1.46154 4.62821V14.3718C1.46154 16.1207 2.8793 17.5385 4.62821 17.5385H6.21154C6.61513 17.5385 6.94231 17.8656 6.94231 18.2692C6.94231 18.6728 6.61513 19 6.21154 19H4.62821C2.07212 19 0 16.9279 0 14.3718V4.62821Z" fill="#28303F"/>
<path d="M16 16L18 18M12.6667 17.3333C12.0538 17.3333 11.447 17.2126 10.8808 16.9781C10.3146 16.7436 9.80018 16.3998 9.36683 15.9665C8.93349 15.5332 8.58975 15.0187 8.35523 14.4525C8.12071 13.8863 8 13.2795 8 12.6667C8 12.0538 8.12071 11.447 8.35523 10.8808C8.58975 10.3146 8.93349 9.80018 9.36683 9.36683C9.80018 8.93349 10.3146 8.58975 10.8808 8.35523C11.447 8.12071 12.0538 8 12.6667 8C13.9043 8 15.0913 8.49167 15.9665 9.36683C16.8417 10.242 17.3333 11.429 17.3333 12.6667C17.3333 13.9043 16.8417 15.0913 15.9665 15.9665C15.0913 16.8417 13.9043 17.3333 12.6667 17.3333Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const searchInactiveXml = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 5C1 2.79086 2.79086 1 5 1H15C17.2091 1 19 2.79086 19 5V13C19 16.3137 16.3137 19 13 19H5C2.79086 19 1 17.2091 1 15V5Z" fill="#A9ACB2"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.62821C0 2.07212 2.07212 0 4.62821 0H14.3718C16.9279 0 19 2.07212 19 4.62821V5.66346C19 6.06705 18.6728 6.39423 18.2692 6.39423C17.8656 6.39423 17.5385 6.06705 17.5385 5.66346V4.62821C17.5385 2.8793 16.1207 1.46154 14.3718 1.46154H4.62821C2.8793 1.46154 1.46154 2.8793 1.46154 4.62821V14.3718C1.46154 16.1207 2.8793 17.5385 4.62821 17.5385H6.21154C6.61513 17.5385 6.94231 17.8656 6.94231 18.2692C6.94231 18.6728 6.61513 19 6.21154 19H4.62821C2.07212 19 0 16.9279 0 14.3718V4.62821Z" fill="#28303F"/>
<path d="M16 16L18 18M12.6667 17.3333C12.0538 17.3333 11.447 17.2126 10.8808 16.9781C10.3146 16.7436 9.80018 16.3998 9.36683 15.9665C8.93349 15.5332 8.58975 15.0187 8.35523 14.4525C8.12071 13.8863 8 13.2795 8 12.6667C8 12.0538 8.12071 11.447 8.35523 10.8808C8.58975 10.3146 8.93349 9.80018 9.36683 9.36683C9.80018 8.93349 10.3146 8.58975 10.8808 8.35523C11.447 8.12071 12.0538 8 12.6667 8C13.9043 8 15.0913 8.49167 15.9665 9.36683C16.8417 10.242 17.3333 11.429 17.3333 12.6667C17.3333 13.9043 16.8417 15.0913 15.9665 15.9665C15.0913 16.8417 13.9043 17.3333 12.6667 17.3333Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const verificationActiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="10.75" cy="10.75" r="10" transform="rotate(180 10.75 10.75)" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M13.4953 6.98265C13.6538 6.83178 13.8647 6.74837 14.0835 6.75002C14.3023 6.75168 14.5119 6.83827 14.6681 6.99153C14.8242 7.14478 14.9148 7.35272 14.9205 7.57145C14.9263 7.79018 14.8469 8.00261 14.699 8.1639L10.2103 13.7777C10.1331 13.8608 10.04 13.9275 9.9364 13.9738C9.83284 14.0201 9.721 14.0451 9.60758 14.0472C9.49416 14.0493 9.38148 14.0285 9.27627 13.986C9.17107 13.9436 9.07551 13.8804 8.9953 13.8002L6.01855 10.8234C5.93565 10.7462 5.86916 10.653 5.82304 10.5495C5.77693 10.446 5.75213 10.3343 5.75013 10.221C5.74813 10.1077 5.76897 9.99517 5.81141 9.89011C5.85385 9.78504 5.91701 9.68961 5.99713 9.60949C6.07725 9.52936 6.17269 9.4662 6.27775 9.42377C6.38281 9.38133 6.49534 9.36049 6.60864 9.36249C6.72193 9.36449 6.83365 9.38928 6.93715 9.4354C7.04065 9.48152 7.1338 9.54801 7.21105 9.6309L9.5668 11.9855L13.4739 7.0074L13.4953 6.98265Z" fill="#28303F"/>
</svg>`;

const verificationInactiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="10.75" cy="10.75" r="10" transform="rotate(180 10.75 10.75)" fill="#A9ACB2" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M13.4953 6.98265C13.6538 6.83178 13.8647 6.74837 14.0835 6.75002C14.3023 6.75168 14.5119 6.83827 14.6681 6.99153C14.8242 7.14478 14.9148 7.35272 14.9205 7.57145C14.9263 7.79018 14.8469 8.00261 14.699 8.1639L10.2103 13.7777C10.1331 13.8608 10.04 13.9275 9.9364 13.9738C9.83284 14.0201 9.721 14.0451 9.60758 14.0472C9.49416 14.0493 9.38148 14.0285 9.27627 13.986C9.17107 13.9436 9.07551 13.8804 8.9953 13.8002L6.01855 10.8234C5.93565 10.7462 5.86916 10.653 5.82304 10.5495C5.77693 10.446 5.75213 10.3343 5.75013 10.221C5.74813 10.1077 5.76897 9.99517 5.81141 9.89011C5.85385 9.78504 5.91701 9.68961 5.99713 9.60949C6.07725 9.52936 6.17269 9.4662 6.27775 9.42377C6.38281 9.38133 6.49534 9.36049 6.60864 9.36249C6.72193 9.36449 6.83365 9.38928 6.93715 9.4354C7.04065 9.48152 7.1338 9.54801 7.21105 9.6309L9.5668 11.9855L13.4739 7.0074L13.4953 6.98265Z" fill="#28303F"/>
</svg>`;

const myPageActiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.9027 10.75C20.9027 13.7634 19.5597 16.4654 17.4352 18.2988C15.6661 19.8256 13.355 20.75 10.8263 20.75C8.2977 20.75 5.98661 19.8256 4.21743 18.2988C2.09302 16.4654 0.75 13.7634 0.75 10.75C0.75 5.22715 5.26133 0.75 10.8263 0.75C16.3913 0.75 20.9027 5.22715 20.9027 10.75Z" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<ellipse cx="10.8276" cy="7.75" rx="3.0229" ry="3" stroke="#28303F" stroke-width="1.5"/>
<path d="M17.4287 18.2988C16.4277 15.6418 13.8464 13.75 10.8198 13.75C7.79329 13.75 5.21195 15.6418 4.21094 18.2988C5.98011 19.8256 8.2912 20.75 10.8198 20.75C13.3485 20.75 15.6596 19.8256 17.4287 18.2988Z" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

const myPageInactiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.9027 10.75C20.9027 13.7634 19.5597 16.4654 17.4352 18.2988C15.6661 19.8256 13.355 20.75 10.8263 20.75C8.2977 20.75 5.98661 19.8256 4.21743 18.2988C2.09302 16.4654 0.75 13.7634 0.75 10.75C0.75 5.22715 5.26133 0.75 10.8263 0.75C16.3913 0.75 20.9027 5.22715 20.9027 10.75Z" fill="#A9ACB2" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<ellipse cx="10.8276" cy="7.75" rx="3.0229" ry="3" fill="#28303F"/>
<path d="M17.4287 18.2988C16.4277 15.6418 13.8464 13.75 10.8198 13.75C7.79329 13.75 5.21195 15.6418 4.21094 18.2988C5.98011 19.8256 8.2912 20.75 10.8198 20.75C13.3485 20.75 15.6596 19.8256 17.4287 18.2988Z" fill="#28303F"/>
</svg>`;

const iconByKey: Record<GnbTabKey, { active: string; inactive: string }> = {
  participation: { active: participationInactiveXml, inactive: participationActiveXml },
  search: { active: searchInactiveXml, inactive: searchActiveXml },
  verification: { active: verificationInactiveXml, inactive: verificationActiveXml },
  myPage: { active: myPageInactiveXml, inactive: myPageActiveXml },
};

const defaultItems: GnbItem[] = [
  { key: 'participation', label: '참여' },
  { key: 'search', label: '탐색' },
  { key: 'verification', label: '인증' },
  { key: 'myPage', label: '마이페이지' },
];

export function Gnb({ activeKey = 'participation', items = defaultItems, style }: GnbProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.tabRow}>
        {items.map((item) => {
          const icon = iconByKey[item.key];
          const isActive = item.key === activeKey;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={styles.tab}
              onPress={item.onPress}>
              <SvgXml
                xml={isActive ? icon.active : icon.inactive}
                width={22}
                height={22}
                style={styles.icon}
              />
              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View pointerEvents="none" style={styles.homeIndicatorArea}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 102,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  tabRow: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    height: 68,
    alignItems: 'center',
    paddingTop: 16,
  },
  icon: {
    marginBottom: 3,
  },
  label: {
    color: '#000000',
    fontFamily: pretendard(400),
    fontSize: 10,
    textAlign: 'center',
  },
  homeIndicatorArea: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#626877',
  },
});
