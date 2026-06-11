'use client';

import React, { useState } from 'react';
import { Property } from '../../lib/types';

interface OwnerListingFormProps {
  onBack: () => void;
  onSubmit: (property: Property) => void;
}

export default function OwnerListingForm({ onBack, onSubmit }: OwnerListingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '', description: '',
    propertyType: 'room' as 'room' | 'land' | 'plot',
    listingType: 'rent' as 'rent' | 'sale',
    price: '', size: '', sizeUnit: 'sqft',
    roomConfig: '', landType: '', furnishedStatus: '',
    address: '', locality: '', city: '', state: 'Delhi', pincode: '',
    amenities: [] as string[], availableFrom: '',
  });

  const amenitiesList = ['AC', 'WiFi', 'Parking', 'Power Backup', 'Lift', 'Water Supply', 'Swimming Pool', 'Gym', 'Modular Kitchen', 'Furnished', '24/7 Security', 'Covered Parking', 'Servant Quarter', 'Garden', 'Play Area', 'CCTV'];
  const updateForm = (key: string, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));
  const toggleAmenity = (amenity: string) => setFormData((prev) => ({ ...prev, amenities: prev.amenities.includes(amenity) ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity] }));

  const handleSubmit = () => {
    const newProperty: Property = {
      id: `prop-${Date.now()}`, title: formData.title, description: formData.description,
      propertyType: formData.propertyType, listingType: formData.listingType,
      price: Number(formData.price), priceUnit: formData.listingType === 'rent' ? 'month' : 'total',
      size: Number(formData.size), sizeUnit: formData.sizeUnit as any,
      roomConfig: formData.roomConfig as any || undefined, landType: formData.landType as any || undefined,
      furnishedStatus: formData.furnishedStatus as any || undefined,
      address: formData.address, locality: formData.locality, city: formData.city,
      state: formData.state, pincode: formData.pincode,
      latitude: 28.6139 + Math.random() * 0.1, longitude: 77.2090 + Math.random() * 0.1,
      photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
      amenities: formData.amenities, ownerId: 'user-1', ownerName: 'Rajesh Kumar',
      ownerPhone: '+91 98765 43210', verified: 'pending', status: 'active', featured: false,
      availableFrom: formData.availableFrom || new Date().toISOString(),
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), views: 0, saves: 0,
    };
    onSubmit(newProperty);
  };

  const totalSteps = 3;
  const inputClass = "w-full px-4 py-3 bg-white dark:bg-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium";

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-600 dark:text-zinc-300"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">List Your Property</h1>
            <p className="text-[10px] text-zinc-400 font-medium">Step {step} of {totalSteps}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-gradient-to-r from-indigo-500 to-cyan-500' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {step === 1 && (
          <>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Basic Details</h2>
            <div>
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Property Type</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'room', label: 'Room/Flat' },
                  { value: 'land', label: 'Land' },
                  { value: 'plot', label: 'Plot' },
                ].map((pt) => (
                  <button key={pt.value} onClick={() => updateForm('propertyType', pt.value)}
                    className={`py-3.5 rounded-2xl text-xs font-semibold transition-all duration-300 flex flex-col items-center gap-1.5 ${
                      formData.propertyType === pt.value
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700/50'
                    }`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {pt.value === 'room' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                      {pt.value === 'land' && <><path d="M12 2L2 22h20L12 2z"/><path d="M8 22l4-10 4 10"/></>}
                      {pt.value === 'plot' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
                    </svg>
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Listing Type</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[{ value: 'rent', label: 'Rent' }, { value: 'sale', label: 'Buy' }].map((lt) => (
                  <button key={lt.value} onClick={() => updateForm('listingType', lt.value)}
                    className={`py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      formData.listingType === lt.value
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-700/50'
                    }`}>
                    {lt.label}
                  </button>
                ))}
              </div>
            </div>
            <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Property Title</label><input type="text" value={formData.title} onChange={(e) => updateForm('title', e.target.value)} placeholder="e.g. Spacious 2BHK in Lajpat Nagar" className={inputClass} /></div>
            <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Description</label><textarea value={formData.description} onChange={(e) => updateForm('description', e.target.value)} placeholder="Describe your property..." rows={4} className={`${inputClass} resize-none`} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Price (₹)</label><input type="number" value={formData.price} onChange={(e) => updateForm('price', e.target.value)} placeholder={formData.listingType === 'rent' ? 'e.g. 15000' : 'e.g. 5000000'} className={inputClass} /></div>
              <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Size</label><div className="flex gap-2"><input type="number" value={formData.size} onChange={(e) => updateForm('size', e.target.value)} placeholder="Size" className={`flex-1 ${inputClass}`} /><select value={formData.sizeUnit} onChange={(e) => updateForm('sizeUnit', e.target.value)} className={`w-20 ${inputClass}`}><option value="sqft">sqft</option><option value="sqyd">sq yd</option><option value="acre">acre</option><option value="bigha">bigha</option></select></div></div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Location & Amenities</h2>
            <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Address</label><input type="text" value={formData.address} onChange={(e) => updateForm('address', e.target.value)} placeholder="Full address" className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Locality</label><input type="text" value={formData.locality} onChange={(e) => updateForm('locality', e.target.value)} placeholder="e.g. Lajpat Nagar" className={inputClass} /></div>
              <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">City</label><input type="text" value={formData.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="e.g. New Delhi" className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">State</label><select value={formData.state} onChange={(e) => updateForm('state', e.target.value)} className={inputClass}><option>Delhi</option><option>Haryana</option><option>Uttar Pradesh</option><option>Rajasthan</option></select></div>
              <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Pincode</label><input type="text" value={formData.pincode} onChange={(e) => updateForm('pincode', e.target.value)} placeholder="110024" className={inputClass} /></div>
            </div>
            <div className="p-5 bg-white dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-center shadow-sm">
              <p className="mb-2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </p>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Drop Pin on Map</p>
              <p className="text-xs text-zinc-400 mt-1">Auto-fill via GPS or tap to drop pin</p>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 block uppercase tracking-wider">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity) => (
                  <button key={amenity} onClick={() => toggleAmenity(amenity)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-300 ${
                      formData.amenities.includes(amenity)
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700/50'
                    }`}>
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Photos & Availability</h2>
            <div>
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Upload Photos (max 10)</label>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="aspect-square bg-white dark:bg-zinc-800 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all duration-300">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span className="text-[10px] text-zinc-400 font-medium mt-1">Add Photo</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 font-medium">Upload up to 10 photos + 1 video or 360° tour</p>
            </div>
            <div><label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 block uppercase tracking-wider">Available From</label><input type="date" value={formData.availableFrom} onChange={(e) => updateForm('availableFrom', e.target.value)} className={inputClass} /></div>
            <div className="p-5 bg-white dark:bg-zinc-800 rounded-2xl space-y-2 shadow-sm border border-zinc-100 dark:border-zinc-700/50">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Preview</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">{formData.title || 'Your property title'}</p>
              <p className="text-xl font-extrabold text-gradient">₹{Number(formData.price || 0).toLocaleString('en-IN')}{formData.listingType === 'rent' ? '/mo' : ''}</p>
              <p className="text-xs text-zinc-500 font-medium">{formData.size} {formData.sizeUnit} • {formData.locality || 'Location'}</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200/50 dark:border-amber-800/30">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">You have <strong>3 free listings</strong> remaining. After that, ₹99/month for unlimited listings. Featured boost: ₹199.</p>
            </div>
          </>
        )}
      </div>

      <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 bg-white dark:bg-zinc-900">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="px-6 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-semibold rounded-2xl text-sm">Back</button>
        )}
        <button
          onClick={() => step < totalSteps ? setStep(step + 1) : handleSubmit()}
          disabled={step === 1 && (!formData.title || !formData.price)}
          className="flex-1 py-3.5 btn-luxury text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step < totalSteps ? 'Next →' : 'Create Listing'}
        </button>
      </div>
    </div>
  );
}
