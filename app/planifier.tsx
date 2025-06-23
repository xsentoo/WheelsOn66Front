import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, Switch, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import planifierStyles from './planifierStyles';

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
      console.log("❌ Aucun token trouvé");
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

    console.log("📦 Données envoyées à /api/trips/plan :", dataToSend);

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
      console.log("✅ Réponse reçue :", data);

      if (!res.ok) throw new Error(data.message || 'Erreur lors de la planification');

      Alert.alert('Succès', 'Voyage planifié avec succès');
      router.push('/home');
    } catch (err: any) {
      console.log("❌ Erreur dans le fetch /trips/plan :", err);
      Alert.alert('Erreur', err.message || 'Erreur inconnue');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0e1524' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={planifierStyles.container} keyboardShouldPersistTaps="handled">

        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 14, marginTop: 6, alignSelf: 'flex-start', padding: 4 }}>
          <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 16 }}>{'< Retour'}</Text>
        </TouchableOpacity>

        <Text style={planifierStyles.title}>Planifier mon voyage</Text>

        <Text style={planifierStyles.label}>Choisissez une destination</Text>
        <View style={[planifierStyles.picker, { height: Platform.OS === 'ios' ? 180 : 50 }]}>
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

        {roadTrips.length > 0 && (
          <>
            <Text style={planifierStyles.label}>Choisissez un road trip</Text>
            <View style={[planifierStyles.picker, { height: Platform.OS === 'ios' ? 180 : 50 }]}>
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
        )}

        {selectedRoadTrip && roadTrips.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={[planifierStyles.label, { fontStyle: 'italic' }]}>Résumé du road trip :</Text>
            <Text style={{ color: '#ccc' }}>
              {roadTrips.find(rt => rt._id === selectedRoadTrip)?.description || ''}
            </Text>
          </View>
        )}

        <Text style={planifierStyles.label}>Nombre de jours</Text>
        <TextInput
          value={jours}
          onChangeText={text => setJours(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          style={planifierStyles.input}
          placeholder="ex : 7"
          maxLength={2}
          placeholderTextColor="#888"
        />

        <Text style={planifierStyles.label}>Nombre de personnes</Text>
        <TextInput
          value={personnes}
          onChangeText={text => setPersonnes(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          style={planifierStyles.input}
          placeholder="ex : 4"
          maxLength={2}
          placeholderTextColor="#888"
        />

        <View style={planifierStyles.switchRow}>
          <Text style={planifierStyles.label}>Louer une voiture</Text>
          <Switch value={louerVoiture} onValueChange={setLouerVoiture} />
        </View>

        <Button title="Valider" onPress={handleSubmit} color="#27ae60" />
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}