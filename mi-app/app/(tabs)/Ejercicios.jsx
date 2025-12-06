// app/(tabs)/Ejercicios.jsx
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../services/api';

const Ejercicios = () => {
  const router = useRouter();
  const { subtemaId } = useLocalSearchParams();
  
  const [subtema, setSubtema] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subtemaId) {
      fetchEjercicios();
    }
  }, [subtemaId]);

  const fetchEjercicios = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('💪 Cargando ejercicios para subtema:', subtemaId);

      // Obtener subtema
      const subtemasData = await api.getSubtemas();
      const subtemaEncontrado = subtemasData.find(s => s.id === parseInt(subtemaId));
      setSubtema(subtemaEncontrado);

      // Obtener ejercicios del subtema
      const ejerciciosData = await api.getEjerciciosBySubtema(parseInt(subtemaId));
      console.log('✅ Ejercicios:', ejerciciosData);
      setEjercicios(ejerciciosData);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error al cargar ejercicios:', err);
      setError('Error al cargar los ejercicios');
      setLoading(false);
      Alert.alert('Error', 'No se pudieron cargar los ejercicios');
    }
  };

  const handleResolverEjercicio = (ejercicioId) => {
    router.push(`/ResolverEjercicio?ejercicioId=${ejercicioId}`);
  };

  const handleVolver = () => {
    router.back();
  };

  const getDificultadColor = (nivel) => {
    const colores = {
      'FACIL': '#10b981',
      'MEDIO': '#f59e0b',
      'DIFICIL': '#ef4444',
    };
    return colores[nivel] || '#64748b';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando ejercicios...</Text>
      </View>
    );
  }

  if (error || !subtema) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'No se pudieron cargar los ejercicios'}</Text>
        <TouchableOpacity 
          style={styles.btnPrimary}
          onPress={handleVolver}
        >
          <Text style={styles.btnPrimaryText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.btnBack}
          onPress={handleVolver}
        >
          <Text style={styles.btnBackText}>← Volver</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>💪 Ejercicios Prácticos</Text>
        <Text style={styles.subtitle}>{subtema.nombre}</Text>
        <Text style={styles.description}>
          Resuelve estos ejercicios y recibe retroalimentación de la IA
        </Text>
      </View>

      {/* Lista de Ejercicios */}
      <View style={styles.ejerciciosContainer}>
        {ejercicios.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>😔 No hay ejercicios disponibles</Text>
            <Text style={styles.emptySubtitle}>
              El administrador debe agregar ejercicios primero
            </Text>
          </View>
        ) : (
          ejercicios.map((ejercicio, index) => (
            <View key={ejercicio.id} style={styles.ejercicioCard}>
              <View style={styles.ejercicioHeader}>
                <View style={styles.ejercicioNumero}>
                  <Text style={styles.ejercicioNumeroText}>{index + 1}</Text>
                </View>
                <View style={[
                  styles.dificultadBadge,
                  { backgroundColor: getDificultadColor(ejercicio.nivelDificultad) }
                ]}>
                  <Text style={styles.dificultadText}>{ejercicio.nivelDificultad}</Text>
                </View>
              </View>

              <Text style={styles.ejercicioEnunciado}>{ejercicio.enunciado}</Text>
              
              {ejercicio.descripcion && (
                <Text style={styles.ejercicioDescripcion}>{ejercicio.descripcion}</Text>
              )}

              <TouchableOpacity 
                style={styles.btnResolver}
                onPress={() => handleResolverEjercicio(ejercicio.id)}
              >
                <Text style={styles.btnResolverText}>Resolver Ejercicios</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 24,
    textAlign: 'center',
  },
  btnPrimary: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  btnBack: {
    marginBottom: 16,
  },
  btnBackText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  ejerciciosContainer: {
    padding: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  ejercicioCard: {
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
  ejercicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ejercicioNumero: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ejercicioNumeroText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  dificultadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dificultadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ejercicioEnunciado: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    lineHeight: 24,
  },
  ejercicioDescripcion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  btnResolver: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnResolverText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Ejercicios;