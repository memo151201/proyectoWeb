// app/(tabs)/perfil.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../_context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={80} color="#3b82f6" />
        <Text style={styles.name}>{user?.nombre} {user?.apellido}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.rolBadge}>
          <Text style={styles.rolText}>{user?.rol}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 32, alignItems: 'center', marginTop: 40, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1e293b', marginTop: 16 },
  email: { fontSize: 14, color: '#64748b', marginTop: 4 },
  rolBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  rolText: { color: '#1e40af', fontSize: 12, fontWeight: '600' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', margin: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444', marginLeft: 12 },
});