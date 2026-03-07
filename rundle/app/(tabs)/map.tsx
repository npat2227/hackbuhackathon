import { View, Text, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import Timer from '../../components/timer'

const POINT_A = {
  latitude: 37.7749,
  longitude: -122.4194,
};

const POINT_B = {
  latitude: 37.7849,
  longitude: -122.4094,
};

const POINT_PAIRS = {

};

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (POINT_A.latitude + POINT_B.latitude) / 2,
          longitude: (POINT_A.longitude + POINT_B.longitude) / 2,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}>
        <Marker coordinate={POINT_A} title="Point A" />
        <Marker coordinate={POINT_B} title="Point B" />
      </MapView>
    <Timer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});