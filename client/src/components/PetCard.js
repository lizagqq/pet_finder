import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const PetCard = ({ pet, onPetClick, onDelete, userRole, onModerate }) => {
  const token = localStorage.getItem('token');
  const userId = token ? jwtDecode(token).id : 0;
  const isOwner = userId === pet.user_id;
  const isAdmin = userRole === 'admin';
  const isAuthenticated = !!token;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);

  // Загрузка комментариев
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/pets/${pet.id}/comments`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка загрузки комментариев');
        }
        const data = await response.json();
        setComments(data);
        // Отладка: логируем комментарии
        data.forEach((comment) =>
          console.log(`PetCard: comment.id=${comment.id}, comment.user_id=${comment.user_id}, userId=${userId}`)
        );
      } catch (error) {
        console.error('PetCard: Ошибка загрузки комментариев:', error);
        setCommentError(error.message);
      }
    };
    fetchComments();
  }, [pet.id]);

  // Отправка комментария
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError('Комментарий не может быть пустым');
      return;
    }
    if (!isAuthenticated) {
      setCommentError('Для добавления комментария необходимо авторизоваться');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pet_id: pet.id, content: newComment }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при добавления комментария');
      }
      const addedComment = await response.json();
      setComments([addedComment, ...comments]);
      setNewComment('');
      setCommentError(null);
      console.log(`PetCard: Добавлен комментарий, userId=${userId}, comment.user_id=${addedComment.user_id}`);
    } catch (error) {
      console.error('PetCard: Ошибка отправки комментария:', error);
      setCommentError(error.message);
    }
  };

  // Удаление комментария
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении комментария');
      }
      setComments(comments.filter((comment) => comment.id !== commentId));
      setCommentError(null);
      console.log(`PetCard: Удалён комментарий id=${commentId}, userId=${userId}`);
    } catch (error) {
      console.error('PetCard: Ошибка удаления комментария:', error);
      setCommentError(error.message);
    }
  };

  // Отладочный вывод
  console.log('PetCard: userId=', userId, 'pet.user_id=', pet.user_id, 'isOwner=', isOwner);
  console.log('PetCard: userRole=', userRole, 'isAdmin=', isAdmin);
  console.log('PetCard: isAuthenticated=', isAuthenticated);
  console.log('PetCard: pet=', pet);

  const handleDeleteClick = () => {
    if (isAdmin) {
      onDelete(pet.id, null);
    } else {
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteReason) {
      alert('Пожалуйста, выберите причину удаления.');
      return;
    }
    try {
      await onDelete(pet.id, deleteReason);
      setShowDeleteModal(false);
      setDeleteReason('');
    } catch (err) {
      console.error('PetCard: Ошибка удаления:', err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteReason('');
  };

  const handleModerate = (status) => {
    const comment = status === 'rejected' ? prompt('Введите причину отклонения (опционально):') : null;
    if (window.confirm(`Утвердить объявление как ${status}?`)) {
      onModerate(pet.id, { status_moderation: status, comment });
    }
  };

  const getModerationStatusInRussian = (status) => {
    switch (status) {
      case 'pending':
        return 'на модерации';
      case 'approved':
        return 'опубликовано';
      case 'rejected':
        return 'отклонено';
      default:
        return status || 'на модерации';
    }
  };

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
      {pet.image && (
        <div className="w-full rounded-lg overflow-hidden">
          <img
            src={pet.image}
            alt={pet.type}
            className="w-full max-h-64 object-contain rounded-lg"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-800 mt-4">{pet.type}</h3>
      <p className="text-sm text-gray-600">
        <strong>Статус:</strong>{' '}
        <span className={pet.status === 'Потеряно' ? 'text-red-500' : 'text-blue-500'}>{pet.status}</span>
      </p>
      <p className="text-sm text-gray-600"><strong>Описание:</strong> {pet.description}</p>
      <p className="text-sm text-gray-600"><strong>Координаты:</strong> {pet.lat}, {pet.lng}</p>
      <p className="text-sm text-gray-600">
        <strong>Кто дал объявление:</strong> {pet.name || 'Неизвестный пользователь'}
      </p>
      {pet.phone && isAuthenticated ? (
        <p className="text-sm text-gray-600"><strong>Телефон:</strong> {pet.phone}</p>
      ) : (
        <p className="text-sm text-gray-500">
          Для просмотра номера телефона необходимо авторизоваться
        </p>
      )}
      {pet.moderation_comment && (
        <p className="text-sm text-gray-600">
          <strong>Комментарий модератора:</strong> {pet.moderation_comment}
        </p>
      )}
      <p className="text-sm text-gray-600">
        <strong>Дата публикации:</strong> {formatDate(pet.created_at)}
      </p>
      
      {/* Секция комментариев */}
      <div className="mt-4">
        <h4 className="text-md font-semibold text-gray-800">Комментарии</h4>
        {commentError && <p className="text-sm text-red-500">{commentError}</p>}
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500">Комментариев пока нет</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {comments.map((comment) => (
              <li key={comment.id} className="text-sm text-gray-600 border-b border-gray-200 pb-2 flex justify-between items-start">
                <div>
                  <strong>{comment.name}:</strong> {comment.content} <br />
                  <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                </div>
                {(isAdmin || comment.user_id === userId) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Удалить
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {isAuthenticated && (
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Введите ваш комментарий..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <button
              type="submit"
              className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Отправить
            </button>
          </form>
        )}
      </div>

      <button
        onClick={() => onPetClick(pet)}
        className="mt-4 w-full py-2 px-4 bg-orange-400 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      {(isAdmin || isOwner) && (
        <button
          onClick={handleDeleteClick}
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

      {/* Модальное окно для выбора причины удаления */}
      {showDeleteModal && !isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Почему вы хотите удалить объявление?</h2>
            <select
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите причину</option>
              <option value="Животное нашлось">Животное нашлось</option>
              <option value="Животное так и не нашлось, я потерял надежду">Животное так и не нашлось, я потерял надежду</option>
              <option value="Другое">Другое</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetCard;