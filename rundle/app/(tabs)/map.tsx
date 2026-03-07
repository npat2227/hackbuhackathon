import { View, Text, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import React, { useState, useEffect } from 'react';
import Timer from '../../components/timer'
import * as Location from 'expo-location';

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



export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      console.log(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  return (
    <View style={styles.container}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
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