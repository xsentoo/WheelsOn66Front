import React, { useEffect, useState } from 'react';
import {
  View, Text, ActivityIndicator, Alert,
  TextInput, ScrollView, TouchableOpacity, ImageBackground,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
const bg = require('../assets/bg.jpg'); 

// === STYLES DIRECTEMENT DANS LE FICHIER ===
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0e1524',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingHorizontal: 24,
    paddingBottom: 18,
    backgroundColor: 'rgba(30,44,80,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#232c4a',
    marginBottom: 0, // <--- ici
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222e4a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#2ef48c',
    fontWeight: 'bold',
    fontSize: 22,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    flex: 1,
    marginLeft: 10,
  },
  container: {
    flex: 1,
    paddingBottom: 12,
  },
  mainCard: {
    backgroundColor: '#1a2335',
    borderRadius: 22,
    padding: 22,
    
    shadowColor: '#132040',
    shadowOpacity: 0.21,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: '#232c4a',
  },
  tripTitle: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 22,
    marginBottom: 4,
    letterSpacing: 0.65,
    textShadowColor: '#181c36',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  tripSub: {
    color: '#c2cee9',
    marginBottom: 16,
    fontSize: 17,
    letterSpacing: 0.1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#47afff',
    marginTop: 20,
    marginBottom: 12,
    fontSize: 19,
    letterSpacing: 1,
    textShadowColor: '#12233f77',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  roadTripBox: {
    marginBottom: 16,
    backgroundColor: "#232f45",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#314060",
  },
  roadTripTitle: {
    color: "#27ae60",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 2,
  },
  roadTripDesc: {
    color: "#aaa",
    marginBottom: 4,
    fontSize: 15,
  },
  roadTripStep: {
    color: "#fff",
    fontSize: 15,
  },
  noStep: {
    color: "red",
    fontSize: 15,
  },
  itemBox: {
    backgroundColor: '#232f45',
    borderRadius: 15,
    padding: 18,
    marginBottom: 21,
    shadowColor: '#0d0f1a',
    shadowOpacity: 0.14,
    shadowOffset: { width: 1, height: 3 },
    shadowRadius: 7,
    elevation: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    borderBottomWidth: 0.7,
    borderBottomColor: '#314060',
    paddingBottom: 9,
  },
  input: {
    backgroundColor: '#182135',
    color: '#fff',
    borderRadius: 10,
    padding: 9,
    fontSize: 17,
    textAlign: 'right',
    borderWidth: 1.5,
    borderColor: '#273a5a',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  total: {
    color: '#2ef48c',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 24,
    marginTop: 8,
    textAlign: 'right',
    letterSpacing: 0.8,
    backgroundColor: '#1b2937',
    paddingVertical: 11,
    borderRadius: 13,
    paddingHorizontal: 20,
    shadowColor: '#0c2426',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 15,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2b3a5c',
    borderWidth: 1,
    borderColor: '#2b3a5c',
    shadowColor: '#191e2e',
    shadowOpacity: 0.17,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 7,
    elevation: 2,
  },
  buttonPrimary: {
    backgroundColor: '#2ef48c',
    shadowColor: '#2ef48c',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 22,
    borderWidth: 0,
  },
  buttonSecondary: {
    backgroundColor: '#348afd',
    shadowColor: '#348afd',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 7,
    borderRadius: 22,
    borderWidth: 0,
  },
  buttonDanger: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
    shadowOpacity: 0.28,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 7,
    borderRadius: 22,
    borderWidth: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    textShadowColor: '#0007',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    // Pour effet "relief"
  },
  buttonSpacing: {
    marginBottom: 19,
    marginTop: 8,
  },
});

