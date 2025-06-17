import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import styles from './styles'; // <-- IMPORTANT !

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // Charger user + voyage au chargement
  const fetchData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Non autorisé', 'Veuillez vous reconnecter');
      router.replace('/login');
      return;
    }
    try {
      // 1. User
      const userRes = await fetch('http://192.168.0.10:5001/api/home', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUser(userData);

      // 2. Trip (dernier)
      const tripRes = await fetch('http://192.168.0.10:5001/api/trips/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tripData = await tripRes.json();
      if (tripData.trip) {
        setTrip(tripData.trip);

        // Si la liste d’items est vide, on va chercher la suggestion
        if (!tripData.trip.items || tripData.trip.items.length === 0) {
          const itemsRes = await fetch(`http://192.168.0.10:5001/api/items/${encodeURIComponent(tripData.trip.destination)}`);
          const itemSuggest = await itemsRes.json();
          const suggested = itemSuggest[0]?.items || [];

          // On adapte la suggestion au nombre de personnes
          const itemsWithQuantities = suggested.map((item: any) => ({
            name: item.name,
            quantity: item.quantity ? item.quantity : (item.quantityPerPerson ? item.quantityPerPerson * tripData.trip.people : 1),
            price: 0
          }));

          setItems(itemsWithQuantities);

          // Met à jour le trip dans la BDD (optionnel mais mieux !)
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
      }
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcul du total à chaque changement de prix
  useEffect(() => {
    let t = 0;
    items.forEach(i => { t += (i.price || 0) * (i.quantity || 1); });
    setTotal(t);
  }, [items]);

  useEffect(() => {
    fetchData();
  }, []);

  // Modification d’un prix
  const handlePriceChange = (idx: number, price: string) => {
    const newItems = [...items];
    newItems[idx].price = parseFloat(price) || 0;
    setItems(newItems);
  };

  // Sauvegarder les prix/budget modifiés
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bienvenue, {user?.name} 👋</Text>
      <Text style={styles.subtitle}>Ton email : {user?.email}</Text>

      {trip ? (
        <>
          <Text style={styles.tripTitle}>
            Ton dernier voyage : {trip.destination}
          </Text>
          <Text style={styles.tripSub}>Pour {trip.people} personnes, {trip.days} jours</Text>

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
          <Text style={styles.total}>
            Total : {total.toFixed(2)} €
          </Text>
          <View style={styles.buttonSpacing}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={saveBudget}>
              <Text style={styles.buttonText}>Sauvegarder le budget</Text>
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
  );
}