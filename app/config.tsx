import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ConfigScreen() {
  const [apiUrl, setApiUrl] = useState("");
  const [authKey, setAuthKey] = useState("");
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadSettings = async () => {
      const savedUrl = await AsyncStorage.getItem("API_URL");
      const savedKey = await AsyncStorage.getItem("AUTH_KEY");
      if (savedUrl) setApiUrl(savedUrl);
      if (savedKey) setAuthKey(savedKey);
    };
    loadSettings();
  }, []);

  const saveSettings = async () => {
    await AsyncStorage.setItem("API_URL", apiUrl);
    await AsyncStorage.setItem("AUTH_KEY", authKey);
    Alert.alert("Sucesso", "Configurações guardadas!");
    router.replace({ pathname: "/", params: { refresh: "1" } });
  };

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left + 20,
        paddingRight: insets.right + 20,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Configurações</Text>

      <Text>URL da API:</Text>
      <TextInput
        value={apiUrl}
        onChangeText={setApiUrl}
        placeholder="http://<YOURSERVER>"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 15,
          borderRadius: 8,
        }}
      />

      <Text>Chave de Autorização:</Text>
      <TextInput
        value={authKey}
        onChangeText={setAuthKey}
        placeholder="Key..."
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 15,
          borderRadius: 8,
        }}
      />

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TouchableOpacity
          onPress={saveSettings}
          style={{
            backgroundColor: "green",
            padding: 15,
            borderRadius: 8,
            flex: 1,
            marginRight: 5,
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "red",
            padding: 15,
            borderRadius: 8,
            flex: 1,
            marginLeft: 5,
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
