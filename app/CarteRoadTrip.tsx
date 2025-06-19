import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function CarteRoadTrip() {
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<any[]>([]);
  const [tripId, setTripId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch le dernier trip au montage (customStops ou roadTripId.stops)
  useEffect(() => {
    const fetchTrip = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const res = await fetch('http://192.168.0.10:5001/api/trips/latest', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Impossible de récupérer le road trip');
        const data = await res.json();
        setTripId(data.trip._id);

        // Formatage des stops :
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
      } catch (e: any) {
        Alert.alert('Erreur', e.message);
      }
      setLoading(false);
    };
    fetchTrip();
  }, []);

  // Région centrée sur le premier stop
  const region = stops.length
    ? {
        latitude: stops[0].latitude || 7.2906, // Kandy par défaut si rien
        longitude: stops[0].longitude || 80.6337,
        latitudeDelta: 3,
        longitudeDelta: 3,
      }
    : {
        latitude: 7.2906,
        longitude: 80.6337,
        latitudeDelta: 3,
        longitudeDelta: 3,
      };

  // Ajouter une étape en cliquant sur la carte
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

  // Déplacer un marker
  const handleMarkerDragEnd = (index: number, e: any) => {
    const coord = e.nativeEvent.coordinate;
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], latitude: coord.latitude, longitude: coord.longitude };
    setStops(newStops);
  };

  // Supprimer un marker (clic sur bulle)
  const handleDeleteStop = (index: number) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  // Sauvegarder dans le backend
  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    // On sauvegarde avec latitude/longitude pour customStops
    try {
      const res = await fetch('http://192.168.0.10:5001/api/trips/latest/stops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stops }),
      });
      if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
      Alert.alert('Sauvegardé', 'Tes étapes personnalisées ont été sauvegardées !');
      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    }
  };

  // Polyline pour afficher l’itinéraire
  const polylineCoords = stops
    .filter(s => s.latitude && s.longitude)
    .map(s => ({ latitude: s.latitude, longitude: s.longitude }));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        onPress={handleMapPress}
      >
        {/* Affiche l’itinéraire */}
        {polylineCoords.length >= 2 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor="#27ae60"
            strokeWidth={4}
          />
        )}
        {/* Markers pour chaque arrêt */}
        {stops.map((stop, idx) =>
          stop.latitude && stop.longitude ? (
            <Marker
              key={idx}
              coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
              title={stop.name}
              description={stop.description}
              draggable
              onDragEnd={e => handleMarkerDragEnd(idx, e)}
              onCalloutPress={() => handleDeleteStop(idx)}
            />
          ) : null
        )}
      </MapView>
      <Button title="Sauvegarder" onPress={handleSave} />
      <Text style={{ textAlign: 'center', color: '#aaa', marginVertical: 5 }}>
        • Clique sur la carte pour ajouter un arrêt{'\n'}
        • Fais un appui long sur un marker pour le déplacer{'\n'}
        • Clique sur une bulle marker pour supprimer
      </Text>
      {stops.length === 0 && (
        <Text style={{ textAlign: 'center', color: 'red', marginTop: 8 }}>
          Aucune étape à afficher
        </Text>
      )}
    </View>
  );
}