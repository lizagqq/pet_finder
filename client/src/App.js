import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import MapPage from './MapPage';
import AddPetPage from './AddPetPage';
import About from './About';
import PetsListPage from './PetsListPage';
import RegisterPage from './RegisterPage';
import Profile from './Profile';

// Компонент для защиты маршрутов
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute: Токен:', token);
  return token ? children : <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} />;
};

const App = () => {
  console.log('App: Маршруты инициализированы');
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route
            path="/add-pet"
            element={
              <ProtectedRoute>
                <AddPetPage />
              </ProtectedRoute>
            }
          />
          <Route path="/pets" element={<PetsListPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<RegisterPage />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="container mx-auto p-4"><h1 className="text-2xl font-bold">404 - Страница не найдена</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;