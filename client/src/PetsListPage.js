import React, { useState, useEffect } from 'react';
import PetList from './components/PetList';

const PetsListPage = () => {
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserAndPets = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен отсутствует. Пожалуйста, войдите в систему.');

        // Получение данных пользователя для определения роли
        const userResponse = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!userResponse.ok) throw new Error('Не удалось загрузить данные пользователя');
        const userData = await userResponse.json();
        setUserRole(userData.role);

        // Получение списка объявлений
        const endpoint = userRole === 'admin' ? '/api/pets/admin' : '/api/pets';
        const petsResponse = await fetch(`http://localhost:5000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!petsResponse.ok) throw new Error('Не удалось загрузить объявления');
        const petsData = await petsResponse.json();
        console.log('PetsListPage.js: Загружены животные', petsData);
        setPets(petsData);
      } catch (error) {
        console.error('PetsListPage.js: Ошибка:', error);
        setError(error.message);
      }
    };

    fetchUserAndPets();
  }, [userRole]); // Перезапуск при изменении роли

  const filteredPets = filter === 'all' ? pets : pets.filter(pet => pet.type.toLowerCase() === filter.toLowerCase());

  const handleDelete = async (petId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Не удалось удалить объявление');
      setPets(pets.filter(pet => pet.id !== petId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePet = (updatedPet) => {
    setPets(pets.map(pet => (pet.id === updatedPet.id ? updatedPet : pet)));
  };

  const handlePetClick = (pet) => {
    console.log('Показать на карте:', pet);
  };

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
        <PetList
          pets={filteredPets}
          onPetClick={handlePetClick}
          userRole={userRole}
          onDelete={handleDelete}
          onUpdatePet={handleUpdatePet}
        />
      )}
    </div>
  );
};

export default PetsListPage;