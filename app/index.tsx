// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import React from 'react';

export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#27ae60" />
    </View>
  );
}