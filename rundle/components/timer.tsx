// ─── Imports ──────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TimerProps {
  startLocation: { latitude: number; longitude: number };
  endLocation: { latitude: number; longitude: number };
  userLocation: { latitude: number; longitude: number } | null;
  // Called with final elapsed seconds when user reaches the finish point
  onFinish?: (seconds: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DISTANCE_THRESHOLD = 50; // metres — how close counts as "arrived"

// ─── Haversine distance helper ────────────────────────────────────────────────
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // metres
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Timer({
  startLocation,
  endLocation,
  userLocation,
  onFinish,
}: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  // Distance from user to start / finish (Infinity when location unavailable)
  const distanceToStart = userLocation
    ? getDistance(
        userLocation.latitude,
        userLocation.longitude,
        startLocation.latitude,
        startLocation.longitude,
      )
    : Infinity;
  const distanceToEnd = userLocation
    ? getDistance(
        userLocation.latitude,
        userLocation.longitude,
        endLocation.latitude,
        endLocation.longitude,
      )
    : Infinity;

  const isNearStart = distanceToStart <= DISTANCE_THRESHOLD;

  // Tick every second while running
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  // Auto-stop and fire onFinish when user reaches the finish point
  useEffect(() => {
    if (running && distanceToEnd <= DISTANCE_THRESHOLD) {
      setRunning(false);
      setFinished(true);
      onFinish?.(seconds);
    }
  }, [running, distanceToEnd]);

  const handleButtonPress = () => {
    if (running) {
      // Reset
      setSeconds(0);
      setRunning(false);
      setFinished(false);
    } else if (!finished) {
      setRunning(true);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={timerStyles.timerContainer}>
      <View>
        <Text style={timerStyles.timerText}>{formatTime(seconds)}</Text>
        {/* Show distance to start while user hasn't started yet */}
        {!running && !isNearStart && userLocation && (
          <Text style={timerStyles.distanceText}>
            {distanceToStart.toFixed(0)}m away
          </Text>
        )}
      </View>
      {!finished && (
        <Button
          title={running ? "Reset Timer" : "Start Timer"}
          onPress={handleButtonPress}
          disabled={!running && !isNearStart}
        />
      )}
      {finished && <Text style={timerStyles.finishedText}>Finished!</Text>}
    </View>
  );
}

const timerStyles = StyleSheet.create({
  timerContainer: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  distanceText: {
    color: "#ff4444",
    fontSize: 12,
    fontWeight: "600",
  },
  finishedText: {
    color: "#00cc66",
    fontSize: 16,
    fontWeight: "bold",
  },
});
