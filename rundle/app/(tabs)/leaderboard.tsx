import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface LeaderboardEntry {
  nickname: string;
  seconds: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  // Reload leaderboard every time this tab is focused
  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().split("T")[0];
      AsyncStorage.getItem(`leaderboard_${today}`).then((data) => {
        if (!data) {
          setEntries([]);
          return;
        }
        const parsed: LeaderboardEntry[] = JSON.parse(data);
        setEntries(parsed.sort((a, b) => a.seconds - b.seconds)); // fastest first
      });
    }, []),
  );

  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

    return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>TODAY'S LEADERBOARD</Text>
        <Text style={styles.date}>{todayLabel}</Text>
      </View>

      {/* Empty state */}
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No entries yet today.</Text>
          <Text style={styles.emptySubText}>
            Complete the route to appear here!
          </Text>
        </View>
      ) : (
        // Entry list — sorted fastest to slowest
        <FlatList
          data={entries}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={[styles.row, index === 0 && styles.rowFirst]}>
              {/* Rank: medal for top 3, number for the rest */}
              <Text style={styles.rank}>
                {index < 3 ? MEDAL[index] : `#${index + 1}`}
              </Text>
              <Text style={styles.nicknameText} numberOfLines={1}>
                {item.nickname}
              </Text>
              <Text style={[styles.timeText, index === 0 && styles.timeFirst]}>
                {formatTime(item.seconds)}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
  },
  header: {
    backgroundColor: "#007AFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  date: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  rowFirst: {
    backgroundColor: "#fff8e1",
    borderWidth: 1.5,
    borderColor: "#FFD700",
  },
  rank: {
    fontSize: 22,
    width: 40,
  },
  nicknameText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  timeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    fontVariant: ["tabular-nums"],
  },
  timeFirst: {
    color: "#e67e00",
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
  },
});
