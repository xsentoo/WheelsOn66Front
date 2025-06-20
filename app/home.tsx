import React, { useEffect, useState } from 'react';
import {
  View, Text, ActivityIndicator, Alert,
  TextInput, ScrollView, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform
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
  const [steps, setSteps] = useState<any[]>([]);

  // Récupère les infos utilisateur/voyage
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

        // RoadTrip lié
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

        // Items à ramener
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

        // STEPS (étapes personnalisées d'abord, sinon stops de base)
        if (tripData.trip.customStops && tripData.trip.customStops.length > 0) {
          setSteps(tripData.trip.customStops);
        } else if (
          (tripData.trip.roadTripId && tripData.trip.roadTripId.stops && tripData.trip.roadTripId.stops.length > 0)
          || (roadTrip && roadTrip.stops && roadTrip.stops.length > 0)
        ) {
          const _stops =
            (tripData.trip.roadTripId && tripData.trip.roadTripId.stops && Array.isArray(tripData.trip.roadTripId.stops))
              ? tripData.trip.roadTripId.stops
              : (roadTrip && Array.isArray(roadTrip.stops) ? roadTrip.stops : []);
          setSteps(_stops);
        } else {
          setSteps([]);
        }
      } else {
        setTrip(null);
        setRoadTrip(null);
        setItems([]);
        setSteps([]);
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

  // Ajout d’un matériel personnalisé
  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  // Modification du nom ou quantité d’un item
  const handleItemChange = (idx: number, key: string, value: string) => {
    const newItems = [...items];
    if (key === 'quantity') {
      newItems[idx][key] = parseInt(value) || 1;
    } else if (key === 'price') {
      newItems[idx][key] = parseFloat(value) || 0;
    } else {
      newItems[idx][key] = value;
    }
    setItems(newItems);
  };

  // Suppression d’un matériel personnalisé
  const handleDeleteItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Bienvenue, {user?.name} 👋</Text>
          <Text style={styles.subtitle}>Ton email : {user?.email}</Text>
          
          {/* === BOUTON ACCÈS PROFIL === */}
          <TouchableOpacity
            style={[styles.button, { marginBottom: 14, backgroundColor: '#1f2937' }]}
            onPress={() => router.push('/pageProfil')}
          >
            <Text style={[styles.buttonText, { color: '#27ae60' }]}>Voir / Modifier mon profil</Text>
          </TouchableOpacity>
          
          {trip ? (
            <>
              <Text style={styles.tripTitle}>Ton dernier voyage : {trip.destination}</Text>
              <Text style={styles.tripSub}>Pour {trip.people} personnes, {trip.days} jours</Text>
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
                        <Text key={idx} style={{ color: "#fff" }}>
                          - {s.name}
                        </Text>
                      ))
                    ) : (
                      <Text style={{ color: "red" }}>Aucune étape pour ce road trip</Text>
                    )}
                  </View>
                </View>
              )}

              <Text style={styles.sectionTitle}>Matériel à ramener :</Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { marginBottom: 8 }]}
                onPress={handleAddItem}
              >
                <Text style={styles.buttonText}>+ Ajouter un matériel</Text>
              </TouchableOpacity>

              <View style={styles.itemBox}>
                {items.map((item, idx) => (
                  <View key={idx} style={[styles.itemRow, { alignItems: 'center' }]}>
                    <TextInput
                      style={[styles.input, { flex: 2, marginRight: 4 }]}
                      placeholder="Nom matériel"
                      placeholderTextColor="#888"
                      value={item.name}
                      onChangeText={val => handleItemChange(idx, 'name', val)}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 4 }]}
                      placeholder="Qté"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={item.quantity ? item.quantity.toString() : ''}
                      onChangeText={val => handleItemChange(idx, 'quantity', val)}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 4 }]}
                      placeholder="Prix €"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      value={item.price ? item.price.toString() : ''}
                      onChangeText={val => handleItemChange(idx, 'price', val)}
                    />
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(idx)}
                      style={{ padding: 4 }}
                    >
                      <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <Text style={styles.total}>Total : {total.toFixed(2)} €</Text>
              <View style={styles.buttonSpacing}>
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={saveBudget}>
                  <Text style={styles.buttonText}>Sauvegarder le budget</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.buttonSpacing}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={() => {
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
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}