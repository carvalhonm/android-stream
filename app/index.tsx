import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Stream {
  name: string;
  url: string;
}

interface Program {
  time: string;
  name: string;
  urls: string[];
}

export default function HomeScreen() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [authKey, setAuthKey] = useState("");
  const [activeView, setActiveView] = useState<"streams" | "programs">("streams");

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  useEffect(() => {
    const loadSettings = async () => {
      const savedUrl = await AsyncStorage.getItem("API_URL");
      const savedKey = await AsyncStorage.getItem("AUTH_KEY");
      if (savedUrl) setApiUrl(savedUrl);
      if (savedKey) setAuthKey(savedKey);
    };
    loadSettings();
  }, []);

  const fetchStreams = useCallback(async () => {
    if (!apiUrl) return;

    try {
      setLoading(true);
      const streamsUrl = `${apiUrl}/streams`;
      console.log("Fetching streams from:", streamsUrl);
      const res = await fetch(streamsUrl, {
        headers: {
          Authorization: authKey ? authKey : "",
        },
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log("Streams data:", data);

      // Log each stream URL for debugging
      if (Array.isArray(data)) {
        data.forEach((stream, index) => {
          console.log(`Stream ${index}:`, {
            name: stream.name,
            url: stream.url,
            isPhpFile: stream.url?.endsWith?.(".php"),
          });
        });
      }

      setStreams(data);
    } catch (err) {
      console.error("Erro ao buscar streams:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      alert(`Erro ao buscar streams: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authKey]);

  const fetchPrograms = useCallback(async () => {
    if (!apiUrl) return;

    try {
      setLoading(true);
      const programsUrl = `${apiUrl}/programs`;
      console.log("Fetching programs from:", programsUrl);
      const res = await fetch(programsUrl, {
        headers: {
          Authorization: authKey ? authKey : "",
        },
      });

      console.log("Programs response status:", res.status);
      console.log("Programs response headers:", Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log("Programs data:", data);

      // Log each program for debugging
      if (Array.isArray(data)) {
        data.forEach((program, index) => {
          console.log(`Program ${index}:`, {
            time: program.time,
            name: program.name,
            urls: program.urls,
          });
        });
      }

      setPrograms(data);
    } catch (err) {
      console.error("Erro ao buscar programas:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      alert(`Erro ao buscar programas: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, authKey]);

  useEffect(() => {
    // Call fetchStreams when apiUrl is loaded
    if (apiUrl) {
      fetchStreams();
    }
  }, [apiUrl, fetchStreams]);

  useEffect(() => {
    // Call fetchPrograms when apiUrl is loaded
    if (apiUrl) {
      fetchPrograms();
    }
  }, [apiUrl, fetchPrograms]);

  useEffect(() => {
    if (params.refresh) {
      fetchStreams();
      fetchPrograms();
    }
  }, [params.refresh, fetchStreams, fetchPrograms]);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 10,
        paddingRight: insets.right + 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Streams & Programas</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            onPress={() => {
              setActiveView("streams");
              fetchStreams();
            }}
            style={{
              backgroundColor: activeView === "streams" ? "#007AFF" : "#666",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>Canais</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveView("programs");
              fetchPrograms();
            }}
            style={{
              backgroundColor: activeView === "programs" ? "#28a745" : "#666",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>Programação</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/config")}
            style={{
              backgroundColor: "#666",
              padding: 10,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Active View Header */}
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
            {activeView === "streams"
              ? `Streams (${streams.length})`
              : `Programas (${programs.length})`}
          </Text>

          {/* Streams List */}
          {activeView === "streams" && (
            <FlatList
              data={streams}
              keyExtractor={(item, index) => `stream-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/player", params: { url: item.url } })}
                  style={{
                    padding: 15,
                    marginBottom: 10,
                    backgroundColor: "#e3f2fd",
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: "#007AFF",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 50,
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
                    Nenhum stream encontrado.{"\n"}
                    Configure a URL base e pressione Streams para carregar.
                  </Text>
                </View>
              }
            />
          )}

          {/* Programs List */}
          {activeView === "programs" && (
            <FlatList
              data={programs}
              keyExtractor={(item, index) => `program-${index}`}
              renderItem={({ item }) => (
                <View
                  style={{
                    padding: 15,
                    marginBottom: 10,
                    backgroundColor: "#e8f5e8",
                    borderRadius: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: "#28a745",
                  }}
                >
                  <Text style={{ fontSize: 16 }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: "#666", marginTop: 2, marginBottom: 10 }}>
                    {item.time}
                  </Text>

                  {/* URL Buttons */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {item.urls.map((url, urlIndex) => (
                      <TouchableOpacity
                        key={`${item.name}-${urlIndex}`}
                        onPress={() => router.push({ pathname: "/player", params: { url } })}
                        style={{
                          backgroundColor: "#28a745",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 6,
                          minWidth: 80,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 12, textAlign: "center" }}>
                          Server {urlIndex + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: 50,
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
                    Nenhum programa encontrado.{"\n"}
                    Configure a URL base e pressione Programas para carregar.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      )}
    </View>
  );
}
