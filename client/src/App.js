import React, { useState, useEffect } from 'react';
import './App.css';
import PetForm from './components/PetForm';
import PetList from './components/PetList';
import Map from './components/Map';

function App() {
  const [pets, setPets] = useState([]);
  const [filter, setFilter] = useState({ type: '', location: '' });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pets');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Убедимся, что data — это массив
      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      setPets([]); // Устанавливаем пустой массив при ошибке
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Фильтрация только если pets — массив
  const filteredPets = Array.isArray(pets)
    ? pets.filter(pet =>
        pet.type.toLowerCase().includes(filter.type.toLowerCase()) &&
        pet.location.toLowerCase().includes(filter.location.toLowerCase())
      )
    : [];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Pet Finder</h1>
      <PetForm fetchPets={fetchPets} />
      <div className="mb-4">
        <input
          type="text"
          name="type"
          placeholder="Type (e.g., Dog, Cat)"
          value={filter.type}
          onChange={handleFilterChange}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filter.location}
          onChange={handleFilterChange}
          className="border p-2"
        />
      </div>
      <PetList pets={filteredPets} />
      <Map pets={filteredPets} />
    </div>
  );
}

export default App;