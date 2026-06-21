import React, { useState } from 'react';
import { getImageUrl } from './PropertyCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] w-full bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
        <img
          src={getImageUrl(null)}
          alt="Placeholder"
          className="object-cover w-full h-full rounded-xl opacity-60"
        />
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Viewport */}
      <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden shadow-sm group">
        <img
          src={getImageUrl(images[currentIndex]?.imageUrl)}
          alt={`View ${currentIndex + 1}`}
          className="object-cover w-full h-full transition-all duration-300"
        />

        {images.length > 1 && (
          <>
            {/* Nav Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-white text-gray-800 shadow transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass hover:bg-white text-gray-800 shadow transition-opacity opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setCurrentIndex(idx)}
              className={`aspect-square rounded-lg overflow-hidden border-2 bg-gray-50 hover:opacity-90 transition-all ${
                idx === currentIndex ? 'border-brand-600 ring-2 ring-brand-100' : 'border-transparent'
              }`}
            >
              <img
                src={getImageUrl(img.imageUrl)}
                alt={`Thumbnail ${idx + 1}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
