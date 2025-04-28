import React, { useEffect, useRef } from 'react';

const Map = ({ pets, filterStatus }) => {
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
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
          console.log('Map.js: Карта уничтожена');
        } catch (error) {
          console.error('Map.js: Ошибка при уничтожении карты', error);
        }
        mapInstance.current = null;
      }
      isMapInitialized.current = false;
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) {
      console.log('Map.js: Карта уже создана или контейнер отсутствует');
      return;
    }

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

      // Очистить карту перед добавлением новых маркеров
      mapInstance.current.geoObjects.removeAll();

      // Отфильтровать питомцев по статусу, если фильтр задан
      const filteredPets = filterStatus
        ? pets.filter((pet) => pet.status === filterStatus)
        : pets;

      filteredPets.forEach((pet) => {
        if (pet.lat && pet.lng) {
          console.log('Map.js: Маркер для', pet);
          const placemark = new window.ymaps.Placemark(
            [parseFloat(pet.lat), parseFloat(pet.lng)],
            { balloonContent: `${pet.type}: ${pet.description}` },
            { preset: pet.status === 'Потеряно' ? 'islands#redIcon' : 'islands#blueIcon' } // Разные иконки для разных статусов
          );
          mapInstance.current.geoObjects.add(placemark);
        }
      });
    }
  }, [pets, filterStatus]);

  return (
    <div
      ref={mapRef}
      id="map-page"
      className="w-full h-96 border border-gray-300"
    />
  );
};

export default Map;
