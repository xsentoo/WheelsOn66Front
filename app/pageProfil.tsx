import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground // Ajout ici
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { TextStyle } from 'react-native';
const bg = require('../assets/bg.jpg'); // Ajout ici

const styles = {
  background: {
    flex: 1,
    backgroundColor: '#0e1524',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 32, // même valeur que home
    paddingHorizontal: 24, // même valeur que home
    paddingBottom: 18,     // même valeur que home
    backgroundColor: 'rgba(30,44,80,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#232c4a',
    marginBottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  headerBack: {
    marginRight: 18,
    backgroundColor: '#222a36',
    borderRadius: 20,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold' as TextStyle['fontWeight'],
    fontSize: 22,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1a2335',
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#132040',
    shadowOpacity: 0.21,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: '#232c4a',
  },
  sectionTitle: {
    color: '#2ef48c',
    fontWeight: 'bold' as TextStyle['fontWeight'],
    fontSize: 18,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  label: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#232b3a',
    color: '#fff',
    borderRadius: 10,
    marginVertical: 4,
    padding: 12,
    fontSize: 16,
    borderWidth: 1.2,
    borderColor: '#273a5a',
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
    fontWeight: 'bold' as TextStyle['fontWeight'],
    fontSize: 17,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  tripCard: {
    backgroundColor: '#181f2a',
    borderRadius: 18,
    marginBottom: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 3,
  },
  tripTitle: {
    color: '#fff',
    fontWeight: 'bold' as TextStyle['fontWeight'],
    fontSize: 17,
    marginBottom: 2,
  },
  tripSub: {
    color: '#bbb',
    fontSize: 15,
  },
  tripLabel: {
    color: '#aaa',
    marginBottom: 5,
    fontSize: 14,
  },
  tripSection: {
    color: '#bbb',
    marginBottom: 3,
    fontWeight: 'bold' as TextStyle['fontWeight'],
    fontSize: 15,
  },
  tripStory: {
    color: '#fff',
    marginTop: 7,
    fontStyle: "italic" as TextStyle['fontStyle'],
    fontSize: 15,
  },
};

export default function PageProfil() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState({ old: '', new: '' });
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripStory, setTripStory] = useState('');
  const [savingStory, setSavingStory] = useState(false);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.92.4.186:5001/api/user/me', {
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

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleEditProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.92.4.186:5001/api/user/update', {
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
      const res = await fetch('http://10.92.4.186:5001/api/user/password', {
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
    if (!tripStory.trim()) {
      Alert.alert('Erreur', 'Le texte de l\'histoire ne peut pas être vide.');
      return;
    }
    setSavingStory(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('http://10.92.4.186:5001/api/trips/story', {
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
    } finally {
      setSavingStory(false);
    }
  };

  const handleDeleteTripStory = async (tripId: string) => {
    Alert.alert(
      'Confirmation',
      'Supprimer l’histoire de ce voyage ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive', onPress: async () => {
            setDeletingStoryId(tripId);
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch('http://10.92.4.186:5001/api/trips/story', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ tripId, story: '' }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || 'Erreur suppression histoire');
              Alert.alert('Succès', 'Histoire supprimée');
              setEditingTripId(null);
              setTripStory('');
              fetchProfile();
            } catch (err: any) {
              Alert.alert('Erreur', err.message);
            } finally {
              setDeletingStoryId(null);
            }
          }
        }
      ]
    );
  };

  const handleDeleteTrip = async (tripId: string) => {
    Alert.alert(
      'Supprimer ce voyage',
      'Confirmer la suppression définitive de ce voyage ? (Action irréversible)',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive', onPress: async () => {
            setDeletingTripId(tripId);
            try {
              const token = await AsyncStorage.getItem('token');
              const res = await fetch(`http://10.92.4.186:5001/api/trips/${tripId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              let data = null;
              try {
                data = await res.json();
              } catch {
                throw new Error("Erreur serveur : réponse inattendue ou non supportée.");
              }

              if (!res.ok) throw new Error(data?.message || 'Erreur suppression voyage');
              Alert.alert('Voyage supprimé', 'Ce voyage a bien été supprimé.');
              fetchProfile();
            } catch (err: any) {
              Alert.alert('Erreur', err.message);
            } finally {
              setDeletingTripId(null);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' }}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <ImageBackground source={bg} style={{ flex: 1 }} resizeMode="cover">
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
          {/* HEADER FIXE */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBack}
            >
              <Text style={{ color: '#27ae60', fontSize: 22, fontWeight: 'bold' }}>←</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
              <Text style={styles.headerTitle}>Profil</Text>
            </View>
            {/* Espaceur pour équilibrer la flèche */}
            <View style={{ width: 38 }} />
          </View>
          <ScrollView
            ref={scrollViewRef}
            style={{ padding: 18, paddingTop: 10 }}
            contentContainerStyle={{ paddingBottom: 60 }}
            scrollEventThrottle={16}
          >
            {/* PROFIL INFOS */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Mes infos</Text>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                placeholder="Nom"
                placeholderTextColor="#666"
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleEditProfile}
              >
                <Text style={styles.buttonText}>💾 Sauvegarder Profil</Text>
              </TouchableOpacity>
            </View>

            {/* CHANGER MOT DE PASSE */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Modifier mot de passe</Text>
              <TextInput
                placeholder="Ancien mot de passe"
                secureTextEntry
                value={editPassword.old}
                onChangeText={t => setEditPassword({ ...editPassword, old: t })}
                style={styles.input}
                placeholderTextColor="#666"
              />
              <TextInput
                placeholder="Nouveau mot de passe"
                secureTextEntry
                value={editPassword.new}
                onChangeText={t => setEditPassword({ ...editPassword, new: t })}
                style={styles.input}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleEditPassword}
              >
                <Text style={styles.buttonText}>🔑 Modifier mot de passe</Text>
              </TouchableOpacity>
            </View>

            {/* MES VOYAGES */}
            <Text style={styles.sectionTitle}>Mes voyages</Text>
            {trips.length === 0 && (
              <Text style={{ color: '#888', fontStyle: 'italic', marginBottom: 18 }}>Aucun voyage trouvé.</Text>
            )}
            {trips.map(trip => (
              <View
                key={trip._id}
                style={styles.tripCard}
              >
                <Text style={styles.tripTitle}>{trip.destination}</Text>
                <Text style={styles.tripSub}>
                  {trip.days} jours, {trip.people} personnes
                </Text>
                <Text style={styles.tripLabel}>Départ : {trip.departureCountry || 'NC'}</Text>
                <Text style={styles.tripSection}>Histoire :</Text>
                {editingTripId === trip._id ? (
                  <>
                    <TextInput
                      style={{ backgroundColor: '#232b3a', color: '#fff', borderRadius: 8, padding: 10, minHeight: 60, fontSize: 15 }}
                      multiline
                      value={tripStory}
                      onChangeText={setTripStory}
                      placeholder="Raconte ton road trip ici..."
                      placeholderTextColor="#666"
                    />
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#27ae60',
                        borderRadius: 8,
                        padding: 11,
                        marginTop: 7,
                        alignItems: 'center',
                        opacity: savingStory ? 0.7 : 1,
                      }}
                      disabled={savingStory}
                      onPress={() => handleEditTripStory(trip._id)}
                    >
                      <Text style={{ color: '#fff', fontSize: 15 }}>
                        {savingStory ? 'Enregistrement...' : 'Sauvegarder histoire'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: '#999', borderRadius: 8, padding: 11, marginTop: 7, alignItems: 'center' }}
                      onPress={() => { setEditingTripId(null); setTripStory(''); }}
                    >
                      <Text style={{ color: '#222', fontSize: 15 }}>Annuler</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => { setEditingTripId(trip._id); setTripStory(trip.story || ''); }}
                      style={{ backgroundColor: '#232b3a', borderRadius: 8, padding: 8, alignItems: 'center', marginTop: 3, marginBottom: 3 }}
                    >
                      <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 15 }}>{trip.story ? 'Modifier mon histoire' : 'Ajouter une histoire'}</Text>
                    </TouchableOpacity>
                    {trip.story && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#e74c3c',
                          borderRadius: 8,
                          padding: 9,
                          marginTop: 7,
                          alignItems: 'center',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          opacity: deletingStoryId === trip._id ? 0.5 : 1,
                        }}
                        disabled={deletingStoryId === trip._id}
                        onPress={() => handleDeleteTripStory(trip._id)}
                      >
                        <Text style={{ color: '#fff', marginRight: 6, fontSize: 17 }}>🗑️</Text>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                          {deletingStoryId === trip._id ? 'Suppression...' : "Supprimer l'histoire"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                {trip.story && editingTripId !== trip._id && (
                  <Text style={styles.tripStory}>{trip.story}</Text>
                )}
                {/* === SUPPRIMER LE VOYAGE === */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#b44',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    opacity: deletingTripId === trip._id ? 0.5 : 1,
                  }}
                  disabled={deletingTripId === trip._id}
                  onPress={() => handleDeleteTrip(trip._id)}
                >
                  <Text style={{ color: '#fff', marginRight: 6, fontSize: 17 }}>🗑️</Text>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>
                    {deletingTripId === trip._id ? 'Suppression...' : "Supprimer ce voyage"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* BOUTON DECONNEXION */}
            <TouchableOpacity
              style={{
                marginTop: 10,
                backgroundColor: '#b44',
                borderRadius: 8,
                padding: 13,
                alignItems: 'center',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.13,
                shadowRadius: 4,
                elevation: 2
              }}
              onPress={async () => {
                await AsyncStorage.removeItem('token');
                router.replace('/login');
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Se déconnecter</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* --- BOUTON RETOUR EN HAUT --- */}
          <TouchableOpacity
            onPress={scrollToTop}
            style={{
              position: 'absolute',
              right: 24,
              bottom: 40,
              backgroundColor: '#2ef48c',
              borderRadius: 30,
              width: 60,
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              elevation: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
            }}
            activeOpacity={0.88}
          >
            <Text style={{ color: "#fff", fontSize: 34, fontWeight: 'bold', lineHeight: 36 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}