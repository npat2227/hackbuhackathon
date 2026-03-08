import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';


interface TimerProps {
  startLocation: { latitude: number; longitude: number };
  userLocation: { latitude: number; longitude: number } | null;
  endLocation: { latitude: number; longitude: number };
}

const DISTANCE_THRESHOLD = 50; // Distance in meters

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

export default function Timer({ startLocation, endLocation, userLocation }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const distanceStart = userLocation
    ? getDistance(
        userLocation.latitude,
        userLocation.longitude,
        startLocation.latitude,
        startLocation.longitude
      )
    : Infinity;
  let distanceCurrent = distanceStart
  const distanceEnd = userLocation
      ? getDistance(
          userLocation.latitude,
          userLocation.longitude,
          endLocation.latitude,
          endLocation.longitude
      )
      : Infinity;


  const isNearStart = distanceStart <= DISTANCE_THRESHOLD;

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running]);

  function updateDistance() {
    distanceCurrent = distanceEnd
  }
  const handleButtonPress = () => {
    if (running) {
      setSeconds(0);
      setRunning(false);
    } else {
      setRunning(true);
      updateDistance();
    }
  };

  const formatTime = (sec: any) => {
    const minutes = Math.floor(sec / 60);
    const secondsLeft = sec % 60;
    return `${minutes.toString().padStart(2,'0')}:${secondsLeft.toString().padStart(2,'0')}`;
  };

  return (
    <View style={timerStyles.timerContainer}>
      <View>
        <Text style={timerStyles.timerText}>{formatTime(seconds)}</Text>
        {!running && !isNearStart && userLocation && (
          <Text style={timerStyles.distanceText}>
            {distanceCurrent.toFixed(0)}m away
          </Text>
        )}
      </View>
      <Button
        title={running ? "Reset Timer" : "Start Timer"}
        onPress={handleButtonPress}
        disabled={!running && !isNearStart}
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
  distanceText: {
    color: '#ff4444',
    fontSize: 12,
    fontWeight: '600',
  },
});