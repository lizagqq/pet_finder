import React from 'react';
import PetCard from './PetCard';

function PetList({ pets, onPetClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {pets.map(pet => (
        <PetCard key={pet.id} pet={pet} onPetClick={onPetClick} />
      ))}
    </div>
  );
}

export default PetList;