import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function PageProfil() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState({ old: '', new: '' });
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripStory, setTripStory] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://192.168.0.10:5001/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Impossible de charger le profil');
      const data = await res.json();
      setUser(data.user);
      setEditName(data.user.name);
      setEditEmail(data.user.email);
      setTrips(data.trips || []);
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleEditProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://192.168.0.10:5001/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur update');
      Alert.alert('Succès', 'Profil mis à jour');
      fetchProfile();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleEditPassword = async () => {
    if (!editPassword.old || !editPassword.new) {
      Alert.alert('Erreur', 'Champs requis');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://192.168.0.10:5001/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: editPassword.old, newPassword: editPassword.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur mot de passe');
      Alert.alert('Succès', 'Mot de passe modifié');
      setEditPassword({ old: '', new: '' });
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  const handleEditTripStory = async (tripId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://192.168.0.10:5001/api/trips/story', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tripId, story: tripStory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur sauvegarde histoire');
      Alert.alert('Succès', 'Histoire enregistrée');
      setEditingTripId(null);
      setTripStory('');
      fetchProfile();
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' }}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#10151e' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={{ padding: 18 }}>
        <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 24, marginBottom: 14 }}>Profil</Text>
        <Text style={{ color: '#aaa', fontSize: 16 }}>Nom</Text>
        <TextInput
          value={editName}
          onChangeText={setEditName}
          style={{
            backgroundColor: '#222', color: '#fff', borderRadius: 6, marginVertical: 4, padding: 10
          }}
        />
        <Text style={{ color: '#aaa', fontSize: 16 }}>Email</Text>
        <TextInput
          value={editEmail}
          onChangeText={setEditEmail}
          style={{
            backgroundColor: '#222', color: '#fff', borderRadius: 6, marginVertical: 4, padding: 10
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#27ae60', padding: 12, borderRadius: 8,
            alignItems: 'center', marginVertical: 8
          }}
          onPress={handleEditProfile}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sauvegarder Profil</Text>
        </TouchableOpacity>

        <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 18, marginVertical: 18 }}>Modifier mot de passe</Text>
        <TextInput
          placeholder="Ancien mot de passe"
          secureTextEntry
          value={editPassword.old}
          onChangeText={t => setEditPassword({ ...editPassword, old: t })}
          style={{ backgroundColor: '#222', color: '#fff', borderRadius: 6, marginVertical: 4, padding: 10 }}
        />
        <TextInput
          placeholder="Nouveau mot de passe"
          secureTextEntry
          value={editPassword.new}
          onChangeText={t => setEditPassword({ ...editPassword, new: t })}
          style={{ backgroundColor: '#222', color: '#fff', borderRadius: 6, marginVertical: 4, padding: 10 }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#27ae60', padding: 12, borderRadius: 8,
            alignItems: 'center', marginVertical: 8
          }}
          onPress={handleEditPassword}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Modifier mot de passe</Text>
        </TouchableOpacity>

        <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 18, marginVertical: 18 }}>Mes voyages</Text>
        {trips.length === 0 && (
          <Text style={{ color: '#888', fontStyle: 'italic' }}>Aucun voyage trouvé.</Text>
        )}
        {trips.map(trip => (
          <View
            key={trip._id}
            style={{
              backgroundColor: '#222', borderRadius: 10, marginBottom: 14, padding: 10
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{trip.destination}</Text>
            <Text style={{ color: '#bbb' }}>
              {trip.days} jours, {trip.people} personnes
            </Text>
            <Text style={{ color: '#aaa', marginBottom: 5 }}>Départ : {trip.departureCountry || 'NC'}</Text>
            <Text style={{ color: '#bbb', marginBottom: 3 }}>Histoire :</Text>
            {editingTripId === trip._id ? (
              <>
                <TextInput
                  style={{ backgroundColor: '#111', color: '#fff', borderRadius: 6, padding: 8, minHeight: 60 }}
                  multiline
                  value={tripStory}
                  onChangeText={setTripStory}
                  placeholder="Raconte ton road trip ici..."
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={{ backgroundColor: '#27ae60', borderRadius: 6, padding: 10, marginTop: 5, alignItems: 'center' }}
                  onPress={() => handleEditTripStory(trip._id)}
                >
                  <Text style={{ color: '#fff' }}>Sauvegarder histoire</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ backgroundColor: '#999', borderRadius: 6, padding: 10, marginTop: 5, alignItems: 'center' }}
                  onPress={() => { setEditingTripId(null); setTripStory(''); }}
                >
                  <Text style={{ color: '#222' }}>Annuler</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditingTripId(trip._id); setTripStory(trip.story || ''); }}
                style={{ backgroundColor: '#444', borderRadius: 6, padding: 7, alignItems: 'center', marginTop: 3 }}
              >
                <Text style={{ color: '#fff' }}>{trip.story ? 'Modifier mon histoire' : 'Ajouter une histoire'}</Text>
              </TouchableOpacity>
            )}
            {trip.story && editingTripId !== trip._id && (
              <Text style={{ color: '#fff', marginTop: 7, fontStyle: 'italic' }}>{trip.story}</Text>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={{
            marginTop: 32, backgroundColor: '#b44', borderRadius: 8, padding: 12, alignItems: 'center'
          }}
          onPress={async () => {
            await AsyncStorage.removeItem('token');
            router.replace('/login');
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}