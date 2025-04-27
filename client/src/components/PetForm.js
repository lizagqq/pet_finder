import React, { useState, useEffect } from 'react';

function PetForm({ fetchPets, selectedCoords }) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    status: '', // Добавили статус
    lat: '',
    lng: '',
    image: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCoords) {
      setFormData((prev) => ({
        ...prev,
        lat: selectedCoords[0].toString(),
        lng: selectedCoords[1].toString()
      }));
    }
  }, [selectedCoords]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Проверяем, выбраны ли координаты
    if (!formData.lat || !formData.lng) {
      setError('Пожалуйста, укажите место на карте.');
      return;
    }

    try {
      const payload = { 
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      };

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json();
      fetchPets();
      setFormData({ type: '', description: '', status: '', lat: '', lng: '', image: '' });
    } catch (error) {
      console.error('Ошибка добавления животного:', error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      
      {/* Выбор типа животного */}
      <div>
        <label className="block text-sm font-medium">Тип животного</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Выберите тип</option>
          <option value="Собака">Собака</option>
          <option value="Кошка">Кошка</option>
          <option value="Птица">Птица</option>
          <option value="Грызун">Грызун</option>
          <option value="Другое">Другое</option>
        </select>
      </div>

      {/* Выбор статуса животного */}
      <div>
        <label className="block text-sm font-medium">Статус</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Выберите статус</option>
          <option value="Найдено">Найдено</option>
          <option value="Потеряно">Потеряно</option>
        </select>
      </div>

      {/* Описание */}
      <div>
        <label className="block text-sm font-medium">Описание</label>
        <textarea
          name="description"
          placeholder="Описание животного"
          value={formData.description}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {}
      <div>
        <p className="text-gray-700">📍 Укажите на карте место, где было найдено или потеряно животное.</p>
      </div>

      {/* Координаты */}
      <div>
        <label className="block text-sm font-medium">Широта (выбрано на карте)</label>
        <input
          type="text"
          name="lat"
          value={formData.lat}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Долгота (выбрано на карте)</label>
        <input
          type="text"
          name="lng"
          value={formData.lng}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
      </div>

      {/* Фото */}
      <div>
        <label className="block text-sm font-medium">URL изображения</label>
        <input
          type="text"
          name="image"
          placeholder="Вставьте ссылку на изображение"
          value={formData.image}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Кнопка отправки */}
      <button
        type="submit"
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Добавить животное
      </button>
    </form>
  );
}

export default PetForm;
