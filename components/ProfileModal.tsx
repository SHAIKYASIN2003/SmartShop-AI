import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, Trash2, User, Loader2, Sparkles, Mail, Phone, Edit3 } from 'lucide-react';
import { UserProfile } from '../types';
import { enhanceUserProfileImage } from '../services/geminiService';

interface ProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
      setPreviewImage(null); // Reset pending image changes on open
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Process image: Resize and Crop to Square locally first
    try {
      const processedImage = await processImageLocally(file);
      setPreviewImage(processedImage);
    } catch (error) {
      console.error("Error processing image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIEnhance = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!previewImage) return;
    
    setIsEnhancing(true);
    try {
        const enhanced = await enhanceUserProfileImage(previewImage);
        if (enhanced) {
            setPreviewImage(enhanced);
        } else {
            alert("AI Enhancement failed. Please try again.");
        }
    } catch (e) {
        alert("Something went wrong during enhancement.");
    } finally {
        setIsEnhancing(false);
    }
  };

  const handleSave = () => {
    onUpdate({
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: previewImage || user.avatar
    });
    onClose();
  };

  const processImageLocally = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 512; // Standardize to 512x512 for better AI input context
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Calculate "Cover" fit
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;

          // clear background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, size, size);
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          // Export as JPEG
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Determine which image to show: The new preview, or the current user avatar
  const displayImage = previewImage || user.avatar;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto no-scrollbar">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center relative ring-2 ring-gray-100">
                {isProcessing || isEnhancing ? (
                   <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                       <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                       <span className="text-[10px] font-semibold text-indigo-600 animate-pulse">
                          {isEnhancing ? 'Enhancing...' : 'Processing...'}
                       </span>
                   </div>
                ) : null}
                
                {displayImage ? (
                  <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Quick Image Actions */}
              <div className="absolute -bottom-2 -right-2 flex gap-2">
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || isEnhancing}
                  className="bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 border-2 border-white"
                  title="Upload New Photo"
                 >
                  <Camera className="w-4 h-4" />
                 </button>
                 {displayImage && (
                    <button 
                    onClick={() => { setPreviewImage(null); if(user.avatar) onUpdate({...user, avatar: undefined}); }}
                    disabled={isProcessing || isEnhancing}
                    className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-transform active:scale-95 border-2 border-white"
                    title="Remove Photo"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                 )}
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            {/* Enhance Button (Only visible if there is an image) */}
            {displayImage && (
                 <button
                    onClick={handleAIEnhance}
                    disabled={isEnhancing || !displayImage}
                    className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-indigo-100 transition-colors"
                 >
                    <Sparkles className="w-3 h-3" /> 
                    {isEnhancing ? 'Enhancing...' : 'Auto-Enhance Photo'}
                 </button>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <User className="h-4 w-4 text-gray-400" />
                 </div>
                 <input
                   type="text"
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                   placeholder="Enter your name"
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Mail className="h-4 w-4 text-gray-400" />
                 </div>
                 <input
                   type="email"
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                   placeholder="you@example.com"
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Phone className="h-4 w-4 text-gray-400" />
                 </div>
                 <input
                   type="tel"
                   value={formData.phone}
                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                   placeholder="+1 (555) 000-0000"
                 />
               </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
           <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 font-medium rounded-xl transition-colors shadow-sm"
           >
              Cancel
           </button>
           <button 
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
           >
              Save Changes
           </button>
        </div>
      </div>
    </div>
  );
};