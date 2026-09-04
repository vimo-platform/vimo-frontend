import { Stack } from "expo-router";

import { AuthProvider } from "@/hooks/admin/use-admin-auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* headerBackButtonDisplayMode: 뒤로가기 버튼에 이전 화면 이름("(tabs)" 등)이 붙지 않게 화살표만 표시 */}
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="posting/[id]"
          options={{ title: "지원자 목록", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="posting/fcfs/[id]"
          options={{ title: "지원자 목록", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="posting/create"
          options={{ title: "공고 작성", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="posting/preview"
          options={{
            title: "공고 작성",
            headerTitleAlign: "center",
            // 로딩 화면(작성 화면 내부)에서 미리보기로 넘어올 때
            // 딱 끊기지 않고 서서히 크로스페이드되도록.
            animation: "fade",
            animationDuration: 500,
          }}
        />
        <Stack.Screen
          name="posting/edit"
          options={{ title: "공고 수정", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="activity/[id]"
          options={{ title: "상세보기", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="qr/[sessionId]"
          options={{ headerTitleAlign: "center" }}
        />
      </Stack>
    </AuthProvider>
  );
}
