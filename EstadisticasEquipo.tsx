import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import { teamLogos } from '../assets/teamLogos';
import { leagues } from '../data/leagues';
import { leagueLogos } from '../assets/leagueLogos';
import futechLogo from '../assets/futech_logo.png';
import googlePlayLogo from '../assets/google_play_logo.png';
import iconoFavoritos from '../assets/icono_favoritos.png';
import iconoUsuario from '../assets/icono_usuario.png';
import './MenuScreen.css';
import './EstadisticasEquipo.css';

interface EquipoEstadisticas {
  Squad: string;
  sca: number;
  passLive: number;
  passDead: number;
  to: number;
  sh: number;
  fld: number;
  def: number;
  gca: number;
}

const CSV_URL = '/data/estadisticas_equipo_LaLiga.csv';
const allMetrics: Array<keyof EquipoEstadisticas> = ['sca', 'passLive', 'passDead', 'sh', 'fld', 'def', 'gca'];

const EstadisticasEquipo: React.FC = () => {
  const { nombreEquipo } = useParams<{ nombreEquipo: string }>();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showCompetitions, setShowCompetitions] = useState(false);
  const [equipos, setEquipos] = useState<EquipoEstadisticas[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<EquipoEstadisticas | null>(null);
  const [mediaLiga, setMediaLiga] = useState<EquipoEstadisticas | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<Array<keyof EquipoEstadisticas>>(allMetrics);
  const [filterOpen, setFilterOpen] = useState(false);
  const [leyendaOpen, setLeyendaOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCompetitions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => (res.ok ? res.text() : Promise.reject('Fallo al cargar CSV')))
      .then(csv => {
        const rows = csv.trim().split('\n').map(line => line.split(','));
        const header = rows[0];
        const dataRows = rows.slice(1);
        const idx: Record<string, number> = {};
        ['Squad', 'SCA', 'PassLive', 'PassDead', 'TO', 'Sh', 'Fld', 'Def', 'GCA'].forEach(col => {
          idx[col] = header.indexOf(col);
        });

        const parsedEquipos = dataRows.map(cols => ({
          Squad: cols[idx['Squad']]?.replace(/_/g, ' ') || '',
          sca: Number(cols[idx['SCA']]) || 0,
          passLive: Number(cols[idx['PassLive']]) || 0,
          passDead: Number(cols[idx['PassDead']]) || 0,
          to: Number(cols[idx['TO']]) || 0,
          sh: Number(cols[idx['Sh']]) || 0,
          fld: Number(cols[idx['Fld']]) || 0,
          def: Number(cols[idx['Def']]) || 0,
          gca: Number(cols[idx['GCA']]) || 0,
        }));
        setEquipos(parsedEquipos);
      })
      .catch(err => setError(String(err)));
  }, []);

  useEffect(() => {
    if (!equipos.length || !nombreEquipo) return;

    const target = decodeURIComponent(nombreEquipo).toLowerCase();
    const seleccionado = equipos.find(e => e.Squad.toLowerCase() === target) || null;

    if (!seleccionado) {
      setError(`Equipo "${target}" no encontrado`);
      return;
    }

    const total = equipos.reduce((acc, e) => {
      allMetrics.forEach(k => {
        acc[k] += e[k];
      });
      return acc;
    }, { Squad: 'Media Liga', sca: 0, passLive: 0, passDead: 0, to: 0, sh: 0, fld: 0, def: 0, gca: 0 } as EquipoEstadisticas);

    const count = equipos.length;
    const media = { ...total };
    allMetrics.forEach(k => {
      media[k] = Math.round((total[k] / count) * 100) / 100;
    });

    setEquipoSeleccionado(seleccionado);
    setMediaLiga(media);
  }, [equipos, nombreEquipo]);

  const toggleMetric = useCallback((metric: keyof EquipoEstadisticas) => {
    setSelectedMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  }, []);

  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!equipoSeleccionado || !mediaLiga) return <div className="p-4 text-center">Cargando estadísticas...</div>;

  const radarData = selectedMetrics.map(key => ({
    metric: key,
    Seleccion: equipoSeleccionado[key],
    Liga: mediaLiga[key],
  }));

  return (
    <div className="menu-screen flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="navbar" ref={dropdownRef}>
        <div className="logo" onClick={() => navigate('/')}>
          <img src={futechLogo} alt="Futech Logo" className="logo-img" />
          <span className="logo-text">Futech</span>
        </div>

        <div className="nav-actions">
          <button className="btn-comp" onClick={() => setShowCompetitions(prev => !prev)}>
            Competiciones ▾
          </button>

          {showCompetitions && (
            <div className="dropdown">
              <ul>
                {leagues.map(l => (
                  <li key={l.id}>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowCompetitions(false);
                        navigate(l.route);
                      }}
                    >
                      <img src={leagueLogos[l.logoKey]} alt={l.name} className="dropdown-icon" />
                      <span>{l.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <img src={iconoFavoritos} alt="Favoritos" className="icon" onClick={() => navigate('/favoritos')} />
          <img src={iconoUsuario} alt="Usuario" className="icon" onClick={() => navigate('/session_verification')} />
          <img
            src={googlePlayLogo}
            alt="Google Play"
            className="icon"
            onClick={() => window.open('https://play.google.com/store/apps/your-app-id', '_blank')}
          />
        </div>
      </header>

      {/* Content */}
      <main className="page-content p-6 flex flex-col items-center w-full">
        <section className="flex justify-between items-center w-full mb-4">
          <h2 className="text-2xl font-bold">Estadísticas de {equipoSeleccionado.Squad}</h2>
          {teamLogos[equipoSeleccionado.Squad] && (
            <img src={teamLogos[equipoSeleccionado.Squad]} alt={equipoSeleccionado.Squad} className="h-16" />
          )}
        </section>

        <section className="flex justify-between items-start w-full mb-8">
          <div>
            <button onClick={() => setLeyendaOpen(prev => !prev)} className="btn-comp leyenda-btn">
              Leyenda ▾
            </button>
            {leyendaOpen && (
              <div className="leyenda-dropdown">
                <p className="font-bold mb-2">Leyenda</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>SCA</strong>: Acciones que conducen a un disparo</li>
                  <li><strong>PassLive</strong>: Pases vivos exitosos</li>
                  <li><strong>PassDead</strong>: Pases muertos</li>
                  <li><strong>Sh</strong>: Disparos totales</li>
                  <li><strong>Fld</strong>: Faltas recibidas</li>
                  <li><strong>Def</strong>: Acciones defensivas clave</li>
                  <li><strong>GCA</strong>: Acciones que conducen a un gol</li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setFilterOpen(prev => !prev)} className="btn-comp">
              Filtros ▾
            </button>
            {filterOpen && (
              <div className="filtros-dropdown">
                {allMetrics.map(metric => (
                  <label key={metric} className="flex items-center mb-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedMetrics.includes(metric)}
                      onChange={() => toggleMetric(metric)}
                    />
                    {metric}
                  </label>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Gráficas */}
        <div className="graficas-container">
          <RadarChart width={selectedMetrics.length * 80} height={400} data={radarData} outerRadius={150}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <Radar
              name="Equipo"
              dataKey="Seleccion"
              stroke="var(--primary-color)"
              fill="var(--primary-color)"
              fillOpacity={0.7}
            />
            <Radar
              name="Liga"
              dataKey="Liga"
              stroke="#02B8AB"
              fill="#02B8AB"
              fillOpacity={0.4}
            />
            <Legend verticalAlign="top" />
          </RadarChart>

          <BarChart width={selectedMetrics.length * 80} height={400} data={radarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" stroke={getComputedStyle(document.documentElement).getPropertyValue('--text-light')} />
            <YAxis stroke={getComputedStyle(document.documentElement).getPropertyValue('--text-light')} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Seleccion" fill="var(--primary-color)" />
            <Bar dataKey="Liga" fill="#02B8AB" />
          </BarChart>
        </div>

        {/* Navegación botones */}
        <div className="navegacion-botones">
          <button onClick={() => navigate(-1)} className="nav-btn">
            ← Volver
          </button>
          <button
            onClick={() => navigate(`/plantilla/${encodeURIComponent(equipoSeleccionado.Squad)}`)}
            className="nav-btn"
          >
            Ir a plantilla →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer text-center p-4 bg-gray-800 text-gray-400">
        <p>&copy; {new Date().getFullYear()} Futech. Todos los derechos reservados.</p>
        <div className="footer-links space-x-4 mt-2">
          <a href="/about" className="hover:text-white">Acerca de</a>
          <a href="/terms" className="hover:text-white">Términos y Condiciones</a>
          <a href="/contact" className="hover:text-white">Contacto</a>
        </div>
      </footer>
    </div>
  );
};

export default EstadisticasEquipo;
