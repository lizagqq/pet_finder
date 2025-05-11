import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLoginSubmit = async (e, phone, password) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setIsModalOpen(false);
      alert('Вход успешен!');
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Вы вышли из аккаунта');
    navigate('/');
  };

  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Pet Finder
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:underline">
            Главная
          </Link>
          <Link to="/map" className="hover:underline">
            Карта питомцев
          </Link>
          <Link to="/add-pet" className="hover:underline">
            Добавить
          </Link>
          
          <Link to="/about" className="hover:underline">
            О проекте
          </Link>
          {isAuthenticated && (
            <Link to="/profile" className="hover:underline">
              Профиль
            </Link>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Выход
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вход
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Вход</h2>
        <form
          onSubmit={(e) => {
            const phone = e.target.phone.value;
            const password = e.target.password.value;
            handleLoginSubmit(e, phone, password);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Номер телефона:</label>
            <input
              type="text"
              name="phone"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="+7-XXX-XXX-XX-XX"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Пароль:</label>
            <input
              type="password"
              name="password"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Войти
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Нет аккаунта?{' '}
          <Link
            to="/register"
            className="text-blue-500 hover:underline"
            onClick={() => setIsModalOpen(false)}
          >
            Зарегистрируйтесь
          </Link>
        </p>
        <button
          onClick={() => setIsModalOpen(false)}
          className="mt-4 w-full py-3 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Закрыть
        </button>
      </Modal>
    </nav>
  );
};

export default Navbar;