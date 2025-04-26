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
        return data;
      } catch (error) {
        console.error('Ошибка загрузки животных:', error);
      }
    };
  
    // Инициализация карты
    useEffect(() => {
      if (isMapInitialized.current) {
        console.log('AddPetPage.js: Карта уже инициализирована, пропуск');
        return;
      }
  
      console.log('AddPetPage.js: Попытка загрузки карты');
  
      const existingScript = document.querySelector('script[src^="https://api-maps.yandex.ru/2.1/"]');
  
      if (!existingScript) {
        console.log('AddPetPage.js: Создание скрипта');
        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${process.env.REACT_APP_YANDEX_MAPS_API_KEY}&lang=ru_RU`;
        script.async = true;
        script.onload = () => {
          console.log('AddPetPage.js: Скрипт загружен');
          window.ymaps.ready(() => {
            initializeMap();
            isMapInitialized.current = true;
          });
        };
        script.onerror = (e) => {
          console.error('AddPetPage.js: Ошибка загрузки скрипта', e);
        };
        document.body.appendChild(script);
      } else if (window.ymaps) {
        console.log('AddPetPage.js: Скрипт уже есть, инициализация карты');
        window.ymaps.ready(() => {
          initializeMap();
          isMapInitialized.current = true;
        });
      }
  
      return () => {
        console.log('AddPetPage.js: Очистка');
        if (mapInstance.current) {
          mapInstance.current.destroy(); // Уничтожаем карту
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
        console.log('AddPetPage.js: Карта уже создана или контейнер отсутствует');
        return;
      }
  
      console.log('AddPetPage.js: Инициализация карты');
      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center: [44.9481, 41.9732], // Ставрополь [широта, долгота]
        zoom: 12,
        controls: ['zoomControl']
      });
  
      // Обработчик клика по карте
      mapInstance.current.events.add('click', (e) => {
        const coords = e.get('coords'); // [lat, lng]
        console.log('AddPetPage.js: Выбраны координаты', coords);
        setSelectedCoords(coords);
  
        // Удаляем старый маркер, если он есть
        if (markerInstance.current) {
          mapInstance.current.geoObjects.remove(markerInstance.current);
        }
  
        // Добавляем новый маркер
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
            <div
              ref={mapRef}
              className="w-full h-96 border border-gray-300"
            />
          </div>
        </div>
      </div>
    );
  };
  
  export default AddPetPage;