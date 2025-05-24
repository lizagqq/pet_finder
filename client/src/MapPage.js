import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Map from './components/Map';
import PetList from './components/PetList';

const MapPage = () => {
  const [pets, setPets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Получение роли пользователя из токена
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        console.log('MapPage: Декодированный токен:', decoded);
      } catch (err) {
        console.error('MapPage: Ошибка декодирования токена:', err);
        setError('Ошибка авторизации. Пожалуйста, войдите заново.');
      }
    } else {
      setUserRole(null); // Неавторизованный пользователь
      console.log('MapPage: Токен отсутствует, пользователь не авторизован');
    }
  }, []);

  // Обработка URL-параметра filter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const filter = queryParams.get('filter');
    if (filter === 'lost') setFilterStatus('Потеряно');
    else if (filter === 'founded') setFilterStatus('Найдено');
    else setFilterStatus('');
    console.log('URL filter:', filter, 'filterStatus:', filterStatus);
  }, [location.search]);

  // Загрузка животных
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await fetch(`http://localhost:5000/api/pets${filterStatus ? `?status=${filterStatus}` : ''}`, {
          headers,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось получить питомцев`);
        }
        const data = await response.json();
        console.log('MapPage: Полученные данные питомцев:', data);
        setPets(data);
        setError(null); // Сбрасываем ошибку при успешной загрузке
      } catch (error) {
        console.error('MapPage: Ошибка при загрузке данных о питомцах:', error);
        setError(error.message);
      }
    };
    fetchPets();
  }, [filterStatus]); // Добавляем filterStatus в зависимости, чтобы обновлять данные при изменении фильтра

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    console.log('Filter changed to:', status);
  };

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
  };

  // Фильтрация питомцев на клиенте (оставляем как резервную, но сервер теперь фильтрует)
  const filteredPets = filterStatus
    ? pets.filter((pet) => pet.status === filterStatus)
    : pets;
  console.log('Filtered pets:', filteredPets);

  if (error) return (
    <div className="container mx-auto p-4">
      <p className="text-red-500 text-sm mb-4">{error}</p>
      <button onClick={() => setError(null)} className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Повторить попытку</button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Карта и список животных</h1>

      {/* Кнопки фильтрации */}
      <div className="mb-4 space-x-2">
        <button
          onClick={() => handleFilterChange('Потеряно')}
          className={`px-4 py-2 rounded ${filterStatus === 'Потеряно' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Потерянные животные
        </button>
        <button
          onClick={() => handleFilterChange('Найдено')}
          className={`px-4 py-2 rounded ${filterStatus === 'Найдено' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
        >
          Найденные животные
        </button>
        <button
          onClick={() => handleFilterChange('')}
          className={`px-4 py-2 rounded ${filterStatus === '' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Все животные
        </button>
      </div>

      {/* Карта */}
      <div className="mb-8">
        <Map pets={filteredPets} selectedPet={selectedPet} />
      </div>

      {/* Список животных */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Список животных</h2>
        <PetList
          pets={filteredPets}
          onPetClick={handlePetClick}
          userRole={userRole}
          onDelete={handleDelete} // Передаем функцию удаления
        />
      </div>
    </div>
  );
};

// Функция удаления
const handleDelete = async (petId, reason) => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Вы не авторизованы.');
    return;
  }

  if (!window.confirm('Вы уверены, что хотите удалить это животное?')) return;

  try {
    const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }), // Передаем причину удаления
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось удалить животное`);
    }
    setPets((prevPets) => prevPets.filter((pet) => pet.id !== petId));
    alert('Животное удалено!');
  } catch (err) {
    console.error('MapPage: Ошибка удаления:', err);
    alert(err.message);
  }
};

export default MapPage;