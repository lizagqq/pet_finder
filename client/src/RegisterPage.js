import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RegisterPage = () => {
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Получить параметр redirect из URL
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('redirect') || '/';

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка регистрации');
      }
      alert('Регистрация успешна! Теперь войдите в систему.');
      setIsLoginForm(true);
      setName('');
      setPhone('');
      setPassword('');
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Stored token:', localStorage.getItem('token'));
      console.log('Stored user:', localStorage.getItem('user'));
      setPhone('');
      setPassword('');
      setError(null);
      alert('Вход успешен!');
      navigate(redirectTo);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{isLoginForm ? 'Вход' : 'Регистрация'}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoginForm ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium">Номер телефона:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="+7-XXX-XXX-XX-XX"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Войти
          </button>
          <p className="mt-4 text-center">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={() => {
                setIsLoginForm(false);
                setError(null);
                setPhone('');
                setPassword('');
              }}
              className="text-blue-500 hover:underline"
            >
              Зарегистрируйтесь
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium">Имя:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Номер телефона:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="+7-XXX-XXX-XX-XX"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Зарегистрироваться
          </button>
          <p className="mt-4 text-center">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={() => {
                setIsLoginForm(true);
                setError(null);
                setPhone('');
                setPassword('');
              }}
              className="text-blue-500 hover:underline"
            >
              Войдите
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default RegisterPage;