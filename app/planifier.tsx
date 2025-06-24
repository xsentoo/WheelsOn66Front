import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, Switch, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ImageBackground, StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bg = require('../assets/bg.jpg');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#0e1524',
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 0,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    flex: 1,
    marginLeft: 10,
  },
  mainCard: {
    backgroundColor: '#1a2335',
    borderRadius: 22,
    padding: 22,
    marginTop: 18,
    marginBottom: 18,
    shadowColor: '#132040',
    shadowOpacity: 0.21,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: '#232c4a',
  },
  title: {
    fontWeight: 'bold',
    color: '#2ef48c',
    fontSize: 22,
    marginBottom: 14,
    letterSpacing: 0.65,
    textAlign: 'center',
  },
  label: {
    color: '#2ef48c',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    marginTop: 12,
  },
  picker: {
    backgroundColor: '#232b3a',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1.2,
    borderColor: '#273a5a',
    color: '#fff',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#182135',
    color: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    padding: 12,
    fontSize: 17,
    borderWidth: 1.5,
    borderColor: '#273a5a',
    marginBottom: 10,
    textAlign: 'right',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
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
});

export default function PlanifierVoyage() {
  const router = useRouter();

  const [destination, setDestination] = useState('');
  const [jours, setJours] = useState('');
  const [personnes, setPersonnes] = useState('');
  const [louerVoiture, setLouerVoiture] = useState(false);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [roadTrips, setRoadTrips] = useState<any[]>([]);
  const [selectedRoadTrip, setSelectedRoadTrip] = useState('');

  // Chargement des destinations
  const fetchDestinations = async () => {
    try {
      const res = await fetch('http://10.92.4.186:5001/api/destinations');
      const data = await res.json();
      setDestinations(data);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les destinations');
    }
  };

  // Chargement des roadtrips selon destination
  const fetchRoadTrips = async (destName: string) => {
    if (!destName) {
      setRoadTrips([]);
      setSelectedRoadTrip('');
      return;
    }
    try {
      const res = await fetch(`http://10.92.4.186:5001/api/roadtrips?destination=${encodeURIComponent(destName)}`);
      const data = await res.json();
      setRoadTrips(data);
      setSelectedRoadTrip('');
    } catch {
      setRoadTrips([]);
      Alert.alert('Erreur', 'Impossible de charger les road trips');
    }
  };

  useEffect(() => { fetchDestinations(); }, []);
  useEffect(() => { fetchRoadTrips(destination); }, [destination]);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return Alert.alert('Erreur', 'Utilisateur non authentifié');
    }

    if (!destination || !jours || !personnes) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
    }

    const dataToSend = {
      destination,
      days: Number(jours),
      people: Number(personnes),
      rentCar: louerVoiture,
      roadTripId: selectedRoadTrip || null,
    };

    try {
      const res = await fetch('http://10.92.4.186:5001/api/trips/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur lors de la planification');

      Alert.alert('Succès', 'Voyage planifié avec succès');
      router.push('/home');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Erreur inconnue');
    }
  };

  return (
    <ImageBackground source={bg} style={styles.background} resizeMode="cover">
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#2ef48c', fontWeight: 'bold', fontSize: 22 }}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Planifier</Text>
          <View style={{ width: 38 }} />
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
            <View style={styles.mainCard}>
              <Text style={styles.title}>Planifier mon voyage</Text>

              <Text style={styles.label}>Choisissez une destination</Text>
              <View style={[styles.picker, { height: Platform.OS === 'ios' ? 180 : 50 }]}>
                <Picker
                  selectedValue={destination}
                  onValueChange={setDestination}
                  mode="dropdown"
                  style={{ color: '#fff' }}
                >
                  <Picker.Item label="-- Choisir --" value="" />
                  {destinations.map(d => (
                    <Picker.Item key={d._id} label={d.name} value={d.name} />
                  ))}
                </Picker>
              </View>

              {roadTrips.length > 0 ? (
                <>
                  <Text style={styles.label}>Choisissez un road trip</Text>
                  <View style={[styles.picker, { height: Platform.OS === 'ios' ? 180 : 50 }]}>
                    <Picker
                      selectedValue={selectedRoadTrip}
                      onValueChange={setSelectedRoadTrip}
                      mode="dropdown"
                      style={{ color: '#fff' }}
                    >
                      <Picker.Item label="-- Choisir --" value="" />
                      {roadTrips.map(rt => (
                        <Picker.Item key={rt._id} label={rt.name} value={rt._id} />
                      ))}
                    </Picker>
                  </View>
                </>
              ) : null}

              {selectedRoadTrip && roadTrips.length > 0 ? (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[styles.label, { fontStyle: 'italic' }]}>Résumé du road trip :</Text>
                  <Text style={{ color: '#ccc' }}>
                    {roadTrips.find(rt => rt._id === selectedRoadTrip)?.description || ''}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.label}>Nombre de jours</Text>
              <TextInput
                value={jours}
                onChangeText={text => setJours(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.input}
                placeholder="ex : 7"
                maxLength={2}
                placeholderTextColor="#888"
              />

              <Text style={styles.label}>Nombre de personnes</Text>
              <TextInput
                value={personnes}
                onChangeText={text => setPersonnes(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                style={styles.input}
                placeholder="ex : 4"
                maxLength={2}
                placeholderTextColor="#888"
              />

              <View style={styles.switchRow}>
                <Text style={styles.label}>Louer une voiture</Text>
                <Switch value={louerVoiture} onValueChange={setLouerVoiture} />
              </View>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                activeOpacity={0.8}
                onPress={handleSubmit}
              >
                <Text style={{ color: '#1a2335', fontWeight: 'bold', fontSize: 18 }}>Valider</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}