import React from 'react';

const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex justify-center items-center py-4">
      <div
        className={`${sizeClasses[size]} border-brand-200 border-t-brand-600 rounded-full animate-spin`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;
