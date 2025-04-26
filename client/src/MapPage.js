import React, { useState, useEffect } from 'react';
import Map from './components/Map';


const MapPage = () => {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pets');
        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error('Ошибка загрузки животных:', error);
      }
    };
    fetchPets();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Карта потерянных животных</h1>
      <Map pets={pets} />
    </div>
  );
};

export default MapPage;