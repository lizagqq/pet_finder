import React from 'react';

const PetCard = ({ pet }) => {
  return (
    <div className="border border-gray-300 rounded p-4">
      <h2 className="text-xl font-bold">{pet.type}</h2>
      <p className="text-gray-700">{pet.description}</p>
      <p className="text-sm text-gray-500">Местоположение: {pet.location}</p>
      {pet.image && (
        <img
          src={pet.image}
          alt={pet.type}
          className="w-full h-48 object-cover mt-2 rounded"
        />
      )}
    </div>
  );
};

export default PetCard;