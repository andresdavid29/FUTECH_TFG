import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { teamLogosChampions } from "../assets/teamLogosChampions";
import { leagueLogos } from "../assets/leagueLogos";
import { leagues } from "../data/leagues";
import futechLogo from "../assets/futech_logo.png";
import googlePlayLogo from "../assets/google_play_logo.png";
import iconoFavoritos from "../assets/icono_favoritos.png";
import iconoUsuario from "../assets/icono_usuario.png";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Heart } from 'lucide-react';
import { getFlagResource } from '../data/utils';
import "./MenuScreen.css";

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

type Equipo = {
  RL: number;
  Equipo: string;
  Pts: number;
  GF: number;
  GC: number;
  DG: number;
};

const getPositionColor = (pos: number, total: number): string => {
  if (pos === 1) return "#FFD700";
  if (pos >= 2 && pos <= 4) return "#1E90FF";
  if (pos === 5) return "#FF6C41";
  if (pos === 6) return "#4CAF50";
  if (pos > total - 3) return "#FF0000";
  return "transparent";
};

const TablaClasificacionChampions: React.FC = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showCompetitions, setShowCompetitions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecked(true);
      if (!firebaseUser) setFavoritos([]);
      else {
        const favsRef = collection(db, "users", firebaseUser.uid, "favorites");
        onSnapshot(favsRef, snap => setFavoritos(snap.docs.map(d => d.id)));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch("/data/tabla6.json")
      .then(res => res.ok ? res.json() : Promise.reject('Error cargando datos'))
      .then(data => { setEquipos(data); setLoading(false); })
      .catch(err => { setError(String(err)); setLoading(false); });
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCompetitions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleFavorito = async (equipo: string) => {
    if (!user) return alert("Debes iniciar sesión para guardar favoritos");
    const favRef = doc(db, "users", user.uid, "favorites", equipo);
    try {
      if (favoritos.includes(equipo)) await deleteDoc(favRef);
      else await setDoc(favRef, { favorito: true });
    } catch {
      alert("Error guardando favorito");
    }
  };

  const handleNavigateToStats = (fullName: string) => {
    const parts = fullName.split(' ');
    const teamName = parts.slice(1).join(' ') || parts[0];
    navigate(`/estadisticas/${encodeURIComponent(teamName)}`);
  };

  if (!authChecked) return <div>Cargando estado de usuario...</div>;
  if (loading) return <div className="text-center mt-10 text-sm">Cargando datos...</div>;
  if (error) return <div className="text-center mt-10 text-red-600 text-sm">Error: {error}</div>;

  return (
    <div className="menu-screen flex flex-col min-h-screen">
      <header className="navbar" ref={dropdownRef}>
        <div className="logo" onClick={() => navigate("/")}> 
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
                    <button className="dropdown-item" onClick={() => { setShowCompetitions(false); navigate(l.route); }}>
                      <img src={leagueLogos[l.logoKey]} alt={l.name} className="dropdown-icon" />
                      <span>{l.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <img src={iconoFavoritos} alt="Favoritos" className="icon" onClick={() => navigate("/favoritos")} />
          <img src={iconoUsuario} alt="Usuario" className="icon" onClick={() => navigate(user ? "/session_verification" : "/login")} />
          <img src={googlePlayLogo} alt="Google Play" className="icon" onClick={() => window.open("https://play.google.com/store/apps/your-app-id","_blank")} />
        </div>
      </header>
      <main className="flex-grow content-spacing flex justify-center items-start py-6">
        <div className="w-[96%] max-w-sm px-2">
          <header className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Clasificación Champions League</h1>
            <img src={leagueLogos.champions} alt="Logo Champions League" style={{ height: "80px" }} />
          </header>
          <div className="flex bg-blue-700 text-white font-semibold rounded-t-md text-xs">
            <div className="w-[10%] pl-2">Pos</div>
            <div className="w-[32%]">Equipo</div>
            <div className="w-[11%] text-center">Pts</div>
            <div className="w-[11%] text-center">GF</div>
            <div className="w-[11%] text-center">GC</div>
            <div className="w-[11%] text-center">DG</div>
            <div className="w-[14%] text-center pr-1">&nbsp;</div>
          </div>
          {equipos.map((equipo, idx) => {
            const isFav = favoritos.includes(equipo.Equipo);
            const posColor = getPositionColor(equipo.RL, equipos.length);
            const bg = idx % 2 === 0 ? "bg-[#1d2433]" : "bg-[#222b3d]";
            const parts = equipo.Equipo.split(' ');
            const countryCode = parts[0].toLowerCase();
            const teamName = parts.slice(1).join(' ') || parts[0];
            // Fallback para logo
            const logoKey = teamLogosChampions[teamName] ? teamName : equipo.Equipo;
            const logoSrc = teamLogosChampions[logoKey] || '/logos/placeholder.png';
            return (
              <div key={equipo.Equipo} className={`${bg} flex items-center text-xs py-1`} style={{ minHeight: "30px" }}>
                <div className="w-[10%] pl-2 flex items-center" style={{ position: 'relative' }}>
                  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'4px', backgroundColor: posColor, borderRadius:'2px' }} />
                  <span style={{ marginLeft:8, position:'relative', zIndex:1 }}>{equipo.RL}</span>
                </div>
                <div className="w-[32%] flex items-center">
                  <img src={getFlagResource(countryCode)} alt={`${countryCode} flag`} style={{ width:24, height:16, marginRight:4 }} />
                  <div style={{ width:48, height:48, overflow:'hidden', marginRight:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <img src={logoSrc} alt={`${teamName} logo`} style={{ width:40, height:40 }} onError={e=>{(e.target as HTMLImageElement).src='/logos/placeholder.png';}} />
                  </div>
                  <span className="truncate cursor-pointer" onClick={() => handleNavigateToStats(equipo.Equipo)}>{teamName}</span>
                </div>
                <div className="w-[11%] text-center">{equipo.Pts}</div>
                <div className="w-[11%] text-center">{equipo.GF}</div>
                <div className="w-[11%] text-center">{equipo.GC}</div>
                <div className="w-[11%] text-center">{equipo.DG}</div>
                <div className="w-[14%] text-center pr-1 flex justify-center">
                  <Heart
                    className="w-5 h-5 cursor-pointer transition-colors"
                    strokeWidth={2}
                    stroke={isFav ? undefined : '#9ca3af'}
                    fill={isFav ? '#ef4444' : 'none'}
                    onClick={() => toggleFavorito(equipo.Equipo)}
                  />
                </div>
              </div>
            );
          })}
        </div>
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

export default TablaClasificacionChampions;
