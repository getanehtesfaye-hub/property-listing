import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-5">
      <div className="text-brand-600 bg-brand-50 p-6 rounded-full">
        <Building className="w-16 h-16 stroke-[1.5]" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-gray-500 max-w-md text-sm sm:text-base font-medium">
        Sorry, the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-lg text-sm transition-all shadow-md shadow-brand-100"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
};

export default NotFound;
