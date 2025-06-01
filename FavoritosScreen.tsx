import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFavoritos } from "../hooks/useFavoritos";
import { cargarPlantillaDesdeCSV2, getPlayerPhotoResource, getFlagResource } from '../data/utils';
import { teamLogos } from '../assets/teamLogos';
import type { Jugador2 } from '../types';
import { leagues } from "../data/leagues";
import { leagueLogos } from "../assets/leagueLogos";
import futechLogo from "../assets/futech_logo.png";
import googlePlayLogo from "../assets/google_play_logo.png";
import iconoFavoritos from "../assets/icono_favoritos.png";
import iconoUsuario from "../assets/icono_usuario.png";
import "./MenuScreen.css";

const categorias = ["Liga", "Equipo", "Jugador"];
const ligaLogos: Record<string, string> = {
  "La Liga": "/logos/logo_la_liga.png",
  "Premier League": "/logos/logo_premier.png",
};

const FavoritosScreen: React.FC = () => {
  const navigate = useNavigate();
  const { favoritos, toggleFavorito } = useFavoritos();
  const [selectedTab, setSelectedTab] = useState("Liga");
  const [allPlayers, setAllPlayers] = useState<Jugador2[]>([]);
  const [showCompetitions, setShowCompetitions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load players
  useEffect(() => {
    cargarPlantillaDesdeCSV2('/data/estadisticas_actualizadas_LaLiga.csv')
      .then(players => setAllPlayers(players))
      .catch(console.error);
  }, []);

  // Close competitions dropdown
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCompetitions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentUser = Boolean(localStorage.getItem('user'));

  const ligas = Array.from(favoritos).filter(f => f === "La Liga" || f === "Premier League");
  const equipos = Array.from(favoritos).filter(
    f => f !== "La Liga" && f !== "Premier League" && !allPlayers.some(p => p.id === Number(f))
  );
  const jugadores = allPlayers.filter(p => favoritos.has(String(p.id)));

  return (
    <div className="menu-screen flex flex-col min-h-screen">
      {/* NAVBAR */}
      <header className="navbar" ref={dropdownRef}>
        <div className="logo" onClick={() => navigate('/')}> 
          <img src={futechLogo} alt="Futech Logo" className="logo-img" />
          <span className="logo-text">Futech</span>
        </div>
        <div className="nav-actions">
          <button
            className="btn-comp"
            onClick={() => setShowCompetitions(prev => !prev)}
          >
            Competiciones ▾
          </button>
          {showCompetitions && (
            <div className="dropdown">
              <ul>
                {leagues.map(l => (
                  <li key={l.id}>
                    <button className="dropdown-item" onClick={() => { setShowCompetitions(false); navigate(currentUser ? l.route : '/session_verification'); }}>
                      <img src={leagueLogos[l.logoKey]} alt={l.name} className="dropdown-icon" />
                      <span>{l.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <img src={iconoFavoritos} alt="Favoritos" className="icon" onClick={() => navigate('/favoritos')} />
          <img src={iconoUsuario} alt="Usuario" className="icon" onClick={() => navigate(currentUser ? '/session_verification' : '/login')} />
          <img src={googlePlayLogo} alt="Google Play" className="icon" onClick={() => window.open('https://play.google.com/store/apps/your-app-id','_blank')} />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-grow content-spacing p-4" style={{ backgroundColor: '#272e3f', color: '#c0e1ec' }}>
        <header style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
          {categorias.map(cat => (
            <button
              key={cat}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedTab === cat ? '#2ddcc3' : 'transparent',
                color: selectedTab === cat ? '#000' : '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                borderRadius: '0.5rem'
              }}
              onClick={() => setSelectedTab(cat)}
            >
              {cat}
            </button>
          ))}
        </header>

        {selectedTab === 'Liga' && (
          ligas.length === 0 ? <p>- No tienes favoritos en esta categoría</p> :
          ligas.map(liga => (
            <div key={liga} onClick={() => navigate(currentUser ? `/liga/${encodeURIComponent(liga)}` : '/session_verification')} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
              <img src={ligaLogos[liga]} alt={liga} style={{ width: 40, height: 40, marginRight: 8 }} />
              <span>{liga}</span>
              <button onClick={e => { e.stopPropagation(); toggleFavorito(liga); }} style={{ marginLeft: 'auto' }}>
                {favoritos.has(liga) ? '★' : '☆'}
              </button>
            </div>
          ))
        )}

        {selectedTab === 'Equipo' && (
          equipos.length === 0 ? <p>- No tienes favoritos en esta categoría</p> :
          equipos.map(equipo => (
            <div key={equipo} onClick={() => navigate(currentUser ? `/estadisticas/${encodeURIComponent(equipo)}` : '/session_verification')} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
              <img src={teamLogos[equipo] || '/logos/default_team.png'} alt={equipo} style={{ width: 40, height: 40, marginRight: 8 }} />
              <span>{equipo}</span>
              <button onClick={e => { e.stopPropagation(); toggleFavorito(equipo); }} style={{ marginLeft: 'auto' }}>
                {favoritos.has(equipo) ? '★' : '☆'}
              </button>
            </div>
          ))
        )}

        {selectedTab === 'Jugador' && (
          jugadores.length === 0 ? <p>- No tienes favoritos en esta categoría</p> :
          jugadores.map(jug => (
            <div key={jug.id} onClick={() => navigate(currentUser ? `/estadisticas_jugador/${jug.id}` : '/session_verification')} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
              <img src={getPlayerPhotoResource(jug.player)} alt={jug.player} style={{ width: 36, height: 36, marginRight: 8, borderRadius: '50%' }} />
              <img src={getFlagResource(jug.nation)} alt={jug.nation} style={{ width: 24, height: 24, marginRight: 8 }} />
              <span>{jug.player}</span>
              <button onClick={e => { e.stopPropagation(); toggleFavorito(String(jug.id)); }} style={{ marginLeft: 'auto' }}>
                {favoritos.has(String(jug.id)) ? '★' : '☆'}
              </button>
            </div>
          ))
        )}
      </main>

      {/* FOOTER */}
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

export default FavoritosScreen;
