import React from 'react';
import PetCard from './PetCard';

function PetList({ pets, onPetClick, userRole, onDelete }) {
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
          />
        ))
      )}
    </div>
  );
}

export default PetList;