// ─── Imports ──────────────────────────────────────────────────────────────────
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Timer from "../../components/timer";

// ─── Constants ───────────────────────────────────────────────────────────────
const COORDINATES = [
  { latitude: 42.08705862782569, longitude: -75.9670590221643 },
  { latitude: 42.08764371050289, longitude: -75.97115774377244 },
  { latitude: 42.08540071965536, longitude: -75.96997456737586 },
  { latitude: 42.08794396106325, longitude: -75.96331883861443 },
  { latitude: 42.08767985638451, longitude: -75.96949961121543 },
];

function getRandomPoints() {
  const shuffled = [...COORDINATES].sort(() => 0.5 - Math.random());
  return [shuffled[0], shuffled[1]];
}

const [POINT_A, POINT_B] = getRandomPoints();

// ─── Component ───────────────────────────────────────────────────────────────
export default function MapScreen() {
  // --- State ---
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [nickname, setNickname] = useState("");
  const [finishedSeconds, setFinishedSeconds] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  // --- Leaderboard handlers ---

  // Called by Timer when user reaches the finish point
  const handleFinish = (seconds: number) => {
    setFinishedSeconds(seconds);
    setNicknameModalVisible(true);
  };

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const secondsLeft = sec % 60;
    return `${minutes.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;
  };

  // Saves nickname + time to AsyncStorage under today's date key
  const handleSaveScore = async () => {
    if (!nickname.trim() || finishedSeconds === null) return;
    const today = new Date().toISOString().split("T")[0];
    const key = `leaderboard_${today}`;
    const existing = await AsyncStorage.getItem(key);
    const entries: { nickname: string; seconds: number }[] = existing
      ? JSON.parse(existing)
      : [];
    entries.push({ nickname: nickname.trim(), seconds: finishedSeconds });
    await AsyncStorage.setItem(key, JSON.stringify(entries));
    setNickname("");
    setNicknameModalVisible(false);
  };

  // --- Location tracking ---
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => setLocation(loc),
      );
    })();
    return () => {
      subscription?.remove();
    };
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Map with Start / Finish markers */}
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: (POINT_A.latitude + POINT_B.latitude) / 2,
          longitude: (POINT_A.longitude + POINT_B.longitude) / 2,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker coordinate={POINT_A} title="Start" />
        <Marker coordinate={POINT_B} title="Finish" />
      </MapView>
      {/* Timer overlay — calls onFinish when user reaches POINT_B */}
      <Timer
        startLocation={POINT_A}
        endLocation={POINT_B}
        userLocation={location?.coords ?? null}
        onFinish={handleFinish}
      />

      {/* Info (?) floating button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => setInfoModalVisible(true)}
      >
        <Text style={styles.fabText}>?</Text>
      </TouchableOpacity>

      {/* ── Info Modal ── */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setInfoModalVisible(false)}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.sheetTitle}>
              Welcome to Binghamton Walkthrough!
            </Text>
            <Text style={styles.sheetText}>
              Binghamton Walkthrough is like Wordle, but for racing. Every day,
              a race track will be randomly selected. Go to point A, press
              start, and get to point B as fast as you can! If you&#39;re fast
              enough, you might make it on the leaderboard of the fastest
              racers.
            </Text>
            <TouchableOpacity onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Nickname Modal (shown automatically after finishing the route) ── */}
      <Modal
        visible={nicknameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setNicknameModalVisible(false)}
      >
        <View style={styles.nicknameBackdrop}>
          <View style={styles.nicknameSheet}>
            <Text style={styles.nicknameTitle}>You finished!</Text>
            {finishedSeconds !== null && (
              <Text style={styles.nicknameTime}>
                {formatTime(finishedSeconds)}
              </Text>
            )}
            <Text style={styles.nicknameLabel}>Enter your nickname</Text>
            <TextInput
              style={styles.nicknameInput}
              placeholder="Nickname"
              placeholderTextColor="#999"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                !nickname.trim() && styles.submitButtonDisabled,
              ]}
              onPress={handleSaveScore}
              disabled={!nickname.trim()}
            >
              <Text style={styles.submitButtonText}>Submit to Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  map: { flex: 1 },

  // Info (?) floating button
  fab: {
    position: "absolute",
    zIndex: 9,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.0)", //use to change backdrop color/opacity
    justifyContent: "flex-end", //because it looks butt ugly on android
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  sheetText: {
    fontSize: 16,
    fontWeight: "400",
    marginBottom: 16,
  },
  closeButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  nicknameBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  nicknameSheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
  },
  nicknameTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  nicknameTime: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#007AFF",
    marginBottom: 16,
  },
  nicknameLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  nicknameInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#a0c4ff",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
