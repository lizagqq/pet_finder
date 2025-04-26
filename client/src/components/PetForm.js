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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Sending data:', formData);
    try {
      // Преобразуем lat и lng в числа
      const payload = {
        ...formData,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null
      };
      const response = await fetch('http://localhost:5000/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }
      const data = await response.json();
      console.log('Response:', data);
      fetchPets();
      setFormData({ type: '', description: '', location: '', lat: '', lng: '', image: '' });
    } catch (error) {
      console.error('Error creating pet:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="type"
        placeholder="Type (e.g., Dog, Cat)"
        value={formData.type}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Location (e.g., Moscow)"
        value={formData.location}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="lat"
        placeholder="Latitude (e.g., 55.7558)"
        value={formData.lat}
        onChange={handleChange}
      />
      <input
        type="text"
        name="lng"
        placeholder="Longitude (e.g., 37.6173)"
        value={formData.lng}
        onChange={handleChange}
      />
      <input
        type="text"
        name="image"
        placeholder="Image URL"
        value={formData.image}
        onChange={handleChange}
      />
      <button type="submit">Add Pet</button>
    </form>
  );
}

export default PetForm;