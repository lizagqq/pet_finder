import React, { useState, useEffect } from 'react';
import PetList from './components/PetList';

const PetsListPage = () => {
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pets');
        if (!response.ok) {
          throw new Error('Ошибка загрузки списка животных');
        }
        const data = await response.json();
        console.log('PetsListPage.js: Загружены животные', data);
        setPets(data);
      } catch (error) {
        console.error('PetsListPage.js: Ошибка:', error);
        setError(error.message);
      }
    };
    fetchPets();
  }, []);

  const filteredPets = filter === 'all' ? pets : pets.filter(pet => pet.type.toLowerCase() === filter);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Список потерянных животных</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="filter">
          Фильтр по типу:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full md:w-48"
        >
          <option value="all">Все</option>
          <option value="собака">Собака</option>
          <option value="кошка">Кошка</option>
        </select>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {filteredPets.length === 0 && !error ? (
        <p>Нет зарегистрированных животных.</p>
      ) : (
        <PetList pets={filteredPets} />
      )}
    </div>
  );
};

export default PetsListPage;