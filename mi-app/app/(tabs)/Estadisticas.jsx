import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../_context/AuthContext';


const { width } = Dimensions.get('window');

const Estadisticas = () => {
  const { user } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      cargarHistorial();
    }
  }, [user]);

  const cargarHistorial = async (esRefresh = false) => {
    try {
      if (esRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📊 Cargando historial del usuario:', user.id);

      const response = await api.get(`/historial/usuario/${user.id}`);
      const historialData = response.data;
      
      console.log('✅ Historial recibido:', historialData);
      
      setHistorial(historialData || []);

    } catch (err) {
      console.error('❌ Error al cargar historial:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      if (err.response?.status === 404) {
        console.log('⚠️ El endpoint /historial/usuario no existe en el backend');
      }
      
      setHistorial([]);
      
    } finally {
      if (esRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    cargarHistorial(true);
  };

  const calcularEstadisticas = () => {
    if (!historial || historial.length === 0) {
      return {
        totalActividades: 0,
        totalPreguntas: 0,
        preguntasCorrectas: 0,
        totalEjercicios: 0,
        promedioEjercicios: 0,
        porcentajeExito: 0,
      };
    }

    const preguntas = historial.filter(item => item.pregunta && !item.ejercicio);
    const ejercicios = historial.filter(item => item.ejercicio);
    const preguntasCorrectas = preguntas.filter(item => item.correcta === true).length;

    let promedioEjercicios = 0;
    if (ejercicios.length > 0) {
      const sumaEjercicios = ejercicios.reduce((acc, item) => acc + (item.puntaje || 0), 0);
      promedioEjercicios = Math.round(sumaEjercicios / ejercicios.length);
    }

    const porcentajeExito = preguntas.length > 0 
      ? Math.round((preguntasCorrectas / preguntas.length) * 100)
      : 0;

    return {
      totalActividades: historial.length,
      totalPreguntas: preguntas.length,
      preguntasCorrectas,
      totalEjercicios: ejercicios.length,
      promedioEjercicios,
      porcentajeExito,
    };
  };

  const obtenerColorRendimiento = (porcentaje) => {
    if (porcentaje >= 80) return '#10b981';
    if (porcentaje >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const obtenerMensajeMotivacional = (porcentaje) => {
    if (porcentaje >= 80) {
      return {
        titulo: '¡Excelente trabajo!',
        mensaje: 'Demuestras un dominio sólido de los conceptos. ¡Continúa así!'
      };
    } else if (porcentaje >= 60) {
      return {
        titulo: '¡Vas muy bien!',
        mensaje: 'Estás progresando bien. Con más práctica llegarás lejos.'
      };
    } else if (porcentaje > 0) {
      return {
        titulo: '¡Sigue practicando!',
        mensaje: 'La constancia es la clave del éxito. ¡No te rindas!'
      };
    } else {
      return {
        titulo: '¡Comienza tu aprendizaje!',
        mensaje: 'Resuelve ejercicios y cuestionarios para ver tu progreso aquí.'
      };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  const stats = calcularEstadisticas();
  const mensaje = obtenerMensajeMotivacional(stats.porcentajeExito);

  if (stats.totalActividades === 0) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Mis Estadísticas</Text>
          <Text style={styles.headerSubtitle}>
            {user?.nombre} {user?.apellido}
          </Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No hay estadísticas disponibles</Text>
          <Text style={styles.emptySubtitle}>
            Comienza a resolver ejercicios y cuestionarios para ver tu progreso
          </Text>
          
          <TouchableOpacity 
            style={styles.btnEmpezar}
            onPress={() => onRefresh()}
          >
            <Text style={styles.btnEmpezarText}>🔄 Actualizar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
        <Text style={styles.headerTitle}>📊 Mis Estadísticas</Text>
        <Text style={styles.headerSubtitle}>
          {user?.nombre} {user?.apellido}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen General</Text>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statNumber}>{stats.totalActividades}</Text>
            <Text style={styles.statLabel}>Actividades</Text>
            <Text style={styles.statSubLabel}>Completadas</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statNumber}>{stats.porcentajeExito}%</Text>
            <Text style={styles.statLabel}>Tasa de</Text>
            <Text style={styles.statSubLabel}>Éxito</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={styles.statNumber}>{stats.totalEjercicios}</Text>
            <Text style={styles.statLabel}>Ejercicios</Text>
            <Text style={styles.statSubLabel}>Resueltos</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statNumber}>{stats.promedioEjercicios}</Text>
            <Text style={styles.statLabel}>Promedio</Text>
            <Text style={styles.statSubLabel}>General</Text>
          </View>
        </View>
      </View>

      {stats.totalPreguntas > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rendimiento Detallado</Text>

          <View style={styles.rendimientoCard}>
            <View style={styles.rendimientoHeader}>
              <Text style={styles.rendimientoTitulo}>🎯 Cuestionarios</Text>
              <Text style={styles.rendimientoPorcentaje}>{stats.porcentajeExito}%</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${stats.porcentajeExito}%`,
                    backgroundColor: obtenerColorRendimiento(stats.porcentajeExito)
                  }
                ]}
              />
            </View>

            <View style={styles.rendimientoStats}>
              <View style={styles.rendimientoStat}>
                <Text style={styles.rendimientoStatLabel}>Correctas</Text>
                <Text style={[styles.rendimientoStatValor, { color: '#10b981' }]}>
                  {stats.preguntasCorrectas}
                </Text>
              </View>
              <View style={styles.rendimientoStat}>
                <Text style={styles.rendimientoStatLabel}>Incorrectas</Text>
                <Text style={[styles.rendimientoStatValor, { color: '#ef4444' }]}>
                  {stats.totalPreguntas - stats.preguntasCorrectas}
                </Text>
              </View>
              <View style={styles.rendimientoStat}>
                <Text style={styles.rendimientoStatLabel}>Total</Text>
                <Text style={styles.rendimientoStatValor}>{stats.totalPreguntas}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {stats.totalEjercicios > 0 && (
        <View style={styles.section}>
          <View style={styles.rendimientoCard}>
            <View style={styles.rendimientoHeader}>
              <Text style={styles.rendimientoTitulo}>💪 Ejercicios Prácticos</Text>
              <Text style={styles.rendimientoPorcentaje}>{stats.promedioEjercicios}/100</Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${stats.promedioEjercicios}%`,
                    backgroundColor: obtenerColorRendimiento(stats.promedioEjercicios)
                  }
                ]}
              />
            </View>

            <Text style={styles.rendimientoDescripcion}>
              Promedio basado en {stats.totalEjercicios} ejercicio{stats.totalEjercicios !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Actividad Reciente</Text>

        <View style={styles.historialLista}>
          {historial.slice(0, 10).map((item, index) => (
            <View key={index} style={styles.historialItem}>
              <View style={styles.historialIcono}>
                <Text style={styles.historialIconoTexto}>
                  {item.ejercicio ? '💪' : '❓'}
                </Text>
              </View>

              <View style={styles.historialInfo}>
                <Text style={styles.historialTitulo}>
                  {item.ejercicio 
                    ? `Ejercicio: ${item.ejercicio.subtema?.nombre || 'Sin nombre'}`
                    : `Pregunta: ${item.pregunta?.subtema?.nombre || 'Cuestionario'}`
                  }
                </Text>
                <Text style={styles.historialFecha}>
                  {new Date(item.fechaRespuesta).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>

              <View style={styles.historialPuntaje}>
                {item.puntaje !== undefined && item.puntaje !== null ? (
                  <>
                    <Text style={[
                      styles.historialPuntajeNumero,
                      { color: obtenerColorRendimiento(item.puntaje) }
                    ]}>
                      {item.puntaje}
                    </Text>
                    <Text style={styles.historialPuntajeLabel}>/100</Text>
                  </>
                ) : (
                  <Text style={[
                    styles.historialEstado,
                    { color: item.correcta ? '#10b981' : '#ef4444' }
                  ]}>
                    {item.correcta ? '✓' : '✗'}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.mensajeContainer}>
        <Text style={styles.mensajeIcono}>🎯</Text>
        <Text style={styles.mensajeTitulo}>{mensaje.titulo}</Text>
        <Text style={styles.mensajeTexto}>{mensaje.mensaje}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc' 
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: '#64748b' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40, 
    marginTop: 100 
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptySubtitle: { 
    fontSize: 16, 
    color: '#64748b', 
    textAlign: 'center', 
    lineHeight: 24, 
    marginBottom: 24 
  },
  btnEmpezar: { 
    backgroundColor: '#3b82f6', 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 8 
  },
  btnEmpezarText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  header: { 
    backgroundColor: '#fff', 
    padding: 24, 
    paddingTop: 60, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0' 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 4 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#64748b' 
  },
  section: { 
    padding: 16 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 16 
  },
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12 
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: { 
    fontSize: 32, 
    marginBottom: 8 
  },
  statNumber: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 14, 
    color: '#475569', 
    fontWeight: '600' 
  },
  statSubLabel: { 
    fontSize: 12, 
    color: '#64748b' 
  },
  rendimientoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rendimientoHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  rendimientoTitulo: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  rendimientoPorcentaje: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#3b82f6' 
  },
  progressBar: { 
    height: 12, 
    backgroundColor: '#e2e8f0', 
    borderRadius: 6, 
    overflow: 'hidden', 
    marginBottom: 16 
  },
  progressFill: { 
    height: '100%', 
    borderRadius: 6 
  },
  rendimientoStats: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  rendimientoStat: { 
    alignItems: 'center' 
  },
  rendimientoStatLabel: { 
    fontSize: 12, 
    color: '#64748b', 
    marginBottom: 4 
  },
  rendimientoStatValor: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1e293b' 
  },
  rendimientoDescripcion: { 
    fontSize: 14, 
    color: '#64748b', 
    textAlign: 'center' 
  },
  historialLista: { 
    gap: 12 
  },
  historialItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historialIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historialIconoTexto: { 
    fontSize: 24 
  },
  historialInfo: { 
    flex: 1 
  },
  historialTitulo: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1e293b', 
    marginBottom: 4 
  },
  historialFecha: { 
    fontSize: 12, 
    color: '#94a3b8' 
  },
  historialPuntaje: { 
    flexDirection: 'row', 
    alignItems: 'baseline' 
  },
  historialPuntajeNumero: { 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  historialPuntajeLabel: { 
    fontSize: 14, 
    color: '#94a3b8', 
    marginLeft: 2 
  },
  historialEstado: { 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  mensajeContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  mensajeIcono: { 
    fontSize: 48, 
    marginBottom: 12 
  },
  mensajeTitulo: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1e293b', 
    marginBottom: 8 
  },
  mensajeTexto: { 
    fontSize: 15, 
    color: '#64748b', 
    textAlign: 'center', 
    lineHeight: 22 
  },
});

export default Estadisticas;