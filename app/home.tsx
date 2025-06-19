import React, { useEffect, useState } from 'react';
import {
  View, Text, ActivityIndicator, Alert,
  TextInput, ScrollView, TouchableOpacity, ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import styles from './styles';

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [roadTrip, setRoadTrip] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Non autorisé', 'Veuillez vous reconnecter');
      router.replace('/login');
      return;
    }
    try {
      const userRes = await fetch('http://192.168.0.10:5001/api/home', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUser(userData);

      const tripRes = await fetch('http://192.168.0.10:5001/api/trips/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tripData = await tripRes.json();
      if (tripData.trip) {
        setTrip(tripData.trip);

        // 3. RoadTrip lié (si roadTripId existe)
        if (tripData.trip.roadTripId) {
          if (typeof tripData.trip.roadTripId === 'object') {
            setRoadTrip(tripData.trip.roadTripId);
          } else {
            try {
              const roadTripRes = await fetch(`http://192.168.0.10:5001/api/roadtrips/${tripData.trip.roadTripId}`);
              const roadTripData = await roadTripRes.json();
              setRoadTrip(roadTripData);
            } catch (e) {
              setRoadTrip(null);
            }
          }
        } else {
          setRoadTrip(null);
        }

        // 4. Items
        if (!tripData.trip.items || tripData.trip.items.length === 0) {
          const itemsRes = await fetch(`http://192.168.0.10:5001/api/items/${encodeURIComponent(tripData.trip.destination)}`);
          const itemSuggest = await itemsRes.json();
          const suggested = itemSuggest[0]?.items || [];
          const itemsWithQuantities = suggested.map((item: any) => ({
            name: item.name,
            quantity: item.quantity ? item.quantity : (item.quantityPerPerson ? item.quantityPerPerson * tripData.trip.people : 1),
            price: 0
          }));

          setItems(itemsWithQuantities);

          await fetch('http://192.168.0.10:5001/api/trips/latest', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: itemsWithQuantities }),
          });
        } else {
          setItems(tripData.trip.items);
        }
      } else {
        setTrip(null);
        setRoadTrip(null);
        setItems([]);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let t = 0;
    items.forEach(i => { t += (i.price || 0) * (i.quantity || 1); });
    setTotal(t);
  }, [items]);

  useEffect(() => {
    fetchData();
  }, []);

  const handlePriceChange = (idx: number, price: string) => {
    const newItems = [...items];
    newItems[idx].price = parseFloat(price) || 0;
    setItems(newItems);
  };

  const saveBudget = async () => {
    const token = await AsyncStorage.getItem('token');
    await fetch('http://192.168.0.10:5001/api/trips/latest', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items, totalBudget: total }),
    });
    Alert.alert('Succès', 'Budget mis à jour !');
  };

  // ----------- CORRECTION LOGIQUE DES ÉTAPES -----------
  let steps: any[] = [];
  if (trip) {
    if (trip.customStops && trip.customStops.length > 0) {
      steps = trip.customStops;
    } else if (roadTrip && roadTrip.stops && roadTrip.stops.length > 0) {
      steps = roadTrip.stops;
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={{ uri: trip?.backgroundImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' }}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Bienvenue, {user?.name} 👋</Text>
          <Text style={styles.subtitle}>Ton email : {user?.email}</Text>
          {trip ? (
            <>
              <Text style={styles.tripTitle}>Ton dernier voyage : {trip.destination}</Text>
              <Text style={styles.tripSub}>Pour {trip.people} personnes, {trip.days} jours</Text>

              {/* -------- AFFICHAGE DU ROAD TRIP ---------- */}
              {roadTrip && (
                <View style={{
                  marginBottom: 16, backgroundColor: "#222",
                  borderRadius: 10, padding: 10
                }}>
                  <Text style={{
                    color: "#27ae60", fontWeight: "bold", fontSize: 16
                  }}>
                    Road Trip : {roadTrip.name}
                  </Text>
                  <Text style={{ color: "#aaa", marginBottom: 4 }}>
                    {roadTrip.description}
                  </Text>

                  <View>
                    <Text style={{ color: "#bbb", fontWeight: "bold" }}>Étapes :</Text>
                    {steps && steps.length > 0 ? (
                      steps.map((s: any, idx: number) => (
                        <Text key={idx} style={{ color: "#fff" }}>- {s.name}</Text>
                      ))
                    ) : (
                      <Text style={{ color: "red" }}>Aucune étape pour ce road trip</Text>
                    )}
                  </View>
                </View>
              )}

              <Text style={styles.sectionTitle}>Matériel à ramener :</Text>
              <View style={styles.itemBox}>
                {items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Prix €"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={item.price ? item.price.toString() : ''}
                      onChangeText={val => handlePriceChange(idx, val)}
                    />
                  </View>
                ))}
              </View>
              <Text style={styles.total}>Total : {total.toFixed(2)} €</Text>
              <View style={styles.buttonSpacing}>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={saveBudget}>
                  <Text style={styles.buttonText}>Sauvegarder le budget</Text>
                </TouchableOpacity>
              </View>

              {/* BOUTON POUR ACCEDER À LA CARTE */}
              <View style={styles.buttonSpacing}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
                    // ENVOIE steps (personnalisées si existe, sinon par défaut)
                    if (steps && steps.length > 0) {
                      router.push({
                        pathname: '/CarteRoadTrip',
                        params: { stopsJson: JSON.stringify(steps) }
                      });
                    } else {
                      Alert.alert('Aucune étape', 'Ce road trip ne contient aucune étape.');
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Personnaliser le Road Trip</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={{ color: '#fff', marginTop: 24 }}>Aucun voyage planifié.</Text>
          )}

          <View style={{ height: 24 }} />
          <View style={styles.buttonSpacing}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={() => router.push('/planifier')}>
              <Text style={styles.buttonText}>Planifier un voyage</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={async () => {
              await AsyncStorage.removeItem('token');
              router.replace('/login');
            }}
          >
            <Text style={styles.buttonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}