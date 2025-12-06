// app/(tabs)/Cuestionario.jsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ← AGREGADO
import { api } from '../services/api';

export default function CuestionarioScreen() {
  const { subtemaId } = useLocalSearchParams();
  const router = useRouter();

  const [subtema, setSubtema] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [respondida, setRespondida] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState(false);
  const [respuestasGuardadas, setRespuestasGuardadas] = useState([]);
  const [cuestionarioCompletado, setCuestionarioCompletado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (subtemaId) {
      fetchCuestionario();
    }
  }, [subtemaId]);

  const fetchCuestionario = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Cargando cuestionario para subtema:', subtemaId);

      // Obtener subtema
      const subtemasData = await api.getSubtemas();
      const subtemaEncontrado = subtemasData.find(s => s.id === parseInt(subtemaId));
      setSubtema(subtemaEncontrado);

      // Obtener preguntas del subtema
      const preguntasData = await api.getPreguntasBySubtema(parseInt(subtemaId));
      console.log('✅ Preguntas:', preguntasData);

      // Mezclar y tomar 5 aleatorias
      const mezcladas = preguntasData.sort(() => Math.random() - 0.5).slice(0, 5);
      setPreguntas(mezcladas);

      setLoading(false);
    } catch (err) {
      console.error('❌ Error al cargar cuestionario:', err);
      setError('Error al cargar el cuestionario');
      setLoading(false);
      Alert.alert('Error', 'No se pudo cargar el cuestionario');
    }
  };

  const handleVolver = () => {
    router.back();
  };

  const handleSeleccionarRespuesta = (letra) => {
    if (!respondida) {
      setRespuestaSeleccionada(letra);
    }
  };

  const handleResponder = async () => {
    if (!respuestaSeleccionada) {
      Alert.alert('Aviso', 'Por favor selecciona una respuesta');
      return;
    }

    const pregunta = preguntas[preguntaActual];
    const correcta = respuestaSeleccionada === pregunta.respuestaCorrecta;
    setEsCorrecta(correcta);
    setRespondida(true);

    setRespuestasGuardadas((prev) => [
      ...prev,
      {
        pregunta: pregunta.enunciado,
        respuestaUsuario: respuestaSeleccionada,
        correcta,
        explicacion: pregunta.explicacion,
      },
    ]);
  };

  const handleSiguiente = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual((prev) => prev + 1);
      setRespuestaSeleccionada(null);
      setRespondida(false);
      setEsCorrecta(false);
    } else {
      setCuestionarioCompletado(true);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual((prev) => prev - 1);
      setRespuestaSeleccionada(null);
      setRespondida(false);
      setEsCorrecta(false);
    }
  };

  const calcularPuntaje = () => {
    const correctas = respuestasGuardadas.filter((r) => r.correcta).length;
    const total = respuestasGuardadas.length;
    const porcentaje = total > 0 ? Math.round((correctas / total) * 100) : 0;
    return { correctas, total, porcentaje };
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando cuestionario...</Text>
      </View>
    );
  }

  if (error || !subtema) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error || 'No se pudo cargar el cuestionario'}</Text>
        <TouchableOpacity onPress={handleVolver} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (preguntas.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>😔 No hay preguntas disponibles</Text>
        <Text style={styles.subtitleText}>El administrador debe agregar preguntas primero</Text>
        <TouchableOpacity onPress={handleVolver} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cuestionarioCompletado) {
    const { correctas, total, porcentaje } = calcularPuntaje();
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>🎉 ¡Cuestionario Completado!</Text>

          <Text style={styles.porcentaje}>{porcentaje}%</Text>
          <Text style={styles.subtitleText}>Tu puntaje</Text>

          <View style={styles.statsRow}>
            <View style={[styles.statItem, { backgroundColor: '#d1fae5' }]}>
              <Text style={styles.statNum}>{correctas}</Text>
              <Text>Correctas</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#fee2e2' }]}>
              <Text style={styles.statNum}>{total - correctas}</Text>
              <Text>Incorrectas</Text>
            </View>
            <View style={[styles.statItem, { backgroundColor: '#e0e7ff' }]}>
              <Text style={styles.statNum}>{total}</Text>
              <Text>Total</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleVolver} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const pregunta = preguntas[preguntaActual];
  const opciones = [
    { letra: 'A', texto: pregunta.opcionA },
    { letra: 'B', texto: pregunta.opcionB },
    { letra: 'C', texto: pregunta.opcionC },
    { letra: 'D', texto: pregunta.opcionD },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <TouchableOpacity onPress={handleVolver} style={styles.backBtn}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{subtema.nombre}</Text>
        <Text style={styles.progreso}>
          Pregunta {preguntaActual + 1} de {preguntas.length}
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((preguntaActual + 1) / preguntas.length) * 100}%`,
            },
          ]}
        />
      </View>

      <View style={styles.preguntaCard}>
        <Text style={styles.preguntaTexto}>{pregunta.enunciado}</Text>

        {opciones.map((op) => {
          const isSelected = respuestaSeleccionada === op.letra;
          const isCorrect = respondida && op.letra === pregunta.respuestaCorrecta;
          const isIncorrect = respondida && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={op.letra}
              style={[
                styles.opcion,
                isSelected && styles.opcionSeleccionada,
                isCorrect && styles.opcionCorrecta,
                isIncorrect && styles.opcionIncorrecta,
              ]}
              onPress={() => handleSeleccionarRespuesta(op.letra)}
              disabled={respondida}
            >
              <View style={styles.opcionLetra}>
                <Text style={styles.opcionLetraText}>{op.letra}</Text>
              </View>
              <Text style={styles.opcionTexto}>{op.texto}</Text>
            </TouchableOpacity>
          );
        })}

        {respondida && (
          <View
            style={[
              styles.feedback,
              esCorrecta ? styles.feedbackOk : styles.feedbackBad,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {esCorrecta ? '✅ ¡Correcto!' : '❌ Incorrecto'}
            </Text>
            {pregunta.explicacion && (
              <Text style={styles.feedbackText}>{pregunta.explicacion}</Text>
            )}
          </View>
        )}

        <View style={styles.navRow}>
          {!respondida ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleResponder}>
              <Text style={styles.primaryBtnText}>Responder</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.navBtn, { opacity: preguntaActual === 0 ? 0.4 : 1 }]}
                onPress={handleAnterior}
                disabled={preguntaActual === 0}
              >
                <Text style={styles.navBtnText}>← Anterior</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleSiguiente}>
                <Text style={styles.primaryBtnText}>
                  {preguntaActual < preguntas.length - 1 ? 'Siguiente →' : 'Finalizar'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerContent: { flexGrow: 1, justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#64748b' },
  errorText: { fontSize: 16, color: '#ef4444', textAlign: 'center', marginBottom: 8 },
  subtitleText: { fontSize: 14, color: '#64748b', marginBottom: 24, textAlign: 'center' },
  backBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    marginTop: 40,
  },
  backText: { color: '#3b82f6', fontWeight: '600' },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#1e293b' },
  progreso: { fontSize: 14, color: '#64748b' },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  preguntaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  preguntaTexto: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1e293b' },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  opcionSeleccionada: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  opcionCorrecta: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  opcionIncorrecta: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  opcionLetra: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  opcionLetraText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  opcionTexto: { flex: 1, fontSize: 16, color: '#1e293b' },
  feedback: {
    marginTop: 16,
    borderRadius: 10,
    padding: 16,
  },
  feedbackOk: { backgroundColor: '#d1fae5', borderColor: '#10b981', borderWidth: 1 },
  feedbackBad: { backgroundColor: '#fee2e2', borderColor: '#ef4444', borderWidth: 1 },
  feedbackTitle: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  feedbackText: { color: '#475569', lineHeight: 22 },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  navBtnText: { color: '#3b82f6', fontWeight: '600', fontSize: 16 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  resumenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  resumenTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#1e293b' },
  porcentaje: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3b82f6',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 24,
    width: '100%',
  },
  statItem: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNum: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
});