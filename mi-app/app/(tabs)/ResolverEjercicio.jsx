// app/(tabs)/ResolverEjercicio.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../services/api';

const ResolverEjercicio = () => {
  const router = useRouter();
  const { ejercicioId } = useLocalSearchParams();
  const scrollViewRef = useRef(null);
  
  const [ejercicio, setEjercicio] = useState(null);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [evaluando, setEvaluando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ejercicioId) {
      fetchEjercicio();
    }
  }, [ejercicioId]);

  const fetchEjercicio = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Cargando ejercicio:', ejercicioId);

      const ejercicioData = await api.getEjercicio(parseInt(ejercicioId));
      console.log('✅ Ejercicio:', ejercicioData);
      setEjercicio(ejercicioData);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error al cargar ejercicio:', err);
      setError('Error al cargar el ejercicio');
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar el ejercicio');
    }
  };

  const handleEvaluar = async () => {
    if (!respuestaUsuario.trim()) {
      Alert.alert('Aviso', 'Por favor escribe tu solución');
      return;
    }

    try {
      setEvaluando(true);
      console.log('🤖 Evaluando ejercicio con IA...');

      const evaluacion = await api.evaluarEjercicio(
        parseInt(ejercicioId),
        respuestaUsuario
      );

      console.log('✅ Evaluación recibida:', evaluacion);
      
      // ✅ ADAPTACIÓN: El backend devuelve formato diferente
      const resultadoAdaptado = {
        // Mapear el estado a booleano
        esCorrecta: evaluacion.estado === 'CORRECTO',
        parcial: evaluacion.estado === 'PARCIALMENTE_CORRECTO',
        puntaje: evaluacion.puntaje,
        feedbackIA: evaluacion.retroalimentacionIA, // ← Cambio clave
        estado: evaluacion.estado,
      };

      setResultado(resultadoAdaptado);
      setEvaluando(false);

      // Scroll al resultado
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (err) {
      console.error('❌ Error al evaluar:', err);
      setEvaluando(false);
      Alert.alert('Error', 'No se pudo evaluar tu solución. Intenta de nuevo.');
    }
  };

  const handleLimpiar = () => {
    setRespuestaUsuario('');
    setResultado(null);
  };

  const handleVolver = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Cargando ejercicio...</Text>
      </View>
    );
  }

  if (error || !ejercicio) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'No se pudo cargar el ejercicio'}</Text>
        <TouchableOpacity 
          style={styles.btnPrimary}
          onPress={handleVolver}
        >
          <Text style={styles.btnPrimaryText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getDificultadColor = (nivel) => {
    const colores = {
      'FACIL': '#10b981',
      'MEDIO': '#f59e0b',
      'DIFICIL': '#ef4444',
    };
    return colores[nivel] || '#64748b';
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'CORRECTO': '#10b981',
      'PARCIALMENTE_CORRECTO': '#f59e0b',
      'INCORRECTO': '#ef4444',
    };
    return colores[estado] || '#64748b';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'CORRECTO': '✅ ¡Excelente!',
      'PARCIALMENTE_CORRECTO': '⚠️ Casi perfecto',
      'INCORRECTO': '❌ Necesita mejoras',
    };
    return textos[estado] || '📝 Resultado';
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.btnBack}
            onPress={handleVolver}
          >
            <Text style={styles.btnBackText}>← Volver</Text>
          </TouchableOpacity>
          
          <View style={[
            styles.dificultadBadge,
            { backgroundColor: getDificultadColor(ejercicio.nivelDificultad) }
          ]}>
            <Text style={styles.dificultadText}>{ejercicio.nivelDificultad}</Text>
          </View>
        </View>

        {/* Enunciado */}
        <View style={styles.enunciadoCard}>
          <Text style={styles.enunciadoTitle}>📝 Enunciado</Text>
          <Text style={styles.enunciadoTexto}>{ejercicio.enunciado}</Text>
          
          {ejercicio.descripcion && (
            <>
              <Text style={styles.descripcionTitle}>💡 Descripción</Text>
              <Text style={styles.descripcionTexto}>{ejercicio.descripcion}</Text>
            </>
          )}
        </View>

        {/* Input de código */}
        <View style={styles.editorCard}>
          <Text style={styles.editorTitle}>🖊️ Tu Solución</Text>
          <TextInput
            style={styles.codeInput}
            value={respuestaUsuario}
            onChangeText={setRespuestaUsuario}
            placeholder="Escribe tu código aquí..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            fontFamily={Platform.OS === 'ios' ? 'Menlo' : 'monospace'}
          />

          <View style={styles.botonesContainer}>
            <TouchableOpacity 
              style={styles.btnLimpiar}
              onPress={handleLimpiar}
            >
              <Text style={styles.btnLimpiarText}>🗑️ Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnEvaluar, evaluando && styles.btnEvaluarDisabled]}
              onPress={handleEvaluar}
              disabled={evaluando}
            >
              {evaluando ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={[styles.btnEvaluarText, { marginLeft: 8 }]}>Evaluando...</Text>
                </View>
              ) : (
                <Text style={styles.btnEvaluarText}>🤖 Evaluar con IA</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Resultado de IA */}
        {resultado && (
          <View style={[
            styles.resultadoCard,
            { borderColor: getEstadoColor(resultado.estado) }
          ]}>
            <Text style={[
              styles.resultadoTitle,
              { color: getEstadoColor(resultado.estado) }
            ]}>
              {getEstadoTexto(resultado.estado)}
            </Text>
            
            <View style={styles.puntajeContainer}>
              <Text style={styles.puntajeLabel}>Puntaje:</Text>
              <Text style={[
                styles.puntajeValor,
                { color: getEstadoColor(resultado.estado) }
              ]}>
                {resultado.puntaje}/100
              </Text>
            </View>

            <Text style={styles.feedbackTitle}>💬 Retroalimentación de la IA:</Text>
            <Text style={styles.feedbackTexto}>{resultado.feedbackIA}</Text>

            {resultado.esCorrecta && (
              <TouchableOpacity 
                style={styles.btnSiguiente}
                onPress={handleVolver}
              >
                <Text style={styles.btnSiguienteText}>✓ Continuar</Text>
              </TouchableOpacity>
            )}

            {resultado.parcial && (
              <TouchableOpacity 
                style={[styles.btnSiguiente, { backgroundColor: '#f59e0b' }]}
                onPress={() => {
                  setResultado(null);
                  setRespuestaUsuario('');
                }}
              >
                <Text style={styles.btnSiguienteText}>🔄 Intentar Mejorar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#8b5cf6',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  btnBack: {
    flex: 1,
  },
  btnBackText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  dificultadBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dificultadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  enunciadoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enunciadoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  enunciadoTexto: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 16,
  },
  descripcionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 8,
  },
  descripcionTexto: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  editorCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  codeInput: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    fontSize: 14,
    minHeight: 200,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 16,
  },
  botonesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  btnLimpiar: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnLimpiarText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  btnEvaluar: {
    flex: 2,
    backgroundColor: '#8b5cf6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnEvaluarDisabled: {
    opacity: 0.6,
  },
  btnEvaluarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultadoCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  resultadoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  puntajeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  puntajeLabel: {
    fontSize: 16,
    color: '#475569',
    marginRight: 8,
  },
  puntajeValor: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    marginTop: 8,
  },
  feedbackTexto: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  btnSiguiente: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  btnSiguienteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResolverEjercicio;