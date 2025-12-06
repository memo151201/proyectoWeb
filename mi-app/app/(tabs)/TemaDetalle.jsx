// app/(tabs)/TemaDetalle.jsx
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

const TemaDetalle = () => {
  const router = useRouter();
  const { temaId } = useLocalSearchParams();
  
  const [tema, setTema] = useState(null);
  const [subtemas, setSubtemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (temaId) {
      fetchTemaDetalle();
    }
  }, [temaId]);

  const fetchTemaDetalle = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📖 Cargando tema:', temaId);

      // Obtener tema (primero necesitamos el método en api.ts)
      const temaData = await api.getTemas();
      const temaEncontrado = temaData.find(t => t.id === parseInt(temaId));
      console.log('✅ Tema:', temaEncontrado);
      setTema(temaEncontrado);

      // Obtener subtemas del tema
      const subtemasData = await api.getSubtemasByTema(parseInt(temaId));
      console.log('✅ Subtemas:', subtemasData);
      
      // Ordenar subtemas por orden
      const subtemasOrdenados = subtemasData.sort((a, b) => a.orden - b.orden);
      setSubtemas(subtemasOrdenados);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error al cargar el tema:', err);
      setError('Error al cargar la información');
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar el tema');
    }
  };

  const handleEstudiar = (subtemaId) => {
    router.push(`/EstudiarSubtema?subtemaId=${subtemaId}`);
  };

  const handleVolver = () => {
    if (tema && tema.materia) {
      router.push(`/MateriaDetalle?materiaId=${tema.materia.id}`);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando tema...</Text>
      </View>
    );
  }

  if (error || !tema) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'No se pudo cargar el tema'}</Text>
        <TouchableOpacity 
          style={styles.btnPrimary}
          onPress={() => router.back()}
        >
          <Text style={styles.btnPrimaryText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.temaHeader}>
        <TouchableOpacity 
          style={styles.btnBack}
          onPress={handleVolver}
        >
          <Text style={styles.btnBackText}>← Volver</Text>
        </TouchableOpacity>
        
        <View style={styles.temaInfo}>
          <Text style={styles.temaNombre}>{tema.nombre}</Text>
          {tema.materia && (
            <Text style={styles.temaMateria}>📚 {tema.materia.nombre}</Text>
          )}
          <Text style={styles.temaDescripcion}>{tema.descripcion}</Text>
        </View>
      </View>

      {/* Subtemas */}
      <View style={styles.subtemasSection}>
        <Text style={styles.subtemasSectionTitle}>📝 Subtemas</Text>
        
        {subtemas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>😔 No hay subtemas disponibles para este tema</Text>
          </View>
        ) : (
          <View style={styles.subtemasGrid}>
            {subtemas.map((subtema) => (
              <View key={subtema.id} style={styles.subtemaCard}>
                <View style={styles.subtemaBadge}>
                  <Text style={styles.subtemaBadgeText}>{subtema.orden}</Text>
                </View>
                
                <Text style={styles.subtemaNombre}>{subtema.nombre}</Text>
                <Text style={styles.subtemaDescripcion}>{subtema.descripcion}</Text>
                
                {subtema.contenido && (
                  <View style={styles.subtemaContenido}>
                    <Text style={styles.subtemaContenidoText}>
                      {subtema.contenido.substring(0, 150)}...
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.btnCuestionario}
                  onPress={() => handleEstudiar(subtema.id)}
                >
                  <Text style={styles.btnCuestionarioText}>Ver Contenido</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  temaHeader: {
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
  temaInfo: {
    gap: 8,
  },
  temaNombre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  temaMateria: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  temaDescripcion: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  subtemasSection: {
    padding: 16,
  },
  subtemasSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  subtemasGrid: {
    gap: 16,
  },
  subtemaCard: {
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
  subtemaBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtemaBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  subtemaNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtemaDescripcion: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  subtemaContenido: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  subtemaContenidoText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  btnCuestionario: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCuestionarioText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TemaDetalle;