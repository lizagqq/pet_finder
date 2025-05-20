import React from 'react';
import PetCard from './PetCard';

function PetList({ pets, onPetClick, userRole, onDelete, onUpdatePet }) {
  const handleModerate = async (petId, data) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/pets/moderate/${petId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Не удалось обновить статус модерации');
      const updatedPet = await response.json();
      onUpdatePet(updatedPet); // Обновляем родительский компонент
    } catch (err) {
      console.error('Ошибка модерации:', err);
      alert('Ошибка при модерации: ' + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {pets.length === 0 ? (
        <p className="text-gray-600 col-span-full">Животных не найдено.</p>
      ) : (
        pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onPetClick={onPetClick}
            userRole={userRole}
            onDelete={onDelete}
            onModerate={handleModerate}
          />
        ))
      )}
    </div>
  );
}

export default PetList;