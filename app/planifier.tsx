import React, { useEffect, useState } from 'react';
import { View, Text, Button, Switch, ScrollView, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import planifierStyles from './planifierStyles'; // adapte le chemin
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PlanifierVoyage() {
  const router = useRouter();

  const [destination, setDestination] = useState('');
  const [jours, setJours] = useState('');
  const [personnes, setPersonnes] = useState('');
  const [louerVoiture, setLouerVoiture] = useState(false);
  const [paysDepart, setPaysDepart] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);

  const fetchDestinations = async () => {
    try {
      const res = await fetch('http://192.168.0.10:5001/api/destinations');
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les destinations');
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return Alert.alert('Erreur', 'Utilisateur non authentifié');

    try {
      const res = await fetch('http://192.168.0.10:5001/api/trips/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination,
          days: Number(jours),
          people: Number(personnes),
          rentCar: louerVoiture,
          departure: paysDepart,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');

      Alert.alert('Succès', 'Voyage planifié avec succès');
      router.push('/home');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={planifierStyles.container}>
      <Text style={planifierStyles.title}>Planifier mon voyage</Text>

      <Text style={planifierStyles.label}>Choisissez une destination</Text>
      <Picker
        selectedValue={destination}
        onValueChange={(value: string) => setDestination(value)}
        style={{
          color: '#fff',
          backgroundColor: '#1a2335',
          borderRadius: 10,
          height: 45,
          paddingLeft: 8,
          marginBottom: 12,
        }}
      >
        <Picker.Item label="-- Choisir --" value="" />
        {destinations.map((d) => (
          <Picker.Item key={d._id} label={d.name} value={d.name} />
        ))}
      </Picker>

      <Text style={planifierStyles.label}>Nombre de jours</Text>
      <TextInput
        value={jours}
        onChangeText={text => {
          // Empêche les caractères non numériques
          const onlyNumbers = text.replace(/[^0-9]/g, '');
          setJours(onlyNumbers);
        }}
        keyboardType="numeric"
        style={planifierStyles.input}
        placeholder="ex : 7"
        maxLength={2}
      />

      <Text style={planifierStyles.label}>Nombre de personnes</Text>
      <TextInput
        value={personnes}
        onChangeText={text => {
          const onlyNumbers = text.replace(/[^0-9]/g, '');
          setPersonnes(onlyNumbers);
        }}
        keyboardType="numeric"
        style={planifierStyles.input}
        placeholder="ex : 4"
        maxLength={2}
      />

      <View style={planifierStyles.switchRow}>
        <Text style={planifierStyles.label}>Louer une voiture</Text>
        <Switch value={louerVoiture} onValueChange={setLouerVoiture} />
      </View>

      <Text style={planifierStyles.label}>Pays ou aéroport de départ</Text>
      <TextInput
        value={paysDepart}
        onChangeText={setPaysDepart}
        style={planifierStyles.input}
      />

      <Button title="Valider" onPress={handleSubmit} color="#27ae60" />
    </ScrollView>
  );
}