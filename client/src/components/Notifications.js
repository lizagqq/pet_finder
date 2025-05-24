import React, { useState, useEffect } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Загрузка уведомлений
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Вы не авторизованы');
        }
        const response = await fetch('http://localhost:5000/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка загрузки уведомлений');
        }
        const data = await response.json();
        setNotifications(data);
        console.log('Notifications: Получены уведомления:', data);
      } catch (err) {
        console.error('Notifications: Ошибка загрузки:', err);
        setError(err.message);
      }
    };
    fetchNotifications();
  }, []);

  // Отметка уведомления как прочитанного
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении уведомления');
      }
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      console.log(`Notifications: Уведомление ${notificationId} отмечено прочитанным`);
    } catch (err) {
      console.error('Notifications: Ошибка отметки как прочитанного:', err);
      setError(err.message);
    }
  };

  // Счётчик непрочитанных уведомлений
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Уведомления {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
      </h2>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">Уведомлений пока нет</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 border rounded-lg ${
                notification.read ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-gray-800'
              }`}
            >
              <p className="text-sm">
                <strong>{notification.pet_type}:</strong> {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.created_at).toLocaleString('ru-RU')}
              </p>
              <div className="flex gap-4 mt-2">
                <a
                  href={`/map?petId=${notification.pet_id}`}
                  className="text-blue-500 hover:underline text-sm"
                >
                  Перейти к объявлению
                </a>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-green-500 hover:underline text-sm"
                  >
                    Отметить прочитанным
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;