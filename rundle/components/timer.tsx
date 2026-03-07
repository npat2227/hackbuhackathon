import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running]);

  const handleButtonPress = () => {
    if (running) {
      setSeconds(0);
      setRunning(false);
    } else {
      setRunning(true);
    }
  };

  const formatTime = (sec: any) => {
    const minutes = Math.floor(sec / 60);
    const secondsLeft = sec % 60;
    return `${minutes.toString().padStart(2,'0')}:${secondsLeft.toString().padStart(2,'0')}`;
  };

  return (
    <View style={timerStyles.timerContainer}>
      <Text style={timerStyles.timerText}>{formatTime(seconds)}</Text>
      <Button
        title={running ? "Reset Timer" : "Start Timer"}
        onPress={handleButtonPress}
      />
    </View>
  );
}

const timerStyles = StyleSheet.create({
  timerContainer: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});