export default function HomeScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [roadTrip, setRoadTrip] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [destination, setDestination] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Non autorisé', 'Veuillez vous reconnecter');
      router.replace('/login');
      return;
    }

    try {
      const userRes = await fetch('http://10.92.4.186:5001/api/home', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUser(userData);

      const tripRes = await fetch('http://10.92.4.186:5001/api/trips/latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tripData = await tripRes.json();

      if (tripData.trip) {
        setTrip(tripData.trip);

        if (tripData.trip.roadTripId) {
          if (typeof tripData.trip.roadTripId === 'object') {
            setRoadTrip(tripData.trip.roadTripId);
          } else {
            try {
              const roadTripRes = await fetch(`http://10.92.4.186:5001/api/roadtrips/${tripData.trip.roadTripId}`);
              const roadTripData = await roadTripRes.json();
              setRoadTrip(roadTripData);
            } catch (e) {
              setRoadTrip(null);
            }
          }
        } else {
          setRoadTrip(null);
        }

        if (!tripData.trip.items || tripData.trip.items.length === 0) {
          const itemsRes = await fetch(`http://10.92.4.186:5001/api/items/${encodeURIComponent(tripData.trip.destination)}`);
          const itemSuggest = await itemsRes.json();
          const suggested = itemSuggest[0]?.items || [];
          const itemsWithQuantities = suggested.map((item: any) => ({
            name: item.name,
            quantity: item.quantity || (item.quantityPerPerson ? item.quantityPerPerson * tripData.trip.people : 1),
            price: 0
          }));

          setItems(itemsWithQuantities);

          await fetch('http://10.92.4.186:5001/api/trips/latest', {
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

        if (tripData.trip.customStops?.length > 0) {
          setSteps(tripData.trip.customStops);
        } else if (
          tripData.trip.roadTripId?.stops?.length > 0 ||
          roadTrip?.stops?.length > 0
        ) {
          const _stops =
            Array.isArray(tripData.trip.roadTripId?.stops)
              ? tripData.trip.roadTripId.stops
              : (Array.isArray(roadTrip?.stops) ? roadTrip.stops : []);
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

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

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

  const handleDeleteItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const saveBudget = async () => {
    const token = await AsyncStorage.getItem('token');
    await fetch('http://10.92.4.186:5001/api/trips/latest', {
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
    <ImageBackground source={bg} style={{ flex: 1 }} resizeMode="cover">
      {/* Le reste de ton contenu */}
      <View style={{ flex: 1 }}>
        {/* HEADER MODERNE */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "?"}</Text>
          </View>
          <Text style={styles.title}>Accueil</Text>
          <TouchableOpacity onPress={() => router.push('/pageProfil')}>
            <Text style={{ color: '#2ef48c', fontWeight: 'bold', fontSize: 18 }}>Profil</Text>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView
            style={{ padding: 18, paddingTop: 10 }}
            contentContainerStyle={{ paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* CARD PRINCIPALE */}
            <View style={styles.mainCard}>
              <Text style={styles.tripTitle}>Bienvenue, {user?.name} 👋</Text>
              <Text style={styles.tripSub}>Ton email : {user?.email}</Text>

              {trip ? (
                <>
                  <Text style={styles.tripTitle}>Ton dernier voyage : {trip.destination}</Text>
                  <Text style={styles.tripSub}>Pour {trip.people} personnes, {trip.days} jours</Text>

                  {roadTrip ? (
                    <View style={styles.roadTripBox}>
                      <Text style={styles.roadTripTitle}>
                        Road Trip : {roadTrip.name}
                      </Text>
                      <Text style={styles.roadTripDesc}>
                        {roadTrip.description}
                      </Text>
                      <Text style={{ color: "#bbb", fontWeight: "bold" }}>Étapes :</Text>
                      {steps?.length > 0 ? steps.map((s, idx) => (
                        <Text key={idx} style={styles.roadTripStep}>
                          - {s.name}
                        </Text>
                      )) : null}
                    </View>
                  ) : null}

                  <Text style={styles.sectionTitle}>Matériel à ramener :</Text>

                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary, { marginBottom: 8 }]}
                    activeOpacity={0.8}
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
                          value={item.quantity?.toString() || ''}
                          onChangeText={val => handleItemChange(idx, 'quantity', val)}
                        />
                        <TextInput
                          style={[styles.input, { flex: 1, marginRight: 4 }]}
                          placeholder="Prix €"
                          placeholderTextColor="#888"
                          keyboardType="numeric"
                          value={item.price?.toString() || ''}
                          onChangeText={val => handleItemChange(idx, 'price', val)}
                        />
                        <TouchableOpacity onPress={() => handleDeleteItem(idx)} style={{ padding: 4 }}>
                          <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 18 }}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.total}>Total : {total.toFixed(2)} €</Text>

                  <View style={styles.buttonSpacing}>
                    <TouchableOpacity style={[styles.button, styles.buttonPrimary]} activeOpacity={0.8} onPress={saveBudget}>
                      <Text style={styles.buttonText}>Sauvegarder le budget</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.buttonSpacing}>
                    <TouchableOpacity
                      style={[styles.button, styles.buttonSecondary]}
                      activeOpacity={0.8}
                      onPress={() => {
                        if (steps?.length > 0) {
                          router.push({
                            pathname: '/CarteRoadTrip',
                            params: { stopsJson: JSON.stringify(steps) },
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
                <Text style={{ color: '#fff', marginTop: 24, textAlign: 'center' }}>Aucun voyage planifié.</Text>
              )}
            </View>

            <View style={{ height: 24 }} />

            <View style={styles.buttonSpacing}>
              <TouchableOpacity style={[styles.button, styles.buttonPrimary]} activeOpacity={0.8} onPress={() => router.push('/planifier')}>
                <Text style={styles.buttonText}>Planifier un voyage</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              activeOpacity={0.8}
              onPress={async () => {
                await AsyncStorage.removeItem('token');
                router.replace('/login');
              }}
            >
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}