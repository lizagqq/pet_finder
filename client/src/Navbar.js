// import React from 'react';
// import { Link } from 'react-router-dom';

// const Navbar = () => {
//   return (
//     <nav className="bg-blue-500 p-4">
//       <div className="container mx-auto flex justify-between items-center">
//         <Link to="/" className="text-white text-xl font-bold">
//           Pet Finder
//         </Link>
//         <div className="space-x-4">
//           <Link to="/" className="text-white hover:underline">
//             Главная
//           </Link>
//           <Link to="/map" className="text-white hover:underline">
//             Карта
//           </Link>
//           <Link to="/add-pet" className="text-white hover:underline">
//             Добавить
//           </Link>
//           <Link to="/pets" className="text-white hover:underline">
//             Все потерянные животные
//           </Link>
//           <Link to="/about" className="text-white hover:underline">
//             О проекте
//           </Link>
//           <Link>
//           <Link to="/login" className="hover:underline">Вход</Link>
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

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
        body: JSON.stringify({ phone, password })
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
    navigate('/');
  };

  return (
    <nav className="bg-blue-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Pet Finder</Link>
        <div>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Выход
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        <h2 className="text-2xl font-bold mb-4">Вход</h2>
        <form
          onSubmit={(e) => {
            const phone = e.target.phone.value;
            const password = e.target.password.value;
            handleLoginSubmit(e, phone, password);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium">Номер телефона:</label>
            <input
              type="text"
              name="phone"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="+7-XXX-XXX-XX-XX"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Пароль:</label>
            <input
              type="password"
              name="password"
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
        </form>
        <p className="mt-4 text-center">
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
          className="mt-4 w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Закрыть
        </button>
      </Modal>
    </nav>
  );
};

export default Navbar;