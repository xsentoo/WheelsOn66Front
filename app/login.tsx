import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuthRedirect } from '../hooks/useAuthRedirect'; // adapte le chemin si nécessaire
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export default function LoginScreen() {
  useAuthRedirect(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handleLogin = async () => {
  console.log('🟡 handleLogin lancé'); // ← ajoute ça en haut

  try {
    const res = await fetch('http://192.168.0.10:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log('🔵 Réponse serveur :', data); // ← ici

    if (!res.ok) throw new Error(data.message || 'Erreur');

    await AsyncStorage.setItem('token', data.token);
    Alert.alert('Connexion réussie ✅');
    router.replace('/home');
  } catch (err: any) {
    console.log('❌ Erreur dans handleLogin :', err); // ← ici
    Alert.alert('Erreur', err.message);
  }
};

  return (
    <View style={{ padding: 20, backgroundColor: '#000', flex: 1 }}>
      <Text style={{ color: '#fff', marginBottom: 6, fontSize: 16 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          marginBottom: 15,
          padding: 10,
          borderRadius: 6,
          backgroundColor: '#fff',
          color: '#000',
        }}
        autoCapitalize="none"
        placeholder="Votre email"
        placeholderTextColor="#999"
      />

      <Text style={{ color: '#fff', marginBottom: 6, fontSize: 16 }}>Mot de passe</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          marginBottom: 20,
          padding: 10,
          borderRadius: 6,
          backgroundColor: '#fff',
          color: '#000',
        }}
        placeholder="Votre mot de passe"
        placeholderTextColor="#999"
      />

      <Button title="Se connecter" onPress={handleLogin} />
      <View style={{ height: 10 }} />
      <Button title="Créer un compte" onPress={() => router.push('/register')} />
    </View>
  );
}