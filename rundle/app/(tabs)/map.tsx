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


const POINT_PAIRS = {

};

export default function MapScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [points] = useState(() => getRandomPoints());
  const [POINT_A, POINT_B] = points;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        console.log(currentLocation.coords.latitude, currentLocation.coords.longitude);
      } catch (error) {
        setErrorMsg('Error fetching location');
        console.error(error);
      }
    })();
  }, []);

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
            <Text style={styles.sheetTitle}>Tutorial</Text>
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  closeButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  errorBanner: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
