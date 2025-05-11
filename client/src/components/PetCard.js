import React from 'react';

const PetCard = ({ pet, onPetClick, onDelete, userRole }) => {
  const userId = parseInt(localStorage.getItem('userId')) || 0;
  const isOwner = userId === pet.user_id;
  const isAdmin = userRole === 'admin'; // Используем пропс userRole

  // Отладочный вывод
  console.log('PetCard: userId=', userId, 'pet.user_id=', pet.user_id, 'isOwner=', isOwner);
  console.log('PetCard: userRole=', userRole, 'isAdmin=', isAdmin);

  const handleDelete = () => {
    if (!window.confirm('Вы уверены, что хотите удалить это животное?')) return;
    onDelete(pet.id);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-medium text-gray-800">{pet.type}</h3>
      <p className="text-sm text-gray-600">
        <strong>Статус:</strong> <span className={pet.status === 'Потеряно' ? 'text-red-500' : 'text-blue-500'}>{pet.status}</span>
      </p>
      <p className="text-sm text-gray-600"><strong>Описание:</strong> {pet.description}</p>
      <p className="text-sm text-gray-600"><strong>Координаты:</strong> {pet.lat}, {pet.lng}</p>
      {pet.phone && <p className="text-sm text-gray-600"><strong>Телефон:</strong> {pet.phone}</p>}
      {pet.image && <img src={pet.image} alt={pet.type} className="mt-2 w-full h-32 object-cover rounded-lg" onError={(e) => (e.target.style.display = 'none')} />}
      <button
        onClick={() => onPetClick(pet)}
        className="mt-2 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Показать на карте
      </button>
      {isAdmin && (
        <button
          onClick={handleDelete}
          className={`mt-2 w-full py-2 px-4 text-white rounded-lg hover:bg-opacity-80 transition-colors flex items-center justify-center ${
            isAdmin && !isOwner ? 'bg-purple-500 hover:bg-purple-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18"></path>
          </svg>
          Удалить
        </button>
      )}
      
    </div>
  );
};

export default PetCard;