import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Добро пожаловать в Pet Finder!</h1>
      <p className="mb-4">
        Это приложение помогает находить потерянных животных в Ставрополе. Вы можете посмотреть
        объявления на карте или добавить своё.
      </p>
      <div className="space-x-4">
        <Link to="/map" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Посмотреть карту
        </Link>
        <Link to="/add-pet" className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Добавить животное
        </Link>
        <Link to="/about" className="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          О проекте
        </Link>
      </div>
    </div>
  );
};

export default Home;