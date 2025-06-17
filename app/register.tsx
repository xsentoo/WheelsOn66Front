import React from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthRedirect } from '../hooks/useAuthRedirect'; //
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  useAuthRedirect(); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      const res = await fetch('http://192.168.0.10:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }), // ← ✅ envoyer le nom !
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur');

      await AsyncStorage.setItem('token', data.token || '');
      Alert.alert('Compte créé ✅');
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
    }
  };

  return (
    <View style={{ padding: 20, backgroundColor: '#000', flex: 1 }}>
      <Text style={{ color: '#fff', marginBottom: 6 }}>Nom</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ backgroundColor: '#fff', marginBottom: 10, padding: 10 }}
        placeholder="Votre nom"
      />

      <Text style={{ color: '#fff', marginBottom: 6 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        placeholder="Email"
        placeholderTextColor="#999"
        style={{ backgroundColor: '#fff', marginBottom: 10, padding: 10 }}
      />

      <Text style={{ color: '#fff', marginBottom: 6 }}>Mot de passe</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        style={{ backgroundColor: '#fff', marginBottom: 10, padding: 10 }}
      />

      <Button title="Créer un compte" onPress={handleRegister} />
      <View style={{ height: 10 }} />
      <Button title="Déjà inscrit ?" onPress={() => router.push('/login')} />
    </View>
  );
}