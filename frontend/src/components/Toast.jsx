import { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff';

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: bgColor,
        color: 'white',
        padding: '15px 20px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 10000,
        minWidth: '250px',
      }}
    >
      {message}
    </div>
  );
};

export default Toast;

