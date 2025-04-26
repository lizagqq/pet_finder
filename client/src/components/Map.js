import React, { useEffect, useRef } from 'react';

const Map = ({ pets }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const isMapInitialized = useRef(false);

  useEffect(() => {
    if (isMapInitialized.current) {
      console.log('Map.js: Карта уже инициализирована, пропуск');
      return;
    }

    console.log('Map.js: Попытка загрузки карты');

    const existingScript = document.querySelector('script[src^="https://api-maps.yandex.ru/2.1/"]');

    if (!existingScript) {
      console.log('Map.js: Создание скрипта');
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        console.log('Map.js: Скрипт загружен');
        window.ymaps.ready(() => {
          initializeMap();
          isMapInitialized.current = true;
        });
      };
      script.onerror = (e) => {
        console.error('Map.js: Ошибка загрузки скрипта', e);
      };
      document.body.appendChild(script);
    } else if (window.ymaps) {
      console.log('Map.js: Скрипт уже есть, инициализация карты');
      window.ymaps.ready(() => {
        initializeMap();
        isMapInitialized.current = true;
      });
    }

    return () => {
      console.log('Map.js: Очистка');
    };
  }, []);

  const initializeMap = () => {
    console.log('Map.js: Инициализация карты');
    mapInstance.current = new window.ymaps.Map(mapRef.current, {
      center: [44.9481, 41.9732], // Ставрополь [широта, долгота]
      zoom: 12,
      controls: ['zoomControl']
    });
  };

  useEffect(() => {
    if (mapInstance.current) {
      console.log('Map.js: Обновление маркеров', pets);
      // Очищаем старые маркеры
      mapInstance.current.geoObjects.removeAll();
      // Добавляем новые
      pets.forEach((pet) => {
        if (pet.lat && pet.lng) {
          console.log('Map.js: Маркер для', pet);
          const placemark = new window.ymaps.Placemark(
            [parseFloat(pet.lat), parseFloat(pet.lng)],
            { balloonContent: `${pet.type}: ${pet.description}` },
            { preset: 'islands#blueIcon' }
          );
          mapInstance.current.geoObjects.add(placemark);
        }
      });
    }
  }, [pets]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
    />
  );
};

export default Map;