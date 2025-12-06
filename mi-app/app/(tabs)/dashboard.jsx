// app/(tabs)/dashboard.jsx
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../_context/AuthContext';
import { api } from '../services/api';

const Dashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMaterias();
  }, []);

  const loadMaterias = async () => {
    try {
      setLoading(true);
      const data = await api.getMaterias();
      setMaterias(data);
    } catch (err) {
      console.error('Error al cargar materias:', err);
      Alert.alert('Error', 'No se pudieron cargar las materias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMaterias();
  };

  const getDificultadColor = (nivel) => {
    const niveles = {
      'BASICO': '#4CAF50',
      'INTERMEDIO': '#FF9800',
      'AVANZADO': '#F44336',
    };
    return niveles[nivel] || '#757575';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando materias...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>¡Bienvenido, {user?.nombre}! 👋</Text>
        <Text style={styles.subtitle}>Selecciona una materia para comenzar a aprender</Text>
      </View>

      <View style={styles.materiasContainer}>
        {materias.map((materia) => (
          <TouchableOpacity
            key={materia.id}
            style={styles.materiaCard}
            onPress={() => router.push(`/MateriaDetalle?materiaId=${materia.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.materiaHeader}>
              <Text style={styles.materiaTitle}>{materia.nombre}</Text>
              <View style={[
                styles.nivelBadge, 
                { backgroundColor: getDificultadColor(materia.nivelDificultad) }
              ]}>
                <Text style={styles.nivelText}>{materia.nivelDificultad}</Text>
              </View>
            </View>

            <Text style={styles.materiaDescription}>{materia.descripcion}</Text>

            <View style={styles.materiaInfo}>
              <Text style={styles.materiaCodigo}>📚 {materia.codigo}</Text>
            </View>

            <View style={styles.btnMateria}>
              <Text style={styles.btnMateriaText}>Ver Temas →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {materias.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📚</Text>
          <Text style={styles.emptyTitle}>No hay materias disponibles</Text>
          <Text style={styles.emptySubtitle}>Contacta al administrador</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  materiasContainer: {
    padding: 16,
  },
  materiaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materiaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  nivelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  nivelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  materiaDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  materiaInfo: {
    marginBottom: 16,
  },
  materiaCodigo: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  btnMateria: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnMateriaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default Dashboard;