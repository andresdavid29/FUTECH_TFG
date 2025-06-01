// src/data/utils.ts
import type { Jugador2 } from '../types';
import { teamLogos } from '../assets/teamLogos';

/**
 * Carga y parsea un CSV con estadísticas de jugadores.
 * Convierte campos numéricos a number y normaliza cadenas.
 */
export async function cargarPlantillaDesdeCSV2(csvUrl: string): Promise<Jugador2[]> {
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error('Error al cargar CSV');
  const text = await res.text();

  // Dividir líneas y columnas
  const rows = text.trim().split('\n').map(line => line.split(','));
  const header = rows[0]
    .map(h => h.replace(/\r$/, '').trim().toLowerCase());

  // Índices de columnas según cabecera
  const idx: Record<string, number> = {
    name: header.indexOf('name'),
    id: header.indexOf('id'),
    goal_assist: header.indexOf('goal_assist'),
    goals: header.indexOf('goals'),
    xg: header.indexOf('expected_goals_per_90'),
    xag: header.indexOf('expected_assists_per_90'),
    rating: header.indexOf('rating'),
    nation: header.indexOf('nation'),
    pos: header.indexOf('pos'),
    squad: header.indexOf('squad'),
    born: header.indexOf('born'),
  };

  console.log('CSV header:', header);
  console.log('Índices calculados:', idx);

  return rows.slice(1).map((cols, rowIndex) => {
    // Validación índice id
    if (idx.id < 0 || idx.id >= cols.length) {
      console.warn(`Fila ${rowIndex + 1}: columna 'id' no encontrada (idx.id=${idx.id})`, cols);
    }
    const rawId = cols[idx.id] || '';
    const parsedId = parseInt(rawId, 10);
    console.log(`Fila ${rowIndex + 1} → raw id=\"${rawId}\", parseInt →`, parsedId);

    // Posición principal y alternativa
    const rawPos = cols[idx.pos] || '';
    const [mainPos, altPos] = rawPos.split(',').map(p => p.trim());
    
    // Squad (nombre de equipo)
    const squadRaw = cols[idx.squad] || '';

    return {
      player: cols[idx.name] || '',
      id: isNaN(parsedId) ? 0 : parsedId,
      ast: Math.round(parseFloat(cols[idx.goal_assist]) || 0),
      gls: Math.round(parseFloat(cols[idx.goals]) || 0),
      xg: parseFloat(cols[idx.xg]) || 0,
      xAG: parseFloat(cols[idx.xag]) || 0,
      rating: parseFloat(cols[idx.rating]) || 0,
      nation: (cols[idx.nation] || '').toLowerCase().split(' ')[0],
      mainPos,
      altPos: altPos || undefined,
      squad: squadRaw,
      Squad: squadRaw, // compatibilidad con Jugador2
      born: cols[idx.born] || '',
    } as Jugador2;
  });
}

/**
 * Normaliza un nombre para comparaciones (sin tildes, en minúsculas).
 */
function normalizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Devuelve la URL del logo de equipo normalizando el nombre.
 */
export function getLogoResource(squad: string): string {
  const nombreNormalizado = normalizarNombre(squad);
  return teamLogos[nombreNormalizado] || '/assets/default.png';
}

// Carga dinámica de imágenes (banderas y jugadores)
const imagenes = {
  ...import.meta.glob('../assets/*.png', { eager: true, import: 'default' }),
  ...import.meta.glob('../assets/*.jpg', { eager: true, import: 'default' }),
};

const imagenesMap: Record<string, string> = {};
for (const path in imagenes) {
  const fileName = path.split('/').pop()?.replace(/\.(png|jpg)$/, '');
  if (fileName) imagenesMap[fileName] = imagenes[path] as string;
}

/**
 * Devuelve la URL de la bandera de la nación.
 */
export function getFlagResource(nation: string): string {
  return imagenesMap[nation.toLowerCase()] || '';
}

/**
 * Devuelve la URL de la foto de un jugador, aplicando reemplazos para caracteres especiales.
 */
export function getPlayerPhotoResource(playerName: string): string {
  const replacements: Record<string, string> = {
    ' ': '_', 'á':'a','à':'a','é':'e','í':'i','ó':'o','ú':'u',
    '-':'0','ã':'1','ë':'2','ø':'3','ñ':'4','ě':'5','ü':'6',
    'ć':'7','č':'8','î':'9','ö':'10','’':'11','š':'12','ğ':'13',
    'ı':'d','ä':'14','ï':'15','\'':'16','ł':'t','ń':'17','ý':'18',
    'ă':'19','ș':'20','ç':'21','ę':'23'
  };
  let photoName = playerName.toLowerCase();
  photoName = photoName.replace(/./g, ch => replacements[ch] ?? ch);
  return imagenesMap[photoName] || '';
}
