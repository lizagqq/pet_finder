import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-display font-bold text-gray-800 mb-6 text-center">
        О проекте Pet Finder
      </h1>
      
      <section className="mb-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          Pet Finder — это приложение для поиска потерянных животных в Ставрополе. Мы стремимся помочь владельцам воссоединиться со своими питомцами, предоставляя удобную платформу для размещения объявлений и просмотра их на карте. Наша цель — сделать процесс поиска максимально быстрым и эффективным, чтобы каждый потерянный питомец смог вернуться домой.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-gray-800 mb-4">
          Преимущества Pet Finder
        </h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Локальный фокус:</strong> Приложение ориентировано на Ставрополь, что позволяет быстро находить животных в нашем городе.</li>
          <li><strong>Удобная карта:</strong> Интеграция с Яндекс.Картами позволяет легко увидеть, где были потеряны или найдены животные.</li>
          <li><strong>Простота использования:</strong> Интуитивный интерфейс для размещения объявлений и просмотра информации.</li>
          <li><strong>Сообщество:</strong> Объединяет людей, которые хотят помочь в поиске животных.</li>
          <li><strong>Безопасность:</strong> Надежная регистрация и защита данных пользователей.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-display font-semibold text-gray-800 mb-4">
          Как использовать Pet Finder
        </h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li><strong>Зарегистрируйтесь или войдите:</strong> Создайте аккаунт с помощью номера телефона.</li>
          <li><strong>Добавьте объявление:</strong> Если вы потеряли или нашли животное, перейдите в раздел "Добавить" и опишите питомца.</li>
          <li><strong>Используйте карту:</strong> Откройте "Карта питомцев", чтобы увидеть объявления в вашем районе.</li>
          <li><strong>Свяжитесь с автором:</strong> Найдите подходящее объявление и свяжитесь с владельцем или нашедшим.</li>
        </ol>
      </section>

      

      <section className="bg-blue-100 p-4 rounded-lg text-center">
        <p className="text-gray-700">
          Если у вас есть вопросы или предложения, свяжитесь с нами по электронной почте: <a href="mailto:support@petfinder.ru" className="text-blue-600 hover:underline">support@petfinder.ru</a>.
        </p>
      </section>
    </div>
  );
};

export default About;