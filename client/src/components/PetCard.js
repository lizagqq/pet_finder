import React from 'react';

const PetCard = ({ pet, onPetClick, onDelete, userRole, onModerate }) => {
  const userId = parseInt(localStorage.getItem('userId')) || 0;
  const isOwner = userId === pet.user_id;
  const isAdmin = userRole === 'admin';

  // Отладочный вывод
  console.log('PetCard: userId=', userId, 'pet.user_id=', pet.user_id, 'isOwner=', isOwner);
  console.log('PetCard: userRole=', userRole, 'isAdmin=', isAdmin);
  console.log('PetCard: pet=', pet);

  const handleDelete = () => {
    if (!window.confirm('Вы уверены, что хотите удалить это животное?')) return;
    onDelete(pet.id);
  };

  const handleModerate = (status) => {
    const comment = status === 'rejected' ? prompt('Введите причину отклонения (опционально):') : null;
    if (window.confirm(`Утвердить объявление как ${status}?`)) {
      onModerate(pet.id, { status_moderation: status, comment });
    }
  };

  

  // Функция для форматирования даты на русском
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-medium text-gray-800">{pet.type}</h3>
      <p className="text-sm text-gray-600">
        <strong>Статус:</strong>{' '}
        <span className={pet.status === 'Потеряно' ? 'text-red-500' : 'text-blue-500'}>{pet.status}</span>
      </p>
      <p className="text-sm text-gray-600"><strong>Описание:</strong> {pet.description}</p>
      <p className="text-sm text-gray-600"><strong>Координаты:</strong> {pet.lat}, {pet.lng}</p>
      <p className="text-sm text-gray-600">
        <strong>Кто дал объявление:</strong> {pet.name || 'Неизвестный пользователь'}
      </p>
      {pet.phone && <p className="text-sm text-gray-600"><strong>Телефон:</strong> {pet.phone}</p>}
      
      {pet.moderation_comment && (
        <p className="text-sm text-gray-600">
          <strong>Комментарий модератора:</strong> {pet.moderation_comment}
        </p>
      )}
      <p className="text-sm text-gray-600">
        <strong>Дата публикации:</strong> {formatDate(pet.created_at)}
      </p>
      {pet.image && (
        <div className="mt-2 w-full rounded-lg overflow-hidden">
          <img
            src={pet.image}
            alt={pet.type}
            className="w-full max-h-64 object-contain rounded-lg"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      )}
      <button
        onClick={() => onPetClick(pet)}
        className="mt-2 w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Показать на карте
      </button>
      {isAdmin && pet.status_moderation !== 'approved' && (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handleModerate('approved')}
            className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Утвердить
          </button>
          <button
            onClick={() => handleModerate('rejected')}
            className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Отклонить
          </button>
        </div>
      )}
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