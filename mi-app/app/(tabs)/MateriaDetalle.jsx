// app/(tabs)/MateriaDetalle.jsx
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

const MateriaDetalle = () => {
  const router = useRouter();
  const { materiaId } = useLocalSearchParams();
  
  const [materia, setMateria] = useState(null);
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (materiaId) {
      fetchMateriaDetalle();
    }
  }, [materiaId]);

  const fetchMateriaDetalle = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📚 Cargando materia:', materiaId);

      // Obtener materia
      const materiaData = await api.getMateriaById(parseInt(materiaId));
      console.log('✅ Materia:', materiaData);
      setMateria(materiaData);

      // Obtener temas de la materia
      const temasData = await api.getTemasByMateria(parseInt(materiaId));
      console.log('✅ Temas:', temasData);
      
      // Ordenar temas por orden
      const temasOrdenados = temasData.sort((a, b) => a.orden - b.orden);
      setTemas(temasOrdenados);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error al cargar la materia:', err);
      setError('Error al cargar la información');
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar la materia');
    }
  };

  const handleVerSubtemas = (temaId) => {
    router.push(`/TemaDetalle?temaId=${temaId}`);
  };

  const getDificultadColor = (nivel) => {
    const colores = {
      BASICO: '#4CAF50',
      INTERMEDIO: '#FF9800',
      AVANZADO: '#F44336'
    };
    return colores[nivel] || '#757575';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando materia...</Text>
      </View>
    );
  }

  if (error || !materia) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'No se pudo cargar la materia'}</Text>
        <TouchableOpacity 
          style={styles.btnPrimary}
          onPress={() => router.back()}
        >
          <Text style={styles.btnPrimaryText}>← Volver al Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.materiaHeader}>
        <TouchableOpacity 
          style={styles.btnBack}
          onPress={() => router.back()}
        >
          <Text style={styles.btnBackText}>← Volver</Text>
        </TouchableOpacity>
        
        <View style={styles.materiaInfo}>
          <Text style={styles.materiaNombre}>{materia.nombre}</Text>
          <View style={styles.materiaMeta}>
            <View style={[
              styles.badgeNivel,
              { backgroundColor: getDificultadColor(materia.nivelDificultad) }
            ]}>
              <Text style={styles.badgeNivelText}>{materia.nivelDificultad}</Text>
            </View>
            <Text style={styles.materiaCodigo}>📚 {materia.codigo}</Text>
          </View>
          <Text style={styles.materiaDescripcion}>{materia.descripcion}</Text>
        </View>
      </View>

      {/* Lista de Temas */}
      <View style={styles.temasSection}>
        <Text style={styles.temasSectionTitle}>📖 Temas del Curso</Text>
        
        {temas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>😔 No hay temas disponibles para esta materia</Text>
          </View>
        ) : (
          <View style={styles.temasList}>
            {temas.map((tema) => (
              <View key={tema.id} style={styles.temaCard}>
                <View style={styles.temaHeader}>
                  <View style={styles.temaNumero}>
                    <Text style={styles.temaNumeroText}>{tema.orden}</Text>
                  </View>
                  <View style={styles.temaInfo}>
                    <Text style={styles.temaNombre}>{tema.nombre}</Text>
                    <Text style={styles.temaDescripcion}>{tema.descripcion}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.btnSubtemas}
                  onPress={() => handleVerSubtemas(tema.id)}
                >
                  <Text style={styles.btnSubtemasText}>Ver Subtemas →</Text>
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
  materiaHeader: {
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
  materiaInfo: {
    gap: 12,
  },
  materiaNombre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  materiaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  badgeNivel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeNivelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  materiaCodigo: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  materiaDescripcion: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  temasSection: {
    padding: 16,
  },
  temasSectionTitle: {
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
  temasList: {
    gap: 16,
  },
  temaCard: {
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
  temaHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  temaNumero: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  temaNumeroText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  temaInfo: {
    flex: 1,
  },
  temaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  temaDescripcion: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  btnSubtemas: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnSubtemasText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MateriaDetalle;