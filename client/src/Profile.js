import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Profile = ({ user: userFromProps }) => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: '', phone: '' });
  const [editingPet, setEditingPet] = useState(null);
  const [editedPet, setEditedPet] = useState({ type: '', description: '', lat: '', lng: '', image: '', status: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Profile: Токен:', token);
  
    if (!token) {
      setError('Вы не авторизованы. Пожалуйста, войдите в аккаунт.');
      return;
    }
  
    // Используем данные из ProtectedRoute, если они есть
    const decoded = jwtDecode(token); // Изменил jwt_decode на jwtDecode
    console.log('Profile: Декодированный токен:', decoded);
  
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось получить данные пользователя`);
        }
        const data = await response.json();
        // Добавляем role из токена, если его нет в ответе
        setUser({ ...data, role: decoded.role });
        setEditedUser({ name: data.name, phone: data.phone });
        console.log('Profile: Данные пользователя:', data);
      } catch (err) {
        console.error('Profile: Ошибка получения пользователя:', err);
        setError(err.message);
      }
    };
  
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pets/user', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось получить животных`);
        }
        const data = await response.json();
        setPets(data);
        console.log('Profile: Животные пользователя:', data);
      } catch (err) {
        console.error('Profile: Ошибка получения животных:', err);
        setError(err.message);
      }
    };
  
    fetchUser();
    fetchPets();
  }, []);

  const handleEditProfileClick = () => setIsEditingProfile(true);
  const handleSaveProfileClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка ${response.status}: Маршрут не найден`);
      }
      const data = await response.json();
      setUser(data);
      setIsEditingProfile(false);
      setError(null);
      alert('Данные профиля обновлены!');
    } catch (err) {
      console.error('Profile: Ошибка сохранения:', err);
      setError(err.message);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleEditPetClick = (pet) => {
    setEditingPet(pet.id);
    setEditedPet({ ...pet, status: pet.status || '' });
  };

  const handleSavePetClick = async (petId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы.');
      return;
    }

    if (!editedPet.status || !['Потеряно', 'Найдено'].includes(editedPet.status)) {
      setError('Пожалуйста, выберите допустимый статус (Потеряно или Найдено).');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editedPet),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось обновить животное`);
      }
      const updatedPet = await response.json();
      setPets(pets.map(pet => pet.id === petId ? updatedPet : pet));
      setEditingPet(null);
      setError(null);
      alert('Животное обновлено!');
    } catch (err) {
      console.error('Profile: Ошибка обновления животного:', err);
      setError(err.message);
    }
  };

  const handlePetChange = (e) => {
    const { name, value } = e.target;
    setEditedPet(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (petId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы.');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить это животное?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось удалить животное`);
      }
      setPets(pets.filter(pet => pet.id !== petId));
      console.log('Profile: Животное удалено:', petId);
      alert('Животное удалено!');
      setError(null);
    } catch (err) {
      console.error('Profile: Ошибка удаления:', err);
      setError(err.message);
    }
  };

  const handleRetry = () => {
    setError(null);
    setUser(null);
    setPets([]);
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setUser(data); setEditedUser({ name: data.name, phone: data.phone }); })
        .catch(err => setError(err.message));
      fetch('http://localhost:5000/api/pets/user', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setPets(data))
        .catch(err => setError(err.message));
    }
  };

  if (error) return (
    <div className="container mx-auto p-4">
      <p className="text-red-500 text-sm mb-4">{error}</p>
      <button onClick={handleRetry} className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Повторить попытку</button>
    </div>
  );

  if (!user) return (
    <div className="container mx-auto p-4">
      <p className="text-gray-600">Загрузка...</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Личный кабинет</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Профиль</h2>
            {isEditingProfile ? (
              <>
                <div className="mb-4">
                  <label className="block text-gray-600 mb-1">Имя:</label>
                  <input type="text" name="name" value={editedUser.name || ''} onChange={handleProfileChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Введите имя" />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 mb-1">Телефон:</label>
                  <input type="text" name="phone" value={editedUser.phone || ''} onChange={handleProfileChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Введите телефон" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveProfileClick} className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Сохранить
                  </button>
                  <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600"><strong>Имя:</strong> {user.name}</p>
                <p className="text-gray-600"><strong>Телефон:</strong> {user.phone}</p>
                <p className="text-gray-600"><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                <button onClick={handleEditProfileClick} className="mt-4 w-full py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Редактировать профиль
                </button>
                <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/login'; }} className="mt-2 w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Выйти
                </button>
              </>
            )}
          </div>
        </div>

        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Мои объявления</h2>
              <Link to="/add-pet">
                <button className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Добавить животное
                </button>
              </Link>
            </div>
            {pets.length === 0 ? (
              <p className="text-gray-600">У вас пока нет добавленных животных.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
                    {editingPet === pet.id ? (
                      <>
                        <div className="mb-4">
                          <label className="block text-gray-600 mb-1">Тип:</label>
                          <input type="text" name="type" value={editedPet.type || ''} onChange={handlePetChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-600 mb-1">Описание:</label>
                          <textarea name="description" value={editedPet.description || ''} onChange={handlePetChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-600 mb-1">Широта:</label>
                          <input type="text" name="lat" value={editedPet.lat || ''} onChange={handlePetChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-600 mb-1">Долгота:</label>
                          <input type="text" name="lng" value={editedPet.lng || ''} onChange={handlePetChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-600 mb-1">Изображение URL:</label>
                          <input type="text" name="image" value={editedPet.image || ''} onChange={handlePetChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-600 mb-1">Статус:</label>
                          <select name="status" value={editedPet.status || ''} onChange={handlePetChange} className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Выберите статус</option>
                            <option value="Потеряно">Потеряно</option>
                            <option value="Найдено">Найдено</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSavePetClick(pet.id)} className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Сохранить
                          </button>
                          <button onClick={() => setEditingPet(null)} className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            Отмена
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-800">{pet.type}</h3>
                        <p className="text-sm text-gray-600"><strong>Статус:</strong> <span className={pet.status === 'Потеряно' ? 'text-red-500' : 'text-blue-500'}>{pet.status}</span></p>
                        <p className="text-sm text-gray-600"><strong>Описание:</strong> {pet.description}</p>
                        <p className="text-sm text-gray-600"><strong>Координаты:</strong> {pet.lat}, {pet.lng}</p>
                        {pet.image && <img src={pet.image} alt={pet.type} className="mt-2 w-full h-32 object-cover rounded-lg" onError={(e) => (e.target.style.display = 'none')} />}
                        <div className="mt-2 flex gap-2">
                          <button onClick={() => handleEditPetClick(pet)} className="flex-1 py-2 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                            Редактировать
                          </button>
                          <button onClick={() => handleDelete(pet.id)} className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"></path></svg>
                            Удалить
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;