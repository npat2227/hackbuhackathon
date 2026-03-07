import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

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
});
