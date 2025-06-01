import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail } from "firebase/auth";
import { leagues } from "../data/leagues";
import { leagueLogos } from "../assets/leagueLogos";
import futechLogo from "../assets/futech_logo.png";
import googlePlayLogo from "../assets/google_play_logo.png";
import iconoFavoritos from "../assets/icono_favoritos.png";
import iconoUsuario from "../assets/icono_usuario.png";
import "./SessionVerification.css";

const SessionVerification: React.FC = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCompetitions, setShowCompetitions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUserFlag = Boolean(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (!user) navigate("/login", { replace: true });
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Por favor, ingresa tu correo.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Te hemos enviado un enlace para restablecer tu contraseña.");
    } catch (e: any) {
      setError(e.message);
    }
    setIsLoading(false);
  };

  if (!currentUser) return <div>Cargando...</div>;

  return (
    <div className="menu-screen flex flex-col min-h-screen">
      {/* NAVBAR */}
      <header className="navbar" ref={dropdownRef}>
        <div className="logo" onClick={() => navigate("/")}>
          <img src={futechLogo} alt="Futech Logo" className="logo-img" />
          <span className="logo-text">Futech</span>
        </div>
        <div className="nav-actions">
          <button
            className="btn-comp"
            onClick={() => setShowCompetitions((prev) => !prev)}
          >
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
                        navigate(currentUserFlag ? league.route : "/session_verification");
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
          {currentUserFlag && (
            <img
              src={iconoFavoritos}
              alt="Favoritos"
              className="icon"
              onClick={() => navigate("/favoritos")}
            />
          )}
          <img
            src={iconoUsuario}
            alt="Usuario"
            className="icon"
            onClick={handleLogout}
          />
          <img
            src={googlePlayLogo}
            alt="Google Play"
            className="icon"
            onClick={() =>
              window.open(
                "https://play.google.com/store/apps/your-app-id",
                "_blank"
              )
            }
          />
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-grow content-spacing session-content">
        <div className="session-container">
          <h2>Bienvenido, {currentUser.email}</h2>

          <button className="menu-button" onClick={() => navigate("/", { replace: true })}>
            Ir al Menú
          </button>

          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>

          <div className="password-reset">
            <button className="forgot-password" onClick={() => setError(null)}>
              ¿Olvidaste tu contraseña?
            </button>

            {error && (
              <p className={error.includes("restablecer") ? "success-message" : "error-message"}>
                {error}
              </p>
            )}

            {error === null && (
              <>
                <input
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="email-input"
                />
                <button
                  className="reset-button"
                  onClick={handlePasswordReset}
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Restablecer Contraseña"}
                </button>
              </>
            )}
          </div>
        </div>
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

export default SessionVerification;
