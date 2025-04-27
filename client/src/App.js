import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import MapPage from './MapPage';
import AddPetPage from './AddPetPage';
import About from './About';
import PetsListPage from './PetsListPage';
import RegisterPage from './RegisterPage';
import 'leaflet/dist/leaflet.css';



const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/add-pet" element={<AddPetPage />} />
          <Route path="/pets" element={<PetsListPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;