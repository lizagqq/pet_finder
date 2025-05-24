import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-amber-500 to-orange-300 text-white py-4 mt-auto shadow-lg w-full">
      <div className="px-2">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* О нас */}
          <div>
            <h3 className="text-base font-display font-semibold mb-2">О нас</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link to="/about" className="hover:text-yellow-200 transition-colors flex items-center">
                  <span role="img" aria-label="info"></span> О проекте
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-base font-display font-semibold mb-2">Контакты</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="mailto:support@petfinder.ru" className="hover:text-yellow-200 transition-colors flex items-center">
                  <span role="img" aria-label="email">📧</span> support@petfinder.ru
                </a>
              </li>
              <li>
                <a href="tel:+79991234567" className="hover:text-yellow-200 transition-colors flex items-center">
                  <span role="img" aria-label="phone">📞</span> +7 (999) 123-45-67
                </a>
              </li>
            </ul>
          </div>

          {/* Соцсети */}
          <div>
            <h3 className="text-base font-display font-semibold mb-2">Мы в соцсетях</h3>
            <div className="flex space-x-3">
              <a
                href="https://vk.com/petfinder"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-gray-200 transition-colors shadow-md"
              >
                <span role="img" aria-label="vk">🌐</span>
              </a>
              <a
                href="https://t.me/petfinder"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-gray-200 transition-colors shadow-md"
              >
                <span role="img" aria-label="telegram">✈️</span>
              </a>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-4 border-t border-amber-200 pt-2 text-center text-sm">
          <p className="font-display">© {new Date().getFullYear()} PetFinder. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;