import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Map from './components/Map';

const MapPage = () => {
  const [pets, setPets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const location = useLocation();

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
        const response = await fetch('http://localhost:5000/api/pets');
        const data = await response.json();
        console.log('Fetched pets:', data);
        setPets(data);
      } catch (error) {
        console.error('Ошибка при загрузке данных о питомцах:', error);
      }
    };
    fetchPets();
  }, []);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    console.log('Filter changed to:', status);
  };

  // Фильтрация питомцев
  const filteredPets = filterStatus
    ? pets.filter((pet) => pet.status === filterStatus)
    : pets;
  console.log('Filtered pets:', filteredPets);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Карта животных</h1>

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

      {/* Компонент карты */}
      <Map pets={filteredPets} filterStatus={filterStatus} />
    </div>
  );
};

export default MapPage;