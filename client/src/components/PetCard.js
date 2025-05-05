import React from 'react';

const PetCard = ({ pet, onPetClick }) => {
  const handleClick = () => {
    onPetClick(pet);
  };

  return (
    <div
      className="border border-gray-300 rounded p-4 shadow-md hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <h2 className="text-xl font-bold text-gray-800">{pet.type}</h2>
      <p className="text-gray-600 mt-2">{pet.description}</p>
      <p className="text-sm text-gray-500 mt-1">
        Статус: <span className={pet.status === 'Потеряно' ? 'text-red-500' : 'text-blue-500'}>{pet.status}</span>
      </p>
      <p className="text-sm text-gray-500 mt-1">Контакт: {pet.phone}</p>
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