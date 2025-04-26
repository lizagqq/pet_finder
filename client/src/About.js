import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">О проекте</h1>
      <p className="mb-4">
        Pet Finder — это приложение для поиска потерянных животных в Ставрополе. Мы стремимся помочь
        владельцам воссоединиться со своими питомцами, предоставляя удобную платформу для размещения
        объявлений и просмотра их на карте.
      </p>
      <p>
        Проект создан с использованием React, Node.js, PostgreSQL и Яндекс.Карт API. Если у вас есть
        вопросы или предложения, свяжитесь с нами!
      </p>
    </div>
  );
};

export default About;