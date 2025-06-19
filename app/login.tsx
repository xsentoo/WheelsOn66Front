import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthRedirect } from '../hooks/useAuthRedirect'; // adapte le chemin si nécessaire
import AsyncStorage from '@react-native-async-storage/async-storage';
import loginStyles from './loginStyles'; // adapte le chemin si besoin

export default function LoginScreen() {
  useAuthRedirect(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('🟡 handleLogin lancé');
    try {
      const res = await fetch('http://192.168.0.10:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('🔵 Réponse serveur :', data);

      if (!res.ok) throw new Error(data.message || 'Erreur');

      await AsyncStorage.setItem('token', data.token);
      Alert.alert('Connexion réussie ✅');
      router.replace('/home');
    } catch (err: any) {
      console.log('❌ Erreur dans handleLogin :', err);
      Alert.alert('Erreur', err.message);
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Connexion</Text>

      <Text style={loginStyles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={loginStyles.input}
        autoCapitalize="none"
        placeholder="Votre email"
        placeholderTextColor="#888"
      />

      <Text style={loginStyles.label}>Mot de passe</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={loginStyles.input}
        placeholder="Votre mot de passe"
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={loginStyles.button} onPress={handleLogin}>
        <Text style={loginStyles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={loginStyles.secondaryButton}
        onPress={() => router.push('/register')}
      >
        <Text style={loginStyles.secondaryButtonText}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
}