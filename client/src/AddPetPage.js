import React, { useState, useEffect, useRef } from 'react';
import PetForm from './components/PetForm';

const AddPetPage = () => {
  const [pets, setPets] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null); // [lat, lng]
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const isMapInitialized = useRef(false);

  // Загрузка списка животных
  const fetchPets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/pets');
      const data = await response.json();
      setPets(data);
      console.log('AddPetPage: Животные загружены:', data);
      return data;
    } catch (error) {
      console.error('AddPetPage: Ошибка загрузки животных:', error);
    }
  };

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AddPetPage: Токен:', token);
    if (!token) {
      console.warn('AddPetPage: Токен отсутствует, перенаправление на /login');
    }
  }, []);

  // Инициализация карты
  useEffect(() => {
    if (isMapInitialized.current) {
      console.log('AddPetPage: Карта уже инициализирована, пропуск');
      return;
    }

    console.log('AddPetPage: Попытка загрузки карты');

    const existingScript = document.querySelector('script[src^="https://api-maps.yandex.ru/2.1/"]');

    if (!existingScript) {
      console.log('AddPetPage: Создание скрипта');
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        console.log('AddPetPage: Скрипт загружен');
        window.ymaps.ready(() => {
          initializeMap();
          isMapInitialized.current = true;
        });
      };
      script.onerror = (e) => {
        console.error('AddPetPage: Ошибка загрузки скрипта', e);
      };
      document.body.appendChild(script);
    } else if (window.ymaps) {
      console.log('AddPetPage: Скрипт уже есть, инициализация карты');
      window.ymaps.ready(() => {
        initializeMap();
        isMapInitialized.current = true;
      });
    }

    return () => {
      console.log('AddPetPage: Очистка');
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
      if (markerInstance.current) {
        markerInstance.current = null;
      }
      isMapInitialized.current = false;
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstance.current) {
      console.log('AddPetPage: Карта уже создана или контейнер отсутствует');
      return;
    }

    console.log('AddPetPage: Инициализация карты');
    mapInstance.current = new window.ymaps.Map(mapRef.current, {
      center: [44.9481, 41.9732], // Ставрополь [широта, долгота]
      zoom: 12,
      controls: ['zoomControl'],
    });

    mapInstance.current.events.add('click', (e) => {
      const coords = e.get('coords');
      console.log('AddPetPage: Выбраны координаты:', coords);
      setSelectedCoords(coords);

      if (markerInstance.current) {
        mapInstance.current.geoObjects.remove(markerInstance.current);
      }

      markerInstance.current = new window.ymaps.Placemark(
        coords,
        { balloonContent: 'Место потери животного' },
        { preset: 'islands#redIcon' }
      );
      mapInstance.current.geoObjects.add(markerInstance.current);
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Добавить животное</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/2">
          <PetForm fetchPets={fetchPets} selectedCoords={selectedCoords} />
        </div>
        <div className="md:w-1/2">
          <div ref={mapRef} className="w-full h-96 border border-gray-300 rounded-lg shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default AddPetPage;