import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Star, ShieldCheck, Truck, Rotate3D, ZoomIn, Heart, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [rotation, setRotation] = useState(0); // 0 to 4 representing angles
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeImage, setActiveImage] = useState<string>('');
  
  // Angles for the "360" simulation
  const angles = ['Front View', 'Side Profile', 'Back View', 'Top Down', 'Close Up Texture'];
  
  useEffect(() => {
    if (isOpen && product) {
      setRotation(0);
      updateImage(0);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const updateImage = (angleIndex: number) => {
    const anglePrompt = angles[angleIndex];
    // We append the angle to the keyword to generate the specific view
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent((product.imageKeyword || product.name) + ' ' + anglePrompt + ' white background studio lighting')}?width=800&height=800&nologo=true&seed=${product.id}`;
    setActiveImage(url);
  };

  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setRotation(val);
    updateImage(val);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full md:hidden"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Left: Interactive Image Area */}
        <div className="w-full md:w-3/5 bg-gray-50 flex flex-col relative">
           
           {/* Main Image Container */}
           <div 
             className="relative flex-1 flex items-center justify-center overflow-hidden cursor-crosshair group"
             onMouseEnter={() => setIsZoomed(true)}
             onMouseLeave={() => setIsZoomed(false)}
             onMouseMove={handleMouseMove}
           >
              {/* The Image */}
              <div 
                className="w-full h-full absolute inset-0 transition-transform duration-100 ease-out"
                style={{
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center',
                    backgroundSize: isZoomed ? '200%' : 'contain',
                    backgroundRepeat: 'no-repeat'
                }}
              />
              
              {/* Loading State / Placeholder behind */}
              <img 
                 src={activeImage} 
                 className="opacity-0 pointer-events-none" 
                 alt="loader"
              />

              {!isZoomed && (
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-xs font-medium text-gray-500 pointer-events-none">
                    <ZoomIn className="w-4 h-4" /> Hover to Zoom
                 </div>
              )}
           </div>

           {/* Controls Bar */}
           <div className="bg-white border-t border-gray-100 p-6">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Rotate3D className="w-4 h-4 text-indigo-600" />
                    360° View: <span className="text-indigo-600">{angles[rotation]}</span>
                 </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1"
                value={rotation}
                onChange={handleRotationChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-2 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                 <span>Front</span>
                 <span>Side</span>
                 <span>Back</span>
                 <span>Top</span>
                 <span>Detail</span>
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar py-2">
                 {angles.map((angle, idx) => (
                    <button
                       key={angle}
                       onClick={() => { setRotation(idx); updateImage(idx); }}
                       className={`relative w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${rotation === idx ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                    >
                       <img 
                         src={`https://image.pollinations.ai/prompt/${encodeURIComponent((product.imageKeyword || product.name) + ' ' + angle)}?width=100&height=100&nologo=true&seed=${product.id}`}
                         alt={angle}
                         className="w-full h-full object-cover"
                       />
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Product Details */}
        <div className="w-full md:w-2/5 p-8 flex flex-col bg-white overflow-y-auto max-h-[50vh] md:max-h-full relative">
           <button 
             onClick={onClose}
             className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
           >
             <X className="w-6 h-6 text-gray-500" />
           </button>

           <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {product.category || 'New Arrival'}
                 </span>
                 <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{product.rating?.toFixed(1) || '4.8'}</span>
                 </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2">
                 {product.name}
              </h2>
              <div className="flex items-baseline gap-4 mb-6">
                 <span className="text-3xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                 </span>
                 <span className="text-lg text-gray-400 line-through">
                    ${(product.price * 1.2).toFixed(2)}
                 </span>
              </div>
           </div>

           <div className="prose prose-sm text-gray-600 mb-8 flex-grow">
              <p className="leading-relaxed text-base">
                 {product.description}
              </p>
              <ul className="mt-4 space-y-2">
                 <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Authentic Quality Guaranteed</span>
                 </li>
                 <li className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-500" />
                    <span>Free Shipping & Returns</span>
                 </li>
              </ul>
           </div>

           <div className="mt-auto space-y-4">
              <div className="flex gap-4">
                 <button 
                   onClick={() => { onAddToCart(product); onClose(); }}
                   className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
                 >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                 </button>
                 <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                    <Heart className="w-6 h-6" />
                 </button>
                 <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                    <Share2 className="w-6 h-6" />
                 </button>
              </div>
              <p className="text-center text-xs text-gray-400">
                 Secure checkout powered by SmartShop AI
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
