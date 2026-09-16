import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { SvgXml } from "react-native-svg";
import { pretendard } from '@/styles/common/fonts';

type GnbProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const fieldQrActiveXml = `<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.75 6.437C0.854 4.337 1.165 3.027 2.097 2.097C3.027 1.165 4.337 0.854 6.437 0.75M19.75 6.437C19.646 4.337 19.335 3.027 18.403 2.097C17.473 1.165 16.163 0.854 14.063 0.75M14.063 19.75C16.163 19.646 17.473 19.335 18.403 18.403C19.335 17.473 19.646 16.163 19.75 14.063M6.437 19.75C4.337 19.646 3.027 19.335 2.097 18.403C1.165 17.473 0.854 16.163 0.75 14.063M15.25 5.25V5.26M15.25 9.25V11.25C15.25 13.136 15.25 14.078 14.664 14.664C14.078 15.25 13.136 15.25 11.25 15.25M7.25 15.25H5.25M6.485 11.098C6.852 11.25 7.318 11.25 8.25 11.25C9.182 11.25 9.648 11.25 10.015 11.098C10.2578 10.9975 10.4784 10.8501 10.6643 10.6643C10.8501 10.4784 10.9975 10.2578 11.098 10.015C11.25 9.648 11.25 9.182 11.25 8.25C11.25 7.318 11.25 6.852 11.098 6.485C10.9975 6.24218 10.8501 6.02155 10.6643 5.83572C10.4784 5.6499 10.2578 5.50251 10.015 5.402C9.648 5.25 9.182 5.25 8.25 5.25C7.318 5.25 6.852 5.25 6.485 5.402C6.24218 5.50251 6.02155 5.6499 5.83572 5.83572C5.6499 6.02155 5.50251 6.24218 5.402 6.485C5.25 6.852 5.25 7.318 5.25 8.25C5.25 9.182 5.25 9.648 5.402 10.015C5.50251 10.2578 5.6499 10.4784 5.83572 10.6643C6.02155 10.8501 6.24218 10.9975 6.485 11.098Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const fieldQrInactiveXml = `<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.25 5.25C1.25 3.04086 3.04086 1.25 5.25 1.25H15.25C17.4591 1.25 19.25 3.04086 19.25 5.25V15.25C19.25 17.4591 17.4591 19.25 15.25 19.25H5.25C3.04086 19.25 1.25 17.4591 1.25 15.25V5.25Z" fill="#A9ACB2"/>
<path d="M0.75 6.437C0.854 4.337 1.165 3.027 2.097 2.097C3.027 1.165 4.337 0.854 6.437 0.75M19.75 6.437C19.646 4.337 19.335 3.027 18.403 2.097C17.473 1.165 16.163 0.854 14.063 0.75M14.063 19.75C16.163 19.646 17.473 19.335 18.403 18.403C19.335 17.473 19.646 16.163 19.75 14.063M6.437 19.75C4.337 19.646 3.027 19.335 2.097 18.403C1.165 17.473 0.854 16.163 0.75 14.063M15.25 5.25V5.26M15.25 9.25V11.25C15.25 13.136 15.25 14.078 14.664 14.664C14.078 15.25 13.136 15.25 11.25 15.25M7.25 15.25H5.25M6.485 11.098C6.852 11.25 7.318 11.25 8.25 11.25C9.182 11.25 9.648 11.25 10.015 11.098C10.2578 10.9975 10.4784 10.8501 10.6643 10.6643C10.8501 10.4784 10.9975 10.2578 11.098 10.015C11.25 9.648 11.25 9.182 11.25 8.25C11.25 7.318 11.25 6.852 11.098 6.485C10.9975 6.24218 10.8501 6.02155 10.6643 5.83572C10.4784 5.6499 10.2578 5.50251 10.015 5.402C9.648 5.25 9.182 5.25 8.25 5.25C7.318 5.25 6.852 5.25 6.485 5.402C6.24218 5.50251 6.02155 5.6499 5.83572 5.83572C5.6499 6.02155 5.50251 6.24218 5.402 6.485C5.25 6.852 5.25 7.318 5.25 8.25C5.25 9.182 5.25 9.648 5.402 10.015C5.50251 10.2578 5.6499 10.4784 5.83572 10.6643C6.02155 10.8501 6.24218 10.9975 6.485 11.098Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const postingsActiveXml = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.62821C0 2.07212 2.07212 0 4.62821 0H14.3718C16.9279 0 19 2.07212 19 4.62821V5.66346C19 6.06705 18.6728 6.39423 18.2692 6.39423C17.8656 6.39423 17.5385 6.06705 17.5385 5.66346V4.62821C17.5385 2.8793 16.1207 1.46154 14.3718 1.46154H4.62821C2.8793 1.46154 1.46154 2.8793 1.46154 4.62821V14.3718C1.46154 16.1207 2.8793 17.5385 4.62821 17.5385H6.21154C6.61513 17.5385 6.94231 17.8656 6.94231 18.2692C6.94231 18.6728 6.61513 19 6.21154 19H4.62821C2.07212 19 0 16.9279 0 14.3718V4.62821Z" fill="#28303F"/>
<path d="M16 16L18 18M12.6667 17.3333C12.0538 17.3333 11.447 17.2126 10.8808 16.9781C10.3146 16.7436 9.80018 16.3998 9.36683 15.9665C8.93349 15.5332 8.58975 15.0187 8.35523 14.4525C8.12071 13.8863 8 13.2795 8 12.6667C8 12.0538 8.12071 11.447 8.35523 10.8808C8.58975 10.3146 8.93349 9.80018 9.36683 9.36683C9.80018 8.93349 10.3146 8.58975 10.8808 8.35523C11.447 8.12071 12.0538 8 12.6667 8C13.9043 8 15.0913 8.49167 15.9665 9.36683C16.8417 10.242 17.3333 11.429 17.3333 12.6667C17.3333 13.9043 16.8417 15.0913 15.9665 15.9665C15.0913 16.8417 13.9043 17.3333 12.6667 17.3333Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const postingsInactiveXml = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 5C1 2.79086 2.79086 1 5 1H15C17.2091 1 19 2.79086 19 5V13C19 16.3137 16.3137 19 13 19H5C2.79086 19 1 17.2091 1 15V5Z" fill="#A9ACB2"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 4.62821C0 2.07212 2.07212 0 4.62821 0H14.3718C16.9279 0 19 2.07212 19 4.62821V5.66346C19 6.06705 18.6728 6.39423 18.2692 6.39423C17.8656 6.39423 17.5385 6.06705 17.5385 5.66346V4.62821C17.5385 2.8793 16.1207 1.46154 14.3718 1.46154H4.62821C2.8793 1.46154 1.46154 2.8793 1.46154 4.62821V14.3718C1.46154 16.1207 2.8793 17.5385 4.62821 17.5385H6.21154C6.61513 17.5385 6.94231 17.8656 6.94231 18.2692C6.94231 18.6728 6.61513 19 6.21154 19H4.62821C2.07212 19 0 16.9279 0 14.3718V4.62821Z" fill="#28303F"/>
<path d="M16 16L18 18M12.6667 17.3333C12.0538 17.3333 11.447 17.2126 10.8808 16.9781C10.3146 16.7436 9.80018 16.3998 9.36683 15.9665C8.93349 15.5332 8.58975 15.0187 8.35523 14.4525C8.12071 13.8863 8 13.2795 8 12.6667C8 12.0538 8.12071 11.447 8.35523 10.8808C8.58975 10.3146 8.93349 9.80018 9.36683 9.36683C9.80018 8.93349 10.3146 8.58975 10.8808 8.35523C11.447 8.12071 12.0538 8 12.6667 8C13.9043 8 15.0913 8.49167 15.9665 9.36683C16.8417 10.242 17.3333 11.429 17.3333 12.6667C17.3333 13.9043 16.8417 15.0913 15.9665 15.9665C15.0913 16.8417 13.9043 17.3333 12.6667 17.3333Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const approvalsActiveXml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="10" transform="rotate(180 12 12)" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M14.7453 8.23265C14.9038 8.08178 15.1147 7.99837 15.3335 8.00002C15.5523 8.00168 15.7619 8.08827 15.9181 8.24153C16.0742 8.39478 16.1648 8.60272 16.1705 8.82145C16.1763 9.04018 16.0969 9.25261 15.949 9.4139L11.4603 15.0277C11.3831 15.1108 11.29 15.1775 11.1864 15.2238C11.0828 15.2701 10.971 15.2951 10.8576 15.2972C10.7442 15.2993 10.6315 15.2785 10.5263 15.236C10.4211 15.1936 10.3255 15.1304 10.2453 15.0502L7.26855 12.0734C7.18565 11.9962 7.11916 11.903 7.07304 11.7995C7.02693 11.696 7.00213 11.5843 7.00013 11.471C6.99813 11.3577 7.01897 11.2452 7.06141 11.1401C7.10385 11.035 7.16701 10.9396 7.24713 10.8595C7.32725 10.7794 7.42269 10.7162 7.52775 10.6738C7.63281 10.6313 7.74534 10.6105 7.85864 10.6125C7.97193 10.6145 8.08365 10.6393 8.18715 10.6854C8.29065 10.7315 8.3838 10.798 8.46105 10.8809L10.8168 13.2355L14.7239 8.2574L14.7453 8.23265Z" fill="#28303F"/>
</svg>`;

const approvalsInactiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="10.75" cy="10.75" r="10" transform="rotate(180 10.75 10.75)" fill="#A9ACB2" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M13.4953 6.98265C13.6538 6.83178 13.8647 6.74837 14.0835 6.75002C14.3023 6.75168 14.5119 6.83827 14.6681 6.99153C14.8242 7.14478 14.9148 7.35272 14.9205 7.57145C14.9263 7.79018 14.8469 8.00261 14.699 8.1639L10.2103 13.7777C10.1331 13.8608 10.04 13.9275 9.9364 13.9738C9.83284 14.0201 9.721 14.0451 9.60758 14.0472C9.49416 14.0493 9.38148 14.0285 9.27627 13.986C9.17107 13.9436 9.07551 13.8804 8.9953 13.8002L6.01855 10.8234C5.93565 10.7462 5.86916 10.653 5.82304 10.5495C5.77693 10.446 5.75213 10.3343 5.75013 10.221C5.74813 10.1077 5.76897 9.99517 5.81141 9.89011C5.85385 9.78504 5.91701 9.68961 5.99713 9.60949C6.07725 9.52936 6.17269 9.4662 6.27775 9.42377C6.38281 9.38133 6.49534 9.36049 6.60864 9.36249C6.72193 9.36449 6.83365 9.38928 6.93715 9.4354C7.04065 9.48152 7.1338 9.54801 7.21105 9.6309L9.5668 11.9855L13.4739 7.0074L13.4953 6.98265Z" fill="#28303F"/>
</svg>`;

