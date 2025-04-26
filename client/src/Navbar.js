import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          Pet Finder
        </Link>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:underline">
            Главная
          </Link>
          <Link to="/map" className="text-white hover:underline">
            Карта
          </Link>
          <Link to="/add-pet" className="text-white hover:underline">
            Добавить
          </Link>
          <Link to="/about" className="text-white hover:underline">
            О проекте
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;