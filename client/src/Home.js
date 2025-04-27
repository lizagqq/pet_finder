import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const destination = isAuthenticated ? '/add-pet' : '/register?redirect=/add-pet';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
        Что у вас случилось?
      </h1>

      <div className="flex flex-col space-y-4 w-full max-w-md mb-8">
        <Link to={destination} className="w-full px-6 py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition">
          Я потерял животное
        </Link>

        <Link to={destination} className="w-full px-6 py-3 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition">
          Я нашёл животное
        </Link>
      </div>

      <p className="text-lg font-semibold mb-4 text-center">
        Или вы хотите посмотреть, кто потерял или нашёл животных?
      </p>

      <div className="flex flex-col space-y-4 w-full max-w-md">
        <Link to="/map?filter=lost" className="w-full px-6 py-3 bg-red-500 text-white text-center rounded-lg hover:bg-red-600 transition">
          Смотреть потерянных животных
        </Link>

        <Link to="/map?filter=founded" className="w-full px-6 py-3 bg-yellow-500 text-white text-center rounded-lg hover:bg-yellow-600 transition">
          Смотреть найденных животных
        </Link>
      </div>
    </div>
  );
};

export default Home;