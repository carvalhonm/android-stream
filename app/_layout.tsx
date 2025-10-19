import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Tela inicial (lista de streams) */}
        <Stack.Screen name="index" options={{ title: "Streams", headerShown: false }} />

        {/* Tela do player */}
        <Stack.Screen name="player" options={{ title: "Player", headerShown: false }} />

        {/* Tela de configurações */}
        <Stack.Screen name="config" options={{ title: "Configurações" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
