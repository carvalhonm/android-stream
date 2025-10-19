import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Video from "react-native-video";
import { WebView } from "react-native-webview";

export default function PlayerScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);
  const [useWebView, setUseWebView] = useState(false);

  const urlString = url as string;

  // Determine if we should use WebView based on URL
  const shouldUseWebView = urlString?.endsWith(".php") || useWebView;

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError(`Falha ao carregar: ${nativeEvent.description || "Erro desconhecido"}`);
    setLoading(false);
  };

  const handleVideoError = (error: any) => {
    console.error("Video error:", error);
    setError(`Video failed to load: ${error.error?.code || "Unknown error"}`);
    setLoading(false);
  };

  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
    setLoading(false);
    setError(null);
  };

  const switchToWebView = () => {
    setUseWebView(true);
    setError(null);
    setLoading(true);
  };

  const switchToVideo = () => {
    setUseWebView(false);
    setError(null);
    setLoading(true);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text style={{ color: "white", textAlign: "center", marginBottom: 20 }}>{error}</Text>
          <Text style={{ color: "gray", textAlign: "center", marginBottom: 20, fontSize: 12 }}>
            URL: {urlString}
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              onPress={switchToVideo}
              style={{
                backgroundColor: "#28a745",
                padding: 15,
                borderRadius: 8,
                flex: 1,
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Tentar Video Player</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={switchToWebView}
              style={{
                backgroundColor: "#007AFF",
                padding: 15,
                borderRadius: 8,
                flex: 1,
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Tentar WebView</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {shouldUseWebView ? (
            <WebView
              source={{ uri: urlString }}
              style={{ flex: 1 }}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              onError={handleError}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              bounces={false}
              scrollEnabled={false}
              // Block any navigation except the original URL exactly.
              // This prevents popups, target="_blank", same-page navigation, etc.
              onShouldStartLoadWithRequest={request => {
                try {
                  const requestUrl = String(request.url || "");
                  // Allow only when the request URL exactly matches the initial URL.
                  if (requestUrl === urlString) return true;
                  // Also allow about:blank which some pages use for intermediate loads
                  if (requestUrl === "about:blank") return true;

                  console.log("Blocked navigation to:", requestUrl);
                  return false;
                } catch {
                  return false;
                }
              }}
            />
          ) : (
            <Video
              source={{ uri: urlString }}
              style={{ flex: 1 }}
              controls
              resizeMode="contain"
              onError={handleVideoError}
              onLoad={handleVideoLoad}
              onLoadStart={handleLoadStart}
            />
          )}

          {/* Transparent overlay to block any user interaction with the player/webview
              while keeping the Voltar button clickable above it. */}
          {shouldUseWebView && (
            <View
              pointerEvents="auto"
              onStartShouldSetResponder={() => true}
              onResponderRelease={() => {
                /* swallow touches */
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "transparent",
                zIndex: 1,
              }}
            />
          )}

          {loading && (
            <View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: [{ translateX: -50 }, { translateY: -50 }],
                backgroundColor: "rgba(0,0,0,0.8)",
                padding: 20,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Carregando...</Text>
              <Text style={{ color: "gray", textAlign: "center", fontSize: 12, marginTop: 5 }}>
                {shouldUseWebView ? "WebView" : "Video Player"}
              </Text>
            </View>
          )}

          {/* Mode indicator */}
          <View
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              backgroundColor: "rgba(0,0,0,0.7)",
              padding: 8,
              borderRadius: 5,
            }}
          ></View>
        </>
      )}

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          bottom: 50,
          right: 20,
          backgroundColor: "white",
          padding: 15,
          borderRadius: 8,
          zIndex: 2,
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
