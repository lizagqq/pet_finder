import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [error, setError] = useState(null);

  // Загрузка данных пользователя и животных
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Profile: Токен:', token);

    if (!token) {
      setError('Вы не авторизованы. Пожалуйста, войдите в аккаунт.');
      return;
    }

    // Получение данных пользователя
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось получить данные пользователя`);
        }
        const data = await response.json();
        setUser(data);
        console.log('Profile: Данные пользователя:', data);
      } catch (err) {
        console.error('Profile: Ошибка получения пользователя:', err);
        setError(err.message);
      }
    };

    // Получение животных пользователя
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pets/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось получить животных`);
        }
        const data = await response.json();
        setPets(data);
        console.log('Profile: Животные пользователя:', data);
      } catch (err) {
        console.error('Profile: Ошибка получения животных:', err);
        setError(err.message);
      }
    };

    fetchUser();
    fetchPets();
  }, []);

  // Удаление животного
  const handleDelete = async (petId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Вы не авторизованы.');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить это животное?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось удалить животное`);
      }

      setPets(pets.filter((pet) => pet.id !== petId));
      console.log('Profile: Животное удалено:', petId);
      alert('Животное удалено!');
    } catch (err) {
      console.error('Profile: Ошибка удаления:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Личный кабинет</h1>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Информация о пользователе */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Профиль</h2>
            <p className="text-gray-600"><strong>Имя:</strong> {user.name}</p>
            <p className="text-gray-600"><strong>Телефон:</strong> {user.phone}</p>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="mt-4 w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Список животных */}
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Мои животные</h2>
            {pets.length === 0 ? (
              <p className="text-gray-600">У вас пока нет добавленных животных.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-800">{pet.type}</h3>
                    <p className="text-sm text-gray-600"><strong>Статус:</strong> {pet.status}</p>
                    <p className="text-sm text-gray-600"><strong>Описание:</strong> {pet.description}</p>
                    <p className="text-sm text-gray-600"><strong>Координаты:</strong> {pet.lat}, {pet.lng}</p>
                    {pet.image && (
                      <img
                        src={pet.image}
                        alt={pet.type}
                        className="mt-2 w-full h-32 object-cover rounded-lg"
                        onError={(e) => (e.target.style.display = 'none')}
                      />
                    )}
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="mt-2 w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;