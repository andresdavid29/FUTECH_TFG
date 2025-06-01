// src/components/MenuScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leagues } from "../data/leagues";
import { leagueLogos } from "../assets/leagueLogos";
import futechLogo from "../assets/futech_logo.png";
import googlePlayLogo from "../assets/google_play_logo.png";
import iconoFavoritos from "../assets/icono_favoritos.png";
import iconoUsuario from "../assets/icono_usuario.png";
import slider1 from "../assets/slider1.jpg";
import slider2 from "../assets/slider2.jpg";
import slider3 from "../assets/slider3.jpeg";
import slider4 from "../assets/slider4.jpg";
import "./MenuScreen.css"; // Importa los estilos

const sliderImages = [slider1, slider2, slider3, slider4];

const MenuScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = Boolean(localStorage.getItem("user"));
  const [showCompetitions, setShowCompetitions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [blur, setBlur] = useState(true);

  // Slider autoplay con efecto blur
  useEffect(() => {
    const interval = setInterval(() => {
      setBlur(true);
      const timeout = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
        setBlur(false);
      }, 500);
      return () => clearTimeout(timeout);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCompetitions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="menu-screen">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo" onClick={() => navigate("/")}>
          <img src={futechLogo} alt="Futech Logo" className="logo-img" />
          <span className="logo-text">Futech</span>
        </div>
        <div className="nav-actions" ref={dropdownRef}>
          <button onClick={() => setShowCompetitions((prev) => !prev)} className="btn-comp">
            Competiciones ▾
          </button>
          {showCompetitions && (
            <div className="dropdown">
              <ul>
                {leagues.map((league) => (
                  <li key={league.id}>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowCompetitions(false);
                        navigate(currentUser ? league.route : "/session_verification");
                      }}
                    >
                      <img
                        src={leagueLogos[league.logoKey]}
                        alt={league.name}
                        className="dropdown-icon"
                      />
                      <span>{league.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {currentUser && (
            <img
              src={iconoFavoritos}
              alt="Favoritos"
              onClick={() => navigate("/favoritos")}
              className="icon"
            />
          )}
          <img
            src={iconoUsuario}
            alt="Usuario"
            onClick={() => navigate(currentUser ? "/session_verification" : "/login")}
            className="icon"
          />
          <img
            src={googlePlayLogo}
            alt="Google Play"
            onClick={() => window.open("https://play.google.com/store/apps/your-app-id", "_blank")}
            className="icon"
          />
        </div>
      </header>

      {/* Bienvenida */}
      <h2 className="title">Bienvenido a Futech</h2>

      {/* Ligas */}
      <div className="league-container">
        <ul className="league-list">
          {leagues.map((league) => (
            <li
              key={league.id}
              className="league-item"
              onClick={() => navigate(currentUser ? league.route : "/session_verification")}
            >
              <div className="logo-circle">
                <img
                  src={leagueLogos[league.logoKey]}
                  alt={league.name}
                  className="league-logo"
                />
              </div>
              <p className="league-name">{league.name}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Slider de imágenes */}
      <div className="slider-container">
        <img
          src={sliderImages[currentSlide]}
          alt={`Slide ${currentSlide + 1}`}
          className={`slider-img ${blur ? "blur" : ""}`}
        />
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

export default MenuScreen;
