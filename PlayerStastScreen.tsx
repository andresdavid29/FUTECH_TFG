import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cargarPlantillaDesdeCSV2, getPlayerPhotoResource } from '../data/utils';
import type { Jugador2 } from '../types';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { leagues } from '../data/leagues';
import { leagueLogos } from '../assets/leagueLogos';
import futechLogo from "../assets/futech_logo.png";
import googlePlayLogo from "../assets/google_play_logo.png";
import iconoFavoritos from "../assets/icono_favoritos.png";
import iconoUsuario from "../assets/icono_usuario.png";
import './PlayerStatsScreen.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface PlayerStatsProps {
  playerId: number;
  csvUrl: string;
}

const PlayerStatsScreen: React.FC<PlayerStatsProps> = ({ playerId, csvUrl }) => {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Jugador2 | null>(null);
  const [allPlayers, setAllPlayers] = useState<Jugador2[]>([]);
  const [opponent, setOpponent] = useState<Jugador2 | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showCompetitions, setShowCompetitions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    cargarPlantillaDesdeCSV2(csvUrl)
      .then(list => {
        setAllPlayers(list);
        setPlayer(list.find(p => p.id === playerId) || null);
      })
      .catch(console.error);
  }, [csvUrl, playerId]);

  if (!player) return <div className="text-center mt-10 text-sm">Cargando jugador...</div>;

  const samePos = allPlayers.filter(p => p.mainPos === player.mainPos && p.id !== player.id);
  const filteredList = samePos.filter(p => p.player.toLowerCase().includes(searchQuery.toLowerCase()));

  const radarData = opponent && {
    labels: ['xA/90', 'xG/90', 'Goles', 'Asist', 'Rating'],
    datasets: [
      {
        label: player.player,
        data: [player.xAG, player.xg, player.gls, player.ast, player.rating],
        fill: true,
        backgroundColor: 'rgba(30,185,128,0.4)',
        borderColor: '#1EB980',
      },
      {
        label: opponent.player,
        data: [opponent.xAG, opponent.xg, opponent.gls, opponent.ast, opponent.rating],
        fill: true,
        backgroundColor: 'rgba(233,30,99,0.4)',
        borderColor: '#E91E63',
      },
      {
        label: 'Promedio',
        data: samePos.length
          ? samePos.reduce(
              (acc, p) => acc.map((v, i) => v + [p.xAG, p.xg, p.gls, p.ast, p.rating][i] / samePos.length),
              [0, 0, 0, 0, 0]
            )
          : [0, 0, 0, 0, 0],
        fill: true,
        backgroundColor: 'rgba(128,128,128,0.3)',
        borderColor: 'gray',
        borderDash: [5, 5],
      },
    ],
  };

  return (
    <div className="menu-screen flex flex-col min-h-screen">
      <header className="navbar" ref={dropdownRef}>
        <div className="logo" onClick={() => navigate('/') }>
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
                      }}>
                      <img src={leagueLogos[l.logoKey]} alt={l.name} className="dropdown-icon" />
                      <span>{l.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <img src={iconoFavoritos} alt="Favoritos" className="icon" onClick={() => navigate('/favoritos')} />
          <img src={iconoUsuario} alt="Usuario" className="icon" onClick={() => navigate('/login')} />
          <img
            src={googlePlayLogo}
            alt="Google Play"
            className="icon"
            onClick={() => window.open('https://play.google.com/store/apps/your-app-id','_blank')}
          />
        </div>
      </header>

      <main className="flex-grow w-full bg-[#272e3f] text-[#c0e1ec] font-sans flex flex-col items-center py-6 content-spacing">
        <section className="w-[90%] max-w-xl">
          <h1 className="text-xl font-bold mb-4 text-center">Comparativa Radar</h1>
          <div className="flex flex-col items-center mb-6">
            <div className="player-images mb-4">
              <div className="flex flex-col items-center">
                <img src={getPlayerPhotoResource(player.player)} alt={player.player} className="w-16 h-16 rounded-full" />
                <span className="text-lg font-semibold mt-1 text-center">{player.player}</span>
              </div>
              {opponent && (
                <div className="flex flex-col items-center">
                  <img src={getPlayerPhotoResource(opponent.player)} alt={opponent.player} className="w-16 h-16 rounded-full" />
                  <span className="text-lg font-semibold mt-1 text-center">{opponent.player}</span>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Buscar jugador"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
              className="w-64 p-2 rounded"
            />
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="mt-2 p-2 border rounded w-64"
            >
              {opponent ? `Oponente: ${opponent.player}` : 'Selecciona oponente'}
            </button>
            {showDropdown && (
              <ul className="player-dropdown w-64">
                {filteredList.map(p => (
                  <li
                    key={p.id}
                    onClick={() => { setOpponent(p); setSearchQuery(p.player); setShowDropdown(false); }}
                  >
                    {p.player}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {opponent && (
            <div className="mx-auto" style={{ width: 400, height: 400 }}>
              <Radar data={radarData!} options={{ scales: { r: { beginAtZero: true } } }} />
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Futech. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="/about">Acerca de</a>
          <a href="/terms">Términos y Condiciones</a>
          <a href="/contact">Contacto</a>
        </div>
      </footer>
    </div>
  );
};

export default PlayerStatsScreen;
