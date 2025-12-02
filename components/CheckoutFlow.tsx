import React, { useState } from 'react';
import { MapPin, CreditCard, Smartphone, ShieldCheck, ArrowRight, ArrowLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import { Address, PaymentDetails, PaymentMethodType, CartItem } from '../types';
import { generateAddressFromCoordinates } from '../services/geminiService';

interface CheckoutFlowProps {
  cart: CartItem[];
  total: number;
  onComplete: () => void;
  onBack: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({ cart, total, onComplete, onBack }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [address, setAddress] = useState<Address>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    type: 'HOME'
  });
  const [payment, setPayment] = useState<PaymentDetails>({
    method: PaymentMethodType.UPI,
    upiApp: 'gpay'
  });
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Address Handlers
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setErrors([]);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const generated = await generateAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
          setAddress(prev => ({
            ...prev,
            city: generated.city || prev.city,
            state: generated.state || prev.state,
            zipCode: generated.zipCode || prev.zipCode,
            country: generated.country || prev.country
          }));
        } catch (error) {
          console.error("Locate failed", error);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setErrors(["Unable to retrieve your location. Please enter address manually."]);
      }
    );
  };

  const validateAddress = () => {
    const newErrors: string[] = [];
    if (!address.fullName.trim()) newErrors.push("Full Name is required");
    if (!address.street.trim()) newErrors.push("Street Address is required");
    if (!address.city.trim()) newErrors.push("City is required");
    if (!address.state.trim()) newErrors.push("State is required");
    if (!address.zipCode.trim()) newErrors.push("ZIP Code is required");
    if (!address.phone.trim()) newErrors.push("Phone Number is required");
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep(2);
      setErrors([]);
    }
  };

  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'} font-bold transition-colors`}>1</div>
        <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'} rounded`}></div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'} font-bold transition-colors`}>2</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {step === 1 ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-indigo-600" />
                Shipping Address
              </h2>
              
              <button 
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="w-full mb-6 py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-indigo-200 border-dashed"
              >
                {isLocating ? <Loader2 className="animate-spin w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                Use Current Location (AI Detect)
              </button>

              <form id="address-form" onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={address.fullName}
                      onChange={e => setAddress({...address, fullName: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.includes("Full Name is required") ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:ring-2 outline-none transition-all`}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input 
                      type="text" 
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.includes("Street Address is required") ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:ring-2 outline-none transition-all`}
                      placeholder="123 Smart St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      value={address.city}
                      onChange={e => setAddress({...address, city: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.includes("City is required") ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input 
                      type="text" 
                      value={address.state}
                      onChange={e => setAddress({...address, state: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.includes("State is required") ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input 
                      type="text" 
                      value={address.zipCode}
                      onChange={e => setAddress({...address, zipCode: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.includes("ZIP Code is required") ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      value={address.phone}
                      onChange={e => setAddress({...address, phone: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${errors.includes("Phone Number is required") ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:ring-2 outline-none transition-all`}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {['HOME', 'WORK', 'OTHER'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setAddress({...address, type: type as any})}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border ${address.type === type ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" />
                Payment Method
              </h2>

              <div className="space-y-4">
                {/* Method Selector */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                  <button 
                    onClick={() => setPayment({...payment, method: PaymentMethodType.UPI})}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${payment.method === PaymentMethodType.UPI ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Smartphone className="w-4 h-4" /> UPI Apps
                  </button>
                  <button 
                    onClick={() => setPayment({...payment, method: PaymentMethodType.CARD})}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${payment.method === PaymentMethodType.CARD ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <CreditCard className="w-4 h-4" /> Card
                  </button>
                </div>

                {payment.method === PaymentMethodType.UPI ? (
                  <div className="grid grid-cols-2 gap-4">
                    {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                      <button
                        key={app}
                        onClick={() => setPayment({...payment, upiApp: app})}
                        className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-md flex flex-col items-center justify-center h-24 ${payment.upiApp === app ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                         <span className="font-bold text-lg uppercase tracking-wider text-gray-800">{app}</span>
                         {payment.upiApp === app && <div className="absolute top-2 right-2 text-indigo-600"><Check className="w-4 h-4" /></div>}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                          <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                          <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <div className="text-sm">
                  <p className="font-semibold">Please fix the following errors:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
               </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
             {step === 2 ? (
               <button 
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
               >
                 <ArrowLeft className="w-4 h-4" /> Back
               </button>
             ) : (
                <button 
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Keep Shopping
                </button>
             )}

             {step === 1 ? (
               <button 
                type="submit"
                form="address-form"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
               >
                 Continue to Payment <ArrowRight className="w-4 h-4" />
               </button>
             ) : (
               <button 
                type="button"
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg shadow-green-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
               >
                 {isProcessing ? <Loader2 className="animate-spin w-5 h-5"/> : 'Pay Securely'}
               </button>
             )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
             <h3 className="text-lg font-bold mb-4">Order Summary</h3>
             <div className="space-y-3 max-h-60 overflow-y-auto pr-2 no-scrollbar mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                     <img 
                       src={`https://image.pollinations.ai/prompt/${encodeURIComponent(item.imageKeyword || item.name)}?width=100&height=100&nologo=true&seed=${item.id}`} 
                       alt={item.name} 
                       className="w-12 h-12 rounded-lg object-cover bg-gray-100" 
                     />
                     <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                     </div>
                     <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
             </div>
             
             <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                   <span>Subtotal</span>
                   <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                   <span>Shipping</span>
                   <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2">
                   <span>Total</span>
                   <span>${total.toFixed(2)}</span>
                </div>
             </div>
             
             <div className="mt-6 bg-indigo-50 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-800 leading-relaxed">
                   Unified checkout protects your data. No need to create a new account for this store.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};