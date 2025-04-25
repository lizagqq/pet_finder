import React from 'react';

function PetCard({ pet }) {
  return (
    <div className="border p-4 rounded shadow">
      {pet.image && <img src={pet.image} alt={pet.type} className="w-full h-48 object-cover mb-2" />}
      <h2 className="text-xl font-bold">{pet.type}</h2>
      <p>{pet.description}</p>
      <p><strong>Location:</strong> {pet.location}</p>
    </div>
  );
}

export default PetCard;