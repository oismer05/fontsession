/**
 * Servicio para gestionar comentarios con la API externa.
 * La API almacena datos en sesión de Node.js (no persistente entre reinicios).
 */

const API_BASE_URL = 'https://3c565b10-b63b-48a6-a43b-4f27702cd684-00-3lwdrxlgc8utm.picard.replit.dev/api/comentario';

/**
 * Obtiene todos los comentarios desde la API.
 * @returns {Promise<Array>} Lista de comentarios o array vacío.
 */
export async function obtenerComentarios() {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();

    // La API devuelve {} cuando no hay datos, o { data: [...] } con datos
    if (!result || !result.data || !Array.isArray(result.data)) {
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    throw error;
  }
}

/**
 * Guarda un nuevo comentario en la API.
 * @param {string} nombreCompleto - Nombre del usuario.
 * @param {string} comentario - Texto del comentario.
 * @returns {Promise<boolean>} true si fue exitoso.
 */
export async function guardarComentario(nombreCompleto, comentario) {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombreCompleto: nombreCompleto.trim(),
        comentario: comentario.trim(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error al guardar comentario:', error);
    throw error;
  }
}

/**
 * Formatea una fecha ISO a formato legible en español.
 * @param {string} fechaISO - Fecha en formato ISO 8601.
 * @returns {string} Fecha formateada.
 */
export function formatearFecha(fechaISO) {
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fechaISO;
  }
}
