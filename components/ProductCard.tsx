import React, { useState } from 'react';
import { Plus, ExternalLink, ImageOff } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  const [imgError, setImgError] = useState(false);
  
  // Use Pollinations.ai for dynamic AI images based on the keyword
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(product.imageKeyword || product.name)}?width=400&height=400&nologo=true&seed=${product.id}`;

  return (
    <div 
      onClick={() => onClick && onClick(product)}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imgError ? (
          <img 
            src={imageUrl} 
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
            <ImageOff className="w-10 h-10" />
          </div>
        )}
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex-1 bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
            {product.productUrl && (
              <a 
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="bg-white/90 text-gray-700 p-2 rounded-lg shadow-lg hover:bg-white transition-colors flex items-center justify-center"
                title="View Source"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wider truncate max-w-[70%]">
              {product.category || 'General'}
            </p>
            <div className="flex items-center gap-1 text-amber-500">
                <span className="text-xs font-bold">{product.rating?.toFixed(1) || 4.5}</span>
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <button 
             onClick={(e) => {
                 e.stopPropagation();
                 onAddToCart(product);
             }}
             className="md:hidden bg-indigo-600 text-white p-2 rounded-full shadow-lg active:bg-indigo-700"
          >
              <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
