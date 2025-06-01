import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MenuScreen from './components/MenuScreen';
import TablaClasificacionLaLiga from './components/TablaClasificacionLaLiga';
import Login from './components/Login';
import Register from './components/Register';
import SessionVerification from './components/SessionVerification';
import FavoritosScreen from './components/FavoritosScreen';
import EstadisticasEquipo from './components/EstadisticasEquipo';
import PlantillaEquipo from './components/PlantillaEquipo';
import  PlayerStatsScreen  from './components/PlayerStatsScreen';
import TablaClasificacionPremier from './components/TablaClasificacionPremier';
import TablaClasificacionSerieA from './components/TablaClasificacionSerieA';
import TablaClasificacionBundesliga from './components/TablaClasificacionBundesliga';
import TablaClasificacionLigue1 from './components/TablaClasificacionLigue1';
import TablaClasificacionChampions from './components/TablaClasificacionChampions';
import TablaClasificacionEuropaLeague from './components/TablaClasificacionEuropaLeague';

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<MenuScreen />} />
    <Route path="/la_liga" element={<TablaClasificacionLaLiga />} />
    <Route path="/tabla1" element={<TablaClasificacionPremier/>} />
    <Route path="/tabla3" element={<TablaClasificacionSerieA/>} />
    <Route path="/tabla4" element={<TablaClasificacionBundesliga/>} />
    <Route path="/tabla5" element={<TablaClasificacionLigue1/>} />
    <Route path="/tabla6" element={<TablaClasificacionChampions/>} />
    <Route path="/tabla7" element={<TablaClasificacionEuropaLeague/>} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/session_verification" element={<SessionVerification />} />
    <Route path="/favoritos" element={<FavoritosScreen />} />
    <Route path="/estadisticas/:nombreEquipo" element={<EstadisticasEquipo />} />
    <Route path="/plantilla/:nombreEquipo" element={<PlantillaEquipo />} />
    {/* Ruta para estadísticas de jugador */}
    <Route
      path="/estadisticas_jugador/:playerId"
      element={<PlayerStatsScreen
        playerId={parseInt(window.location.pathname.split('/').pop() || '0')}
        csvUrl="/data/estadisticas_actualizadas_LaLiga.csv"
      />}
    />
  </Routes>
);

export default App;