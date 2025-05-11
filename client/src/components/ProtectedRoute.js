import React from 'react';
import { Navigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  console.log('ProtectedRoute: Токен:', token);

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} />;
  }

  try {
    const decoded = jwt_decode(token);
    const userRole = decoded.role;
    console.log('ProtectedRoute: Декодированный role:', userRole);

    // Проверяем роль, если requiredRole указан
    if (requiredRole && userRole !== requiredRole) {
      console.log('ProtectedRoute: Роль не соответствует, перенаправление...');
      return <Navigate to="/" />;
    }

    // Передаем данные пользователя в дочерний компонент
    return React.cloneElement(children, { user: decoded });
  } catch (error) {
    console.error('Ошибка декодирования токена:', error);
    // Если токен недействителен, удаляем его и перенаправляем на логин
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;