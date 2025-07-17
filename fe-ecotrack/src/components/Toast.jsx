import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        fixed top-32 right-6 z-40
        px-4 py-3 rounded-md shadow-md
        max-w-sm w-fit
        flex items-center justify-between gap-4
        bg-white text-black border-l-4
        transition-all duration-300 ease-in-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
        ${type === 'success' ? 'border-green-600' : 'border-red-600'}
      `}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-400 hover:text-black text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
}
