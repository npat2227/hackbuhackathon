import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Timer from '../../components/timer';


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
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1, // update every 1 meter
        },
        (location) => {
          setLocation(location);
        }
      );
    })();

    return () => {
      if (subscription) {
        (subscription as Location.LocationSubscription).remove();
      }
    };
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
        <Marker coordinate={POINT_A} title="Start" />
        <Marker coordinate={POINT_B} title="Finish" />
      </MapView>
      <Timer startLocation={POINT_A} endLocation={POINT_B} userLocation={location?.coords ?? null} />
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>?</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.sheetTitle}>Welcome to Binghamton Walkthrough!</Text>
            <Text style={styles.sheetText}>Binghamton Walkthrough is like Wordle, but for racing.
              Every day, a race track will be randomly selected. Go to point A, press start,
              and get to point B as fast as you can! If you're fast enough, you might make it on the leaderboard of the fastest racers.
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  fab: {
    position: 'absolute',
    zIndex: 9,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.0)', //use to change backdrop color/opacity
    justifyContent: 'flex-end', //because it looks butt ugly on android
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sheetText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 16,
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
  },
});