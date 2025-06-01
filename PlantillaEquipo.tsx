import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Jugador2 } from '../types';
import { cargarPlantillaDesdeCSV2, getFlagResource, getPlayerPhotoResource } from '../data/utils';
import { Heart } from 'lucide-react';
import { teamLogos } from '../assets/teamLogos';
import { leagues } from '../data/leagues';
import { leagueLogos } from '../assets/leagueLogos';
import futechLogo from "../assets/futech_logo.png";
import googlePlayLogo from "../assets/google_play_logo.png";
import iconoFavoritos from "../assets/icono_favoritos.png";
import iconoUsuario from "../assets/icono_usuario.png";
import './MenuScreen.css';

// Firebase config
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyCKfjSdA0yETWIwYj1hx8r8ph6UdcCBKNI",
  authDomain: "futech-cc924.firebaseapp.com",
  projectId: "futech-cc924",
  storageBucket: "futech-cc924.firebasestorage.app",
  messagingSenderId: "232829160703",
  appId: "1:232829160703:web:0028e8ba6e75a05e2410ca"
};
initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

const CSV_URL = '/data/estadisticas_actualizadas_LaLiga.csv';
const posOrder: Record<string, number> = { GK: 1, DF: 2, MF: 3, FW: 4 };

const PlantillaEquipo: React.FC = () => {
  const { nombreEquipo } = useParams<{ nombreEquipo?: string }>();
  const navigate = useNavigate();
  const [showCompetitions, setShowCompetitions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (!nombreEquipo) return <div className="p-4 text-red-500">Equipo no especificado</div>;
  const squad = decodeURIComponent(nombreEquipo);

  const [players, setPlayers] = useState<Jugador2[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      setAuthChecked(true);
      if (!firebaseUser) setFavoritos([]);
      else {
        const favsRef = collection(db, 'users', firebaseUser.uid, 'favorites');
        onSnapshot(favsRef, snap => setFavoritos(snap.docs.map(d => d.id)));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    cargarPlantillaDesdeCSV2(CSV_URL)
      .then(all => {
        const filtered = all
          .filter(j => j.Squad.trim().toLowerCase() === squad.trim().toLowerCase())
          .sort((a, b) => {
            const pa = posOrder[a.mainPos.toUpperCase()] || 5;
            const pb = posOrder[b.mainPos.toUpperCase()] || 5;
            return pa !== pb ? pa - pb : a.player.localeCompare(b.player);
          });
        if (!filtered.length) throw new Error(`No se encontraron jugadores para ${squad}`);
        setPlayers(filtered);
      })
      .catch(e => setError(e.message));
  }, [squad]);

  const toggleFavorito = async (id: number) => {
    if (!user) return alert('Debes iniciar sesión para guardar favoritos');
    const favRef = doc(db, 'users', user.uid, 'favorites', String(id));
    try {
      favoritos.includes(String(id))
        ? await deleteDoc(favRef)
        : await setDoc(favRef, { favorito: true });
    } catch {
      alert('Error guardando favorito');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCompetitions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!authChecked) return <div className="text-center mt-10 text-sm">Cargando estado de usuario...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!players.length) return <div className="text-center mt-10 text-sm">Cargando plantilla...</div>;

  const logoSrc = teamLogos[squad] || '';

  return (
    <div className="menu-screen flex flex-col min-h-screen">
      {/* NAVBAR */}
      <header className="navbar" ref={dropdownRef}>
        <div className="logo" onClick={() => navigate('/') }>
          <img src={futechLogo} alt="Futech Logo" className="logo-img" />
          <span className="logo-text">Futech</span>
        </div>
        <div className="nav-actions">
          {/* Botón cambiado: Competiciones en lugar de Inicio */}
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
                        navigate(user ? l.route : '/session_verification');
                      }}>
                      <img src={leagueLogos[l.logoKey]} alt={l.name} className="dropdown-icon" />
                      <span>{l.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {user && <img src={iconoFavoritos} alt="Favoritos" className="icon" onClick={() => navigate('/favoritos')} />}
          <img
            src={iconoUsuario}
            alt="Usuario"
            className="icon"
            onClick={() => navigate(user ? '/session_verification' : '/login')}
          />
          <img
            src={googlePlayLogo}
            alt="Google Play"
            className="icon"
            onClick={() => window.open('https://play.google.com/store/apps/your-app-id','_blank')}
          />
        </div>
      </header>

      {/* CONTENT (sin cambios) */}
      <div className="w-full bg-[#272e3f] text-[#c0e1ec] font-sans flex justify-center items-start py-6 content-spacing flex-grow">
        <div className="w-[96%] max-w-sm px-2">
          {/* Header */}
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Plantilla de {squad}</h1>
            {logoSrc && <img src={logoSrc} alt={`${squad} escudo`} style={{ height: '80px' }} />}
          </header>

          {/* Table header */}
          <div className="flex bg-blue-700 text-white font-semibold rounded-t-md text-xs">
            <div className="w-[10%] pl-2">&nbsp;</div>
            <div className="w-[11%] text-center">&nbsp;</div>
            <div className="w-[32%]">Jugador</div>
            <div className="w-[11%] text-center">Bandera</div>
            <div className="w-[11%] text-center">Pos</div>
            <div className="w-[11%] text-center">Goles</div>
            <div className="w-[11%] text-center">Asist</div>
            <div className="w-[11%] text-center">G+A</div>
            <div className="w-[11%] text-center">Rating</div>
            <div className="w-[11%] text-center">xG</div>
            <div className="w-[11%] text-center">xA</div>
            <div className="w-[14%] text-center pr-1">xG+xA</div>
          </div>

          {/* Rows */}
          {players.map((j, idx) => {
            const bg = idx % 2 === 0 ? 'bg-[#1d2433]' : 'bg-[#222b3d]';
            const isFav = favoritos.includes(String(j.id));
            return (
              <div key={j.id} className={`${bg} flex items-center text-xs py-1`} style={{ minHeight: '30px' }}>
                <div className="w-[10%] pl-2 flex items-center justify-center">
                  <Heart
                    className="w-5 h-5 cursor-pointer transition-colors"
                    strokeWidth={2}
                    stroke={isFav ? undefined : '#9ca3af'}
                    fill={isFav ? '#ef4444' : 'none'}
                    onClick={() => toggleFavorito(j.id)}
                  />
                </div>
                <div className="w-[11%] pl-1 flex items-center justify-start">
                  <div style={{ width: '64px', height: '64px' }}>
                    <img
                      src={getPlayerPhotoResource(j.player)}
                      alt={j.player}
                      style={{ width: '60px', height: '60px' }}
                      onError={e => { (e.target as HTMLImageElement).src = '/logos/placeholder.png'; }}
                    />
                  </div>
                </div>
                <div className="w-[32%] pl-1 truncate cursor-pointer" onClick={() => navigate(`/estadisticas_jugador/${j.id}`)} title={j.player}>
                  {j.player}
                </div>
                <div className="w-[11%] flex justify-center items-center">
                  <img src={getFlagResource(j.nation)} alt={j.nation} className="h-4" />
                </div>
                <div className="w-[11%] text-center">{j.altPos ? `${j.mainPos} (${j.altPos})` : j.mainPos}</div>
                <div className="w-[11%] text-center">{j.gls}</div>
                <div className="w-[11%] text-center">{j.ast}</div>
                <div className="w-[11%] text-center">{j.gls + j.ast}</div>
                <div className="w-[11%] text-center">{j.rating.toFixed(2)}</div>
                <div className="w-[11%] text-center">{j.xg.toFixed(2)}</div>
                <div className="w-[11%] text-center">{j.xAG.toFixed(2)}</div>
                <div className="w-[14%] text-center pr-1">{(j.xg + j.xAG).toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>

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

export default PlantillaEquipo;
