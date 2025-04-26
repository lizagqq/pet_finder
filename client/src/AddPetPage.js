import React from 'react';
import PetForm from './components/PetForm';

const AddPetPage = () => {
  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pets');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка загрузки животных:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Добавить животное</h1>
      <PetForm fetchPets={fetchPets} />
    </div>
  );
};

export default AddPetPage;