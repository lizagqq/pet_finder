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
    await fetch('http://localhost:5000/api/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    fetchPets();
    setFormData({ type: '', description: '', location: '', lat: '', lng: '', image: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        name="type"
        placeholder="Type (e.g., Dog, Cat)"
        value={formData.type}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
        required
      />
      <input
        type="text"
        name="location"
        placeholder="Location (e.g., Moscow)"
        value={formData.location}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
        required
      />
      <input
        type="text"
        name="lat"
        placeholder="Latitude (e.g., 55.7558)"
        value={formData.lat}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        name="lng"
        placeholder="Longitude (e.g., 37.6173)"
        value={formData.lng}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        name="image"
        placeholder="Image URL"
        value={formData.image}
        onChange={handleChange}
        className="border p-2 mb-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Add Pet
      </button>
    </form>
  );
}

export default PetForm;