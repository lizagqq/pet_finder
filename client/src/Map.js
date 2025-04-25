import React, { useEffect, useRef } from 'react';

function Map({ pets }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 55.7558, lng: 37.6173 }, // Москва по умолчанию
        zoom: 10
      });

      pets.forEach(pet => {
        if (pet.lat && pet.lng) {
          new window.google.maps.Marker({
            position: { lat: parseFloat(pet.lat), lng: parseFloat(pet.lng) },
            map,
            title: pet.type
          });
        }
      });
    }
  }, [pets]);

  return <div ref={mapRef} className="w-full h-96"></div>;
}

export default Map;