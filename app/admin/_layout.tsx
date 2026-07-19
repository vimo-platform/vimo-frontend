import { Stack } from "expo-router";

import { AuthProvider } from "@/features/admin/hooks/use-admin-auth";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="posting/[id]"
          options={{ title: "지원자 목록", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="posting/create"
          options={{ title: "공고 작성", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="posting/preview"
          options={{ title: "공고 작성", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="posting/edit"
          options={{ title: "공고 수정", headerTitleAlign: "center" }}
        />
        <Stack.Screen
          name="activity/[id]"
          options={{ title: "상세보기", headerTitleAlign: "center" }}
        />
      </Stack>
    </AuthProvider>
  );
}
