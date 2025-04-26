import React, { useState } from 'react';

function PetForm({ fetchPets }) {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    lat: '',
    lng: '',
    image: ''
  });
  const [error, setError] = useState(null);

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
      if (formData.location && !formData.lat && !formData.lng) {
        const coords = await getCoordinates(formData.location);
        payload.lat = coords.lat;
        payload.lng = coords.lng;
      } else {
        payload.lat = formData.lat ? parseFloat(formData.lat) : null;
        payload.lng = formData.lng ? parseFloat(formData.lng) : null;
      }
      const response = await fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      fetchPets();
      setFormData({ type: '', description: '', location: '', lat: '', lng: '', image: '' });
    } catch (error) {
      console.error('Ошибка добавления животного:', error);
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        name="type"
        placeholder="Тип (например, Собака, Кошка)"
        value={formData.type}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Описание"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Местоположение (например, Ставрополь)"
        value={formData.location}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="lat"
        placeholder="Широта (например, 44.9481)"
        value={formData.lat}
        onChange={handleChange}
      />
      <input
        type="text"
        name="lng"
        placeholder="Долгота (например, 41.9732)"
        value={formData.lng}
        onChange={handleChange}
      />
      <input
        type="text"
        name="image"
        placeholder="URL изображения"
        value={formData.image}
        onChange={handleChange}
      />
      <button type="submit">Добавить животное</button>
    </form>
  );
}

export default PetForm;