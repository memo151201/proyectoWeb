// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colorScheme === 'dark' ? '#60a5fa' : '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#334155' : '#e2e8f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {/* ========== TABS VISIBLES ========== */}
      
      {/* Tab 1: Dashboard */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Tab 2: Estadísticas - NUEVO ✅ */}
      <Tabs.Screen
        name="Estadisticas"
        options={{
          title: 'Estadísticas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      {/* Tab 3: Perfil */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* ========== PANTALLAS OCULTAS (no aparecen en tabs) ========== */}
      
      <Tabs.Screen
        name="MateriaDetalle"
        options={{ href: null }}
      />
      
      <Tabs.Screen
        name="TemaDetalle"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="EstudiarSubtema"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="Cuestionario"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="CuestionarioIA"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="Ejercicios"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="ResolverEjercicio"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="modal"
        options={{ href: null }}
      />
    </Tabs>
  );
}
