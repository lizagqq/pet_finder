import React, { useState, useEffect } from 'react';

function PetForm({ fetchPets, selectedCoords }) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    lat: '',
    lng: '',
    image: ''
  });
  const [error, setError] = useState(null);

  // Обновление координат при выборе на карте
  useEffect(() => {
    if (selectedCoords) {
      setFormData((prev) => ({
        ...prev,
        lat: selectedCoords[0].toString(), // lat
        lng: selectedCoords[1].toString()  // lng
      }));
    }
  }, [selectedCoords]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&geocode=${encodeURIComponent(location)}&format=json`
      );
      const data = await response.json();
      const pos = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos;
      if (pos) {
        const [lng, lat] = pos.split(' ').map(parseFloat);
        return { lat, lng };
      }
      throw new Error('Не удалось найти координаты для этого местоположения');
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let payload = { ...formData };
      // Если координаты не выбраны на карте, используем геокодирование
      if (!payload.lat && !payload.lng && payload.location) {
        const coords = await getCoordinates(payload.location);
        payload.lat = coords.lat;
        payload.lng = coords.lng;
      } else {
        payload.lat = payload.lat ? parseFloat(payload.lat) : null;
        payload.lng = payload.lng ? parseFloat(payload.lng) : null;
      }
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
      setFormData({ type: '', description: '', location: '', lat: '', lng: '', image: '' });
    } catch (error) {
      console.error('Ошибка добавления животного:', error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Тип животного</label>
        <input
          type="text"
          name="type"
          placeholder="Например, Собака, Кошка"
          value={formData.type}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
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
      <div>
        <label className="block text-sm font-medium">Местоположение</label>
        <input
          type="text"
          name="location"
          placeholder="Например, Ставрополь, ул. Ленина"
          value={formData.location}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>
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
      <div>
        <label className="block text-sm font-medium">URL изображения</label>
        <input
          type="text"
          name="image"
          placeholder="URL изображения"
          value={formData.image}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>
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