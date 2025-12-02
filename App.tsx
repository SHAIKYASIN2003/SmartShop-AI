import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CheckoutFlow } from './components/CheckoutFlow';
import { ProfileModal } from './components/ProfileModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { Search, Loader2, Sparkles, CheckCircle, ShoppingBag, Gift, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Product, CartItem, ViewState, SearchState, UserProfile, PrizeTranslation } from './types';
import { searchProductsWithGemini, getPrizeTranslations } from './services/geminiService';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
  });

  // User Profile State with Persistance
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('smartshop_user');
    return saved ? JSON.parse(saved) : {
      name: 'Guest User',
      email: 'guest@smartshop.ai',
      phone: '+1 (555) 123-4567'
    };
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Prize State
  const [prizeAmount, setPrizeAmount] = useState<number>(0);
  const [prizeTranslations, setPrizeTranslations] = useState<PrizeTranslation[]>([]);
  const [languageFilter, setLanguageFilter] = useState('');
  const [isPrizeLoading, setIsPrizeLoading] = useState(false);
  const [isPrizeRevealed, setIsPrizeRevealed] = useState(false);

  useEffect(() => {
    localStorage.setItem('smartshop_user', JSON.stringify(user));
  }, [user]);

  // Reset prize state when entering success view
  useEffect(() => {
    if (view === 'SUCCESS') {
      // Random prize between 50 and 1000, rounded to nearest 10
      const randomPrize = Math.floor(Math.random() * 95 + 5) * 10; 
      setPrizeAmount(randomPrize);
      setPrizeTranslations([]);
      setLanguageFilter('');
      setIsPrizeRevealed(false);
    }
  }, [view]);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchState.query.trim()) return;

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const results = await searchProductsWithGemini(searchState.query);
      setSearchState(prev => ({ ...prev, results, isLoading: false }));
    } catch (err) {
      setSearchState(prev => ({ ...prev, isLoading: false, error: 'Failed to find products. Try again.' }));
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleRevealPrize = async () => {
    setIsPrizeLoading(true);
    try {
      const translations = await getPrizeTranslations(prizeAmount);
      setPrizeTranslations(translations);
      setIsPrizeRevealed(true);
    } catch (error) {
      console.error("Failed to reveal prize", error);
    } finally {
      setIsPrizeLoading(false);
    }
  };

  const renderContent = () => {
    if (view === 'CHECKOUT') {
      return (
        <CheckoutFlow 
          cart={cart}
          total={cartTotal}
          onBack={() => setView('HOME')}
          onComplete={() => {
            setCart([]);
            setView('SUCCESS');
          }}
        />
      );
    }

    if (view === 'SUCCESS') {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Thank you for shopping with SmartShop AI. Your order has been placed successfully.
          </p>

          {/* Mystery Prize Section */}
          <div className="w-full max-w-lg bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 mb-8 overflow-hidden relative shadow-lg">
             <div className="flex items-center justify-center mb-4">
               <div className="bg-orange-100 p-3 rounded-full">
                 <Gift className="w-8 h-8 text-orange-600" />
               </div>
             </div>
             
             {!isPrizeRevealed ? (
               <>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">You won a scratch card!</h3>
                 <p className="text-gray-600 mb-6 text-sm">Reveal your mystery cash reward instantly.</p>
                 <button 
                  onClick={handleRevealPrize}
                  disabled={isPrizeLoading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                 >
                   {isPrizeLoading ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" /> Revealing...
                     </>
                   ) : (
                     <>
                       <Sparkles className="w-5 h-5" /> Reveal Prize
                     </>
                   )}
                 </button>
               </>
             ) : (
               <div className="animate-fade-in-up">
                 <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-4">
                   ₹{prizeAmount} WON!
                 </h3>

                 {/* Language Filter */}
                 <div className="mb-3 relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                      placeholder="Filter by language..."
                      className="w-full pl-9 pr-9 py-2 rounded-xl border border-orange-200 bg-white/60 focus:bg-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm transition-all placeholder-orange-300 text-gray-700"
                    />
                    {languageFilter && (
                      <button 
                        onClick={() => setLanguageFilter('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-orange-400 hover:text-orange-600 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                 </div>

                 <div className="bg-white/60 rounded-xl overflow-hidden backdrop-blur-sm border border-orange-100">
                    <div className="max-h-80 overflow-y-auto no-scrollbar divide-y divide-orange-100/50">
                      {prizeTranslations
                        .filter(pt => pt.language.toLowerCase().includes(languageFilter.toLowerCase()))
                        .map((pt, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/80 transition-colors gap-1">
                          <span className="text-xs font-bold text-orange-800 uppercase tracking-wider bg-orange-100/50 px-2 py-1 rounded w-fit">{pt.language}</span>
                          <span className="text-base font-medium text-gray-800 text-right font-inter">{pt.message}</span>
                        </div>
                      ))}
                      {prizeTranslations.filter(pt => pt.language.toLowerCase().includes(languageFilter.toLowerCase())).length === 0 && (
                          <div className="p-6 text-center text-gray-500 text-sm">
                            No languages match "{languageFilter}"
                          </div>
                      )}
                    </div>
                 </div>
               </div>
             )}
          </div>

          <button 
            onClick={() => {
              setSearchState({ query: '', results: [], isLoading: false, error: null });
              setView('HOME');
            }}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      );
    }

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Shop smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI</span>
          </h1>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center bg-white rounded-xl shadow-xl">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input 
                  type="text" 
                  value={searchState.query}
                  onChange={(e) => setSearchState(prev => ({...prev, query: e.target.value}))}
                  placeholder="Search for anything (e.g., 'ergonomic office chair', 'red running shoes')..."
                  className="w-full px-4 py-4 rounded-xl outline-none text-lg text-gray-800 placeholder-gray-400 bg-transparent"
                />
                <button 
                  type="submit"
                  disabled={searchState.isLoading}
                  className="mr-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {searchState.isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Search'}
                </button>
              </div>
            </div>
          </form>
          
          {/* Example tags */}
          {!searchState.results.length && !searchState.isLoading && (
             <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-gray-500">
               <span>Try:</span>
               {['Wireless Headphones', 'Sustainable Yoga Mat', 'Vintage Denim Jacket', 'Smart Coffee Maker'].map(tag => (
                 <button 
                    key={tag}
                    onClick={(e) => {
                      setSearchState(prev => ({...prev, query: tag}));
                      // In a real app we might trigger search here, but for now we just fill input
                    }}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                 >
                   {tag}
                 </button>
               ))}
             </div>
          )}
        </div>

        {/* Results Area */}
        {searchState.isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                </div>
             </div>
             <p className="mt-4 text-gray-500 font-medium">Gemini is finding the best products for you...</p>
          </div>
        ) : searchState.results.length > 0 ? (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Results for "{searchState.query}"</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchState.results.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart} 
                  onClick={setSelectedProduct}
                />
              ))}
            </div>
          </div>
        ) : searchState.query && !searchState.isLoading && searchState.error ? (
           <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
             <p className="text-red-500">{searchState.error}</p>
           </div>
        ) : (
           <div className="text-center py-20 opacity-50">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400 text-lg">Start searching to see products powered by AI</p>
           </div>
        )}
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar 
        cartCount={cartCount} 
        user={user}
        onCartClick={() => {
            if (cart.length > 0) setView('CHECKOUT');
            else alert("Your cart is empty!");
        }}
        onLogoClick={() => setView('HOME')}
        onProfileClick={() => setIsProfileOpen(true)}
      />
      
      {renderContent()}

      <ProfileModal 
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdate={setUser}
      />

      <ProductDetailModal 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      {/* Cart Toast / Floating Action (Mobile mainly) */}
      {view === 'HOME' && cart.length > 0 && (
         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/4 sm:-translate-x-1/2 z-40">
            <button 
              onClick={() => setView('CHECKOUT')}
              className="bg-gray-900 text-white pl-4 pr-6 py-3 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <div className="bg-indigo-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {cartCount}
              </div>
              <span className="font-medium">View Cart • ${cartTotal.toFixed(2)}</span>
            </button>
         </div>
      )}
    </div>
  );
}
