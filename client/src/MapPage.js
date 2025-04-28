import React, { useState, useEffect } from 'react';
import Map from './components/Map'; // Импортируем компонент карты

const MapPage = () => {
  const [pets, setPets] = useState([]); // Состояние для всех животных
  const [filterStatus, setFilterStatus] = useState(''); // Состояние для фильтра (Потеряно или Найдено)

  useEffect(() => {
    // Здесь ты можешь загружать список животных, например, через API
    const fetchPets = async () => {
      try {
        const response = await fetch('/api/pets'); // API для получения всех питомцев
        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error('Ошибка при загрузке данных о питомцах:', error);
      }
    };

    fetchPets();
  }, []);

  const handleFilterChange = (status) => {
    setFilterStatus(status); // Устанавливаем статус фильтра
  };

  // Фильтрация питомцев в зависимости от статуса
  const filteredPets = filterStatus
    ? pets.filter((pet) => pet.status === filterStatus)
    : pets; // Если фильтр не установлен, отображаем всех питомцев

  return (
    <div>
      <h1>Карта животных</h1>

      {/* Кнопки фильтрации */}
      <div>
        <button onClick={() => handleFilterChange('Потеряно')}>Потерянные животные</button>
        <button onClick={() => handleFilterChange('Найдено')}>Найденные животные</button>
        <button onClick={() => handleFilterChange('')}>Все животные</button> {/* Для отображения всех */}
      </div>

      {/* Логирование для проверки, какие питомцы передаются */}
      <div>
        <p>Отфильтрованные питомцы:</p>
        <pre>{JSON.stringify(filteredPets, null, 2)}</pre>
      </div>

      {/* Передаем в Map компонент отфильтрованные данные и фильтр */}
      <Map pets={filteredPets} filterStatus={filterStatus} />
    </div>
  );
};

export default MapPage;
