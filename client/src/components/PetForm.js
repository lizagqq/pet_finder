import React, { useState, useEffect } from 'react';

function PetForm({ fetchPets, selectedCoords }) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    status: '',
    lat: '',
    lng: '',
    image: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCoords) {
      console.log('PetForm: Обновлены координаты:', selectedCoords);
      setFormData((prev) => ({
        ...prev,
        lat: selectedCoords[0].toString(),
        lng: selectedCoords[1].toString(),
      }));
    }
  }, [selectedCoords]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem('token');
    console.log('PetForm: Токен:', token);

    if (!token) {
      setError('Вы не авторизованы. Пожалуйста, войдите в аккаунт.');
      return;
    }

    if (!formData.lat || !formData.lng) {
      setError('Пожалуйста, укажите место на карте.');
      return;
    }

    try {
      const payload = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      };

      const response = await fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PetForm: Ошибка от сервера:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      await fetchPets();
      setFormData({ type: '', description: '', status: '', lat: '', lng: '', image: '' });
      alert('Животное добавлено!');
    } catch (error) {
      console.error('PetForm: Ошибка добавления животного:', error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Тип животного</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Выберите тип</option>
          <option value="Собака">Собака</option>
          <option value="Кошка">Кошка</option>
          <option value="Птица">Птица</option>
          <option value="Грызун">Грызун</option>
          <option value="Другое">Другое</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Статус</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Выберите статус</option>
          <option value="Найдено">Найдено</option>
          <option value="Потеряно">Потеряно</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Описание</label>
        <textarea
          name="description"
          placeholder="Описание животного (цвет, порода, особые приметы)"
          value={formData.description}
          onChange={handleChange}
          required
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          rows="4"
        />
      </div>

      <div>
        <p className="text-sm text-gray-600">📍 Укажите на карте место, где было найдено или потеряно животное.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Широта (выбрано на карте)</label>
        <input
          type="text"
          name="lat"
          value={formData.lat}
          readOnly
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Долгота (выбрано на карте)</label>
        <input
          type="text"
          name="lng"
          value={formData.lng}
          readOnly
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">URL изображения</label>
        <input
          type="text"
          name="image"
          placeholder="Вставьте ссылку на изображение"
          value={formData.image}
          onChange={handleChange}
          className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Добавить животное
      </button>
    </form>
  );
}

export default PetForm;