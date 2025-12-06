// app/(tabs)/EstudiarSubtema.jsx
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

const EstudiarSubtema = () => {
  const router = useRouter();
  const { subtemaId } = useLocalSearchParams();
  
  const [subtema, setSubtema] = useState(null);
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subtemaId) {
      fetchSubtemaYContenidos();
    }
  }, [subtemaId]);

  const fetchSubtemaYContenidos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📚 Cargando subtema:', subtemaId);

      // Obtener subtema
      const subtemasData = await api.getSubtemas();
      const subtemaEncontrado = subtemasData.find(s => s.id === parseInt(subtemaId));
      console.log('✅ Subtema:', subtemaEncontrado);
      setSubtema(subtemaEncontrado);

      // Obtener contenidos del subtema
      const contenidosData = await api.getContenidosBySubtema(parseInt(subtemaId));
      console.log('✅ Contenidos:', contenidosData);
      setContenidos(contenidosData);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error al cargar subtema:', err);
      setError('Error al cargar el contenido');
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar el contenido');
    }
  };

  const handleGenerarYResolver = () => {
    if (contenidos.length === 0) {
      Alert.alert('Aviso', 'No hay contenidos disponibles para generar preguntas.');
      return;
    }

    Alert.alert(
      'Generar Cuestionario',
      '¿Generar 5 preguntas con IA basadas en este contenido? Esto puede tardar ~10 segundos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Generar', 
          onPress: async () => {
            try {
              setLoading(true);
              
              console.log('🤖 Generando preguntas con IA para subtema:', subtemaId);
              
              const response = await api.generarPreguntasIA(parseInt(subtemaId));
              console.log('✅ Preguntas generadas:', response);
              
              setLoading(false);
              router.push(`/Cuestionario?subtemaId=${subtemaId}`);
              
            } catch (error) {
              console.error('❌ Error al generar preguntas:', error);
              setLoading(false);
              Alert.alert('Error', 'Error al generar preguntas con IA. Por favor intenta de nuevo.');
            }
          }
        }
      ]
    );
  };

  const handleVolver = () => {
    if (subtema && subtema.tema) {
      router.push(`/TemaDetalle?temaId=${subtema.tema.id}`);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando contenido...</Text>
      </View>
    );
  }

  if (error || !subtema) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'No se pudo cargar el contenido'}</Text>
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
      <View style={styles.estudiarHeader}>
        <TouchableOpacity 
          style={styles.btnBack}
          onPress={handleVolver}
        >
          <Text style={styles.btnBackText}>← Volver</Text>
        </TouchableOpacity>
        
        <View style={styles.estudiarInfo}>
          <Text style={styles.estudiarNombre}>📚 {subtema.nombre}</Text>
          {subtema.tema && (
            <Text style={styles.estudiarTema}>Tema: {subtema.tema.nombre}</Text>
          )}
          {subtema.descripcion && (
            <Text style={styles.estudiarDescripcion}>{subtema.descripcion}</Text>
          )}
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.estudiarContent}>
        {contenidos.length > 0 ? (
          <View style={styles.contenidosLista}>
            <Text style={styles.contenidosTitle}>📖 Contenido del Tema</Text>
            {contenidos.map((contenido, index) => (
              <View key={contenido.id} style={styles.contenidoCard}>
                <View style={styles.contenidoHeader}>
                  <View style={styles.contenidoNumero}>
                    <Text style={styles.contenidoNumeroText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.contenidoTitulo}>{contenido.titulo}</Text>
                  <View style={[
                    styles.contenidoTipo,
                    { backgroundColor: contenido.tipo === 'CODIGO' ? '#dbeafe' : '#fef3c7' }
                  ]}>
                    <Text style={[
                      styles.contenidoTipoText,
                      { color: contenido.tipo === 'CODIGO' ? '#1e40af' : '#92400e' }
                    ]}>
                      {contenido.tipo}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.contenidoCuerpo}>
                  {contenido.tipo === 'CODIGO' ? (
                    <View style={styles.codigoContainer}>
                      <Text style={styles.codigoText}>{contenido.cuerpo}</Text>
                    </View>
                  ) : (
                    <Text style={styles.contenidoTexto}>{contenido.cuerpo}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.contenidoCardEmpty}>
            <Text style={styles.emptyTitle}>😔 Este subtema aún no tiene contenidos.</Text>
            <Text style={styles.emptySubtitle}>
              El administrador debe agregar contenidos desde el panel de administración.
            </Text>
          </View>
        )}

        {/* Cuestionario */}
        <View style={styles.cuestionarioSection}>
          <Text style={styles.cuestionarioTitle}>🎯 Pon a Prueba lo Aprendido</Text>
          
          {contenidos.length > 0 ? (
            <>
              <Text style={styles.cuestionarioDesc}>
                Genera un cuestionario personalizado basado en este contenido
              </Text>
              
              <TouchableOpacity 
                style={styles.btnCuestionarioIA}
                onPress={handleGenerarYResolver}
              >
                <Text style={styles.btnCuestionarioIAText}>🤖 Generar Cuestionario con IA</Text>
              </TouchableOpacity>
              
              <Text style={styles.notaIA}>
                ⏳ La IA generará 5 preguntas únicas basadas en el contenido (~10 segundos)
              </Text>
                {/* Separador */}
              <View style={styles.separador} />
               {/* Botón de Ejercicios */}
              <Text style={styles.ejerciciosDesc}>
                Resuelve ejercicios prácticos y recibe retroalimentación de la IA
              </Text>
              
              <TouchableOpacity 
                style={styles.btnEjercicios}
                onPress={() => router.push(`/Ejercicios?subtemaId=${subtemaId}`)}
              >
                <Text style={styles.btnEjerciciosText}>💪 Ver Ejercicios Prácticos</Text>
              </TouchableOpacity>
            </>
          
          ) : (
            <Text style={styles.advertencia}>
              ⚠️ Este subtema aún no tiene contenidos
            </Text>
          )}
        </View>
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
  estudiarHeader: {
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
  estudiarInfo: {
    gap: 8,
  },
  estudiarNombre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  estudiarTema: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  estudiarDescripcion: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  estudiarContent: {
    padding: 16,
  },
  contenidosLista: {
    marginBottom: 24,
  },
  contenidosTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  contenidoCard: {
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
  contenidoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  contenidoNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contenidoNumeroText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  contenidoTitulo: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  contenidoTipo: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contenidoTipoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contenidoCuerpo: {
    marginTop: 12,
  },
  codigoContainer: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 8,
  },
  codigoText: {
    fontFamily: 'monospace',
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  contenidoTexto: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  contenidoCardEmpty: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
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

  // ✅ NUEVOS ESTILOS PARA EJERCICIOS
  separador: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 24,
  },
  ejerciciosDesc: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 22,
  },
  btnEjercicios: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnEjerciciosText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  advertencia: {
    fontSize: 16,
    color: '#f59e0b',
    textAlign: 'center',
    paddingVertical: 16,
     },
  cuestionarioSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cuestionarioTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  cuestionarioDesc: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  btnCuestionarioIA: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnCuestionarioIAText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notaIA: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  advertencia: {
    fontSize: 16,
    color: '#f59e0b',
    textAlign: 'center',
    paddingVertical: 16,
  },
  
});

export default EstudiarSubtema;