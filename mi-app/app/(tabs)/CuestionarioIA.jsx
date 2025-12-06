// app/(tabs)/CuestionarioIA.jsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../services/api';
import { useAuth } from '../_context/AuthContext'; // ← AGREGADO

export default function CuestionarioIAScreen() {
  const { subtemaId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth(); // ← AGREGADO

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
      generarCuestionario();
    }
  }, [subtemaId]);

  const generarCuestionario = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🤖 Generando cuestionario IA para subtema:', subtemaId);

      const subtemasData = await api.getSubtemas();
      const subtemaEncontrado = subtemasData.find(s => s.id === parseInt(subtemaId));
      setSubtema(subtemaEncontrado);

      const response = await api.generarPreguntasIA(parseInt(subtemaId));
      console.log('✅ Preguntas generadas con IA:', response);
      
      setPreguntas(response.preguntas || []);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error al generar cuestionario:', err);
      setError('Error al generar el cuestionario con IA');
      setLoading(false);
      Alert.alert('Error', 'No se pudo generar el cuestionario con IA');
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

  const handleResponder = async () => { // ← CAMBIADO A ASYNC
    if (!respuestaSeleccionada) {
      Alert.alert('Aviso', 'Por favor selecciona una respuesta');
      return;
    }

    const pregunta = preguntas[preguntaActual];
    const correcta = respuestaSeleccionada === pregunta.respuestaCorrecta;
    setEsCorrecta(correcta);
    setRespondida(true);

    // ✅ GUARDAR LA RESPUESTA EN EL BACKEND
    try {
      console.log('💾 Guardando respuesta en BD...', {
        usuarioId: user.id,
        preguntaId: pregunta.id,
        respuestaUsuario: respuestaSeleccionada,
        correcta,
      });

      await api.guardarRetroalimentacion({
        usuarioId: user.id,
        preguntaId: pregunta.id,
        respuestaUsuario: respuestaSeleccionada,
        correcta,
      });

      console.log('✅ Respuesta guardada exitosamente');
    } catch (err) {
      console.error('❌ Error al guardar respuesta:', err);
    }

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
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>
          🤖 La IA está generando preguntas personalizadas...
        </Text>
        <Text style={styles.subtitleText}>
          Esto puede tardar 5-10 segundos
        </Text>
      </View>
    );
  }

  if (error || !subtema) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>⚠️ {error || 'No se pudo generar el cuestionario'}</Text>
        <TouchableOpacity onPress={handleVolver} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (preguntas.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>😔 No se pudieron generar preguntas con IA</Text>
        <TouchableOpacity onPress={handleVolver} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cuestionarioCompletado) {
    const { correctas, total, porcentaje } = calcularPuntaje();
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <View style={styles.resumenCard}>
          <Text style={styles.resumenTitle}>🎉 ¡Cuestionario Completado!</Text>
          <Text style={styles.iaBadge}>🤖 Generado con IA</Text>

          <Text style={styles.porcentaje}>{porcentaje}%</Text>
          <Text style={{ color: '#6b7280', marginBottom: 16 }}>
            Tu puntaje
          </Text>

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
            <Text style={styles.primaryBtnText}>← Volver a Estudiar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
        <Text style={styles.title}>🤖 {subtema.nombre}</Text>
        <Text style={styles.progreso}>
          Pregunta {preguntaActual + 1} de {preguntas.length}{' '}
          <Text style={styles.iaBadgeInline}>Generado con IA</Text>
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
              {esCorrecta ? '✅ ¡Correcto!' : '❌ Respuesta incorrecta'}
            </Text>
            {pregunta.explicacion ? (
              <Text style={styles.feedbackText}>{pregunta.explicacion}</Text>
            ) : null}
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { opacity: preguntaActual === 0 ? 0.4 : 1 }]}
            onPress={handleAnterior}
            disabled={preguntaActual === 0}
          >
            <Text style={styles.navBtnText}>← Anterior</Text>
          </TouchableOpacity>

          {!respondida ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleResponder}>
              <Text style={styles.primaryBtnText}>Responder</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSiguiente}>
              <Text style={styles.primaryBtnText}>Siguiente →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    marginTop: 40,
  },
  backText: { color: '#7c3aed', fontWeight: '600' },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  progreso: { color: '#4b5563' },
  iaBadgeInline: { color: '#7c3aed', fontWeight: '600' },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
  },
  preguntaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  preguntaTexto: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    backgroundColor: '#f9fafb',
  },
  opcionSeleccionada: {
    borderColor: '#7c3aed',
    backgroundColor: '#ede9fe',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  opcionLetraText: { color: '#fff', fontWeight: '700' },
  opcionTexto: { flex: 1, color: '#111827' },
  feedback: {
    marginTop: 12,
    borderRadius: 10,
    padding: 10,
  },
  feedbackOk: { backgroundColor: '#d1fae5', borderColor: '#10b981', borderWidth: 1 },
  feedbackBad: { backgroundColor: '#fee2e2', borderColor: '#ef4444', borderWidth: 1 },
  feedbackTitle: { fontWeight: '700', marginBottom: 4 },
  feedbackText: { color: '#4b5563' },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  navBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 10,
    marginRight: 6,
    alignItems: 'center',
  },
  navBtnText: { color: '#7c3aed', fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingVertical: 10,
    marginLeft: 6,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  resumenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    margin: 16,
  },
  resumenTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  iaBadge: { color: '#7c3aed', fontWeight: '600', marginBottom: 12 },
  porcentaje: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statItem: {
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 70,
  },
  statNum: { fontSize: 20, fontWeight: '700' },
  errorText: { fontSize: 16, color: '#ef4444', textAlign: 'center', marginBottom: 16 },
  subtitleText: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  loadingText: { fontSize: 16, color: '#6b7280', marginTop: 16, textAlign: 'center' },
});
//npx expo start --clear