const mypageActiveXml = `<svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.3221 12C22.3221 15.0134 20.9689 17.7154 18.8282 19.5488C17.0456 21.0756 14.7168 22 12.1689 22C9.62094 22 7.29221 21.0756 5.50953 19.5488C3.3689 17.7154 2.01562 15.0134 2.01562 12C2.01562 6.47715 6.56139 2 12.1689 2C17.7764 2 22.3221 6.47715 22.3221 12Z" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<ellipse cx="12.171" cy="9" rx="3.04598" ry="3" stroke="#28303F" stroke-width="1.5"/>
<path d="M18.8265 19.5488C17.8179 16.8918 15.2168 15 12.1672 15C9.11751 15 6.51647 16.8918 5.50781 19.5488C7.29049 21.0756 9.61922 22 12.1672 22C14.7151 22 17.0438 21.0756 18.8265 19.5488Z" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
</svg>`;

const mypageInactiveXml = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.9027 10.75C20.9027 13.7634 19.5597 16.4654 17.4352 18.2988C15.6661 19.8256 13.355 20.75 10.8263 20.75C8.2977 20.75 5.98661 19.8256 4.21743 18.2988C2.09302 16.4654 0.75 13.7634 0.75 10.75C0.75 5.22715 5.26133 0.75 10.8263 0.75C16.3913 0.75 20.9027 5.22715 20.9027 10.75Z" fill="#A9ACB2" stroke="#28303F" stroke-width="1.5" stroke-linejoin="round"/>
<ellipse cx="10.8276" cy="7.75" rx="3.0229" ry="3" fill="#28303F"/>
<path d="M17.4287 18.2988C16.4277 15.6418 13.8464 13.75 10.8198 13.75C7.79329 13.75 5.21195 15.6418 4.21094 18.2988C5.98011 19.8256 8.2912 20.75 10.8198 20.75C13.3485 20.75 15.6596 19.8256 17.4287 18.2988Z" fill="#28303F"/>
</svg>`;

const adminTabMeta: Record<
  string,
  { activeIcon: string; inactiveIcon: string; label: string }
> = {
  index: {
    activeIcon: fieldQrInactiveXml,
    inactiveIcon: fieldQrActiveXml,
    label: "현장 QR",
  },
  postings: {
    activeIcon: postingsInactiveXml,
    inactiveIcon: postingsActiveXml,
    label: "공고",
  },
  approvals: {
    activeIcon: approvalsInactiveXml,
    inactiveIcon: approvalsActiveXml,
    label: "승인",
  },
  profile: {
    activeIcon: mypageInactiveXml,
    inactiveIcon: mypageActiveXml,
    label: "마이페이지",
  },
};

function GnbTabBar({ state, navigation }: GnbProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const tab = adminTabMeta[route.name];
          const isActive = state.index === index;

          if (!tab) {
            return null;
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={styles.tab}
              onPress={() => navigation.navigate(route.name)}
            >
              <View style={styles.tabInner}>
                <SvgXml
                  xml={isActive ? tab.activeIcon : tab.inactiveIcon}
                  width={24}
                  height={24}
                  style={styles.icon}
                />
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </View>
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

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={({ state, navigation }) => (
        <GnbTabBar state={state} navigation={navigation} />
      )}
    >
      <Tabs.Screen name="index" options={{ title: "현장 QR", headerShown: false }} />
      <Tabs.Screen name="postings" options={{ title: "공고" }} />
      <Tabs.Screen name="approvals" options={{ title: "승인" }} />
      <Tabs.Screen name="profile" options={{ title: "마이페이지", headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: "100%",
    height: 102,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  tab: {
    flex: 1,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    alignItems: "center",
  },
  icon: {
    marginBottom: 3,
  },
  label: {
    color: "#000000",
    fontFamily: pretendard(400),
    fontSize: 10,
    fontWeight: "400",
    textAlign: "center",
  },
  activeLabel: {
    fontWeight: "600",
  },
  homeIndicatorArea: {
    height: 34,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: "#626877",
  },
});
