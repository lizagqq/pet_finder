import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const destination = isAuthenticated ? '/add-pet' : '/register?redirect=/add-pet';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/ryzii-kot-i-sobaka-sidat-v-trave-s-romaskami.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg max-w-md w-full text-center transform transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 text-gray-700">
          Что у вас случилось?
        </h1>
        <div className="flex flex-col space-y-4 mb-8">
          <Link
            to={destination}
            className="w-full px-6 py-3 bg-blue-200 text-gray-800 rounded-lg shadow-md hover:bg-blue-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            Я потерял животное
          </Link>
          <Link
            to={destination}
            className="w-full px-6 py-3 bg-green-200 text-gray-800 rounded-lg shadow-md hover:bg-green-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            Я нашёл животное
          </Link>
        </div>
        <p className="text-lg font-display font-semibold mb-4 text-gray-700">
          Или вы хотите посмотреть, кто потерял или нашёл животных?
        </p>
        <div className="flex flex-col space-y-4">
          <Link
            to="/map?filter=lost"
            className="w-full px-6 py-3 bg-red-200 text-gray-800 rounded-lg shadow-md hover:bg-red-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            Смотреть потерянных животных
          </Link>
          <Link
            to="/map?filter=founded"
            className="w-full px-6 py-3 bg-yellow-200 text-gray-800 rounded-lg shadow-md hover:bg-yellow-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            Смотреть найденных животных
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;