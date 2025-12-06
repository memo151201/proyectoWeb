// app/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';


const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      throw new Error('Sesión expirada');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const api = {
  // ============ ESTADÍSTICAS ============
  getEstadisticasUsuario: (usuarioId: number) => 
    fetchWithAuth(`/retroalimentaciones/usuario/${usuarioId}/estadisticas`),

  getHistorialUsuario: (usuarioId: number) => 
    fetchWithAuth(`/retroalimentaciones/usuario/${usuarioId}`),

  getProgresoMaterias: (usuarioId: number) => 
    fetchWithAuth(`/usuarios/${usuarioId}/progreso-materias`),

  // ============ MATERIAS ============
  getMaterias: () => fetchWithAuth('/materias'),
  getMateriaById: (id: number) => fetchWithAuth(`/materias/${id}`),
  
  // ============ TEMAS ============
  getTemas: () => fetchWithAuth('/temas'),
  getTemasByMateria: (materiaId: number) => 
    fetchWithAuth(`/temas/materia/${materiaId}`),
  
  // ============ SUBTEMAS ============
  getSubtemas: () => fetchWithAuth('/subtemas'),
  getSubtema: (id: number) => fetchWithAuth(`/subtemas/${id}`),
  getSubtemasByTema: (temaId: number) => 
    fetchWithAuth(`/subtemas/tema/${temaId}`),
  
  // ============ CONTENIDOS ============
  getContenidos: () => fetchWithAuth('/contenidos'),
  getContenido: (id: number) => fetchWithAuth(`/contenidos/${id}`),
  getContenidosBySubtema: (subtemaId: number) => 
    fetchWithAuth(`/contenidos/subtema/${subtemaId}`),
  
  // ============ EJERCICIOS ============
  getEjercicios: () => fetchWithAuth('/ejercicios'),
  getEjercicio: (id: number) => fetchWithAuth(`/ejercicios/${id}`),
  getEjerciciosBySubtema: (subtemaId: number) => 
    fetchWithAuth(`/ejercicios/subtema/${subtemaId}`),
  
  // ============ IA ============
  generarPreguntasIA: (subtemaId: number) => 
    fetchWithAuth(`/ia/generar-preguntas/${subtemaId}`, {
      method: 'POST',
    }),
  
  evaluarEjercicio: (ejercicioId: number, respuestaUsuario: string) => 
    fetchWithAuth(`/ia/evaluar-ejercicio`, {
      method: 'POST',
      body: JSON.stringify({ ejercicioId, respuestaUsuario }),
    }),
  
  // ============ PREGUNTAS ============
  getPreguntasBySubtema: (subtemaId: number) => 
    fetchWithAuth(`/preguntas/subtema/${subtemaId}`),
  
  verificarRespuesta: (preguntaId: number, respuesta: string) => 
    fetchWithAuth(`/preguntas/${preguntaId}/verificar`, {
      method: 'POST',
      body: JSON.stringify({ respuesta }),
    }),

  // ============ RETROALIMENTACIONES ============ ← NUEVO
  guardarRetroalimentacion: (data: {
    usuarioId: number;
    preguntaId?: number;
    ejercicioId?: number;
    respuestaUsuario: string;
    correcta?: boolean;
    puntaje?: number;
  }) => 
    fetchWithAuth('/retroalimentaciones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};