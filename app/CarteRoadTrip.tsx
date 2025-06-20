import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CarteRoadTrip() {
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [showRename, setShowRename] = useState(false);
  const [region, setRegion] = useState<any>({
    latitude: 7.2906,
    longitude: 80.6337,
    latitudeDelta: 3,
    longitudeDelta: 3,
  });
  const [zoom, setZoom] = useState(3);
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  // Fetch trip au mount
  useEffect(() => {
    const fetchTrip = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await fetch('http://192.168.0.10:5001/api/trips/latest', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Impossible de récupérer le road trip');
        const data = await res.json();
        // Format des étapes
        let _stops = [];
        if (data.trip.customStops && data.trip.customStops.length > 0) {
          _stops = data.trip.customStops.map((s: any) => ({
            name: s.name,
            latitude: s.latitude ?? s.coordinates?.lat ?? null,
            longitude: s.longitude ?? s.coordinates?.lng ?? null,
            description: s.description ?? '',
          }));
        } else if (
          data.trip.roadTripId &&
          data.trip.roadTripId.stops &&
          data.trip.roadTripId.stops.length > 0
        ) {
          _stops = data.trip.roadTripId.stops.map((s: any) => ({
            name: s.name,
            latitude: s.coordinates?.lat ?? null,
            longitude: s.coordinates?.lng ?? null,
            description: s.description ?? '',
          }));
        }
        setStops(_stops);
        // Centrage sur premier arrêt si dispo
        if (_stops.length) {
          setRegion({
            latitude: _stops[0].latitude,
            longitude: _stops[0].longitude,
            latitudeDelta: 3,
            longitudeDelta: 3,
          });
        }
      } catch (e: any) {
        Alert.alert('Erreur', e.message);
      }
      setLoading(false);
    };
    fetchTrip();
  }, []);

  // Polyline pour afficher l’itinéraire
  const polylineCoords = stops
    .filter(s => s.latitude && s.longitude)
    .map(s => ({ latitude: s.latitude, longitude: s.longitude }));

  // Ajout étape
  const handleMapPress = (e: any) => {
    const coord = e.nativeEvent.coordinate;
    setStops([
      ...stops,
      {
        name: `Arrêt ${stops.length + 1}`,
        latitude: coord.latitude,
        longitude: coord.longitude,
      },
    ]);
  };

  // Déplacement marker
  const handleMarkerDragEnd = (index: number, e: any) => {
    const coord = e.nativeEvent.coordinate;
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], latitude: coord.latitude, longitude: coord.longitude };
    setStops(newStops);
  };

  // Suppression marker
  const handleDeleteStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
    setSelectedIndex(null);
    setShowRename(false);
  };

  // Sauvegarde
  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const stopsToSave = stops.map(({ name, latitude, longitude, description }) => ({
        name, latitude, longitude, description,
      }));
      const res = await fetch('http://192.168.0.10:5001/api/trips/latest/stops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stops: stopsToSave }),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      Alert.alert('Sauvegardé', 'Tes étapes personnalisées ont été sauvegardées !');
      router.replace('/home');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  // Zoom in/out limité
  const handleZoom = (incr: number) => {
    setZoom(prev => {
      let next = prev + incr;
      if (next < 1) next = 1.5;
      if (next > 10) next = 10;
      setRegion((old: any) => ({
        ...old,
        latitudeDelta: 3 / next,
        longitudeDelta: 3 / next,
      }));
      return next;
    });
  };

  // Recentrer sur 1er arrêt
  const handleRecenter = () => {
    if (stops.length > 0) {
      mapRef.current?.animateToRegion({
        latitude: stops[0].latitude,
        longitude: stops[0].longitude,
        latitudeDelta: 3 / zoom,
        longitudeDelta: 3 / zoom,
      }, 500);
    }
  };

  // Renommer un arrêt
  const handleRename = () => {
    if (selectedIndex !== null && editName.trim()) {
      const newStops = [...stops];
      newStops[selectedIndex].name = editName.trim();
      setStops(newStops);
      setShowRename(false);
      setEditName('');
      setSelectedIndex(null);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 70 : 0}
    >
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={region}
          region={region}
          onPress={handleMapPress}
        >
          {polylineCoords.length >= 2 && (
            <Polyline
              coordinates={polylineCoords}
              strokeColor="#27ae60"
              strokeWidth={4}
            />
          )}
          {stops.map((stop, idx) =>
            stop.latitude && stop.longitude ? (
              <Marker
                key={idx}
                coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                title={stop.name}
                description={stop.description}
                draggable
                onDragEnd={e => handleMarkerDragEnd(idx, e)}
                onPress={() => {
                  setSelectedIndex(idx);
                  setShowRename(false);
                }}
              />
            ) : null
          )}
        </MapView>
        {/* Contrôles carte */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 6 }}>
          <TouchableOpacity onPress={() => handleZoom(1)} style={{ marginHorizontal: 6, backgroundColor: '#222', borderRadius: 20, padding: 8 }}>
            <Text style={{ fontSize: 18, color: '#fff' }}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleZoom(-1)} style={{ marginHorizontal: 6, backgroundColor: '#222', borderRadius: 20, padding: 8 }}>
            <Text style={{ fontSize: 18, color: '#fff' }}>－</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRecenter} style={{ marginHorizontal: 6, backgroundColor: '#222', borderRadius: 20, padding: 8 }}>
            <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/287/287221.png" }} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>
          {/* Boutons si marker sélectionné */}
          {selectedIndex !== null && (
            <>
              <TouchableOpacity
                style={{ backgroundColor: "#27ae60", borderRadius: 20, padding: 8, marginLeft: 6 }}
                onPress={() => {
                  setEditName(stops[selectedIndex].name);
                  setShowRename(true);
                }}
              >
                <Text style={{ color: "#fff" }}>Renommer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: "#e74c3c", borderRadius: 20, padding: 8, marginLeft: 6 }}
                onPress={() => handleDeleteStop(selectedIndex)}
              >
                <Text style={{ color: "#fff" }}>Supprimer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* Zone de renommage bien placée */}
        {showRename && selectedIndex !== null && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: "#eee",
            padding: 8,
            marginHorizontal: 16,
            borderRadius: 8,
            marginBottom: 10
          }}>
            <TextInput
              style={{ backgroundColor: "#fff", flex: 1, borderRadius: 8, paddingHorizontal: 8, marginRight: 6 }}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nouveau nom"
              autoFocus
            />
            <Button title="OK" onPress={handleRename} />
            <Button title="Annuler" onPress={() => setShowRename(false)} color="#f33" />
          </View>
        )}
        <Button title="Sauvegarder" onPress={handleSave} />
        <Text style={{ textAlign: 'center', color: '#aaa', marginVertical: 5 }}>
          • Clique sur la carte pour ajouter un arrêt{'\n'}
          • Déplace un marker pour ajuster{'\n'}
          • Sélectionne un marker puis “Renommer” ou “Supprimer”
        </Text>
        {stops.length === 0 && (
          <Text style={{ textAlign: 'center', color: 'red', marginTop: 8 }}>
            Aucune étape à afficher
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}