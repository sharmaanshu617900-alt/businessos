type Language = 'en' | 'hi';

const translations: Record<string, { en: string; hi: string }> = {
  // App
  'app.name': { en: 'GharDhoondo', hi: 'घर ढूंढो' },
  'app.tagline': { en: 'Find Your Perfect Home', hi: 'अपना सही घर खोजें' },
  'app.subtitle': { en: 'No brokers. Direct deals.', hi: 'कोई दलाल नहीं। सीधा सौदा।' },

  // Navigation
  'nav.map': { en: 'Map', hi: 'नक्शा' },
  'nav.favorites': { en: 'Favorites', hi: 'पसंदीदा' },
  'nav.alerts': { en: 'Alerts', hi: 'अलर्ट' },
  'nav.messages': { en: 'Messages', hi: 'संदेश' },
  'nav.listings': { en: 'My Listings', hi: 'मेरी लिस्टिंग' },
  'nav.admin': { en: 'Admin', hi: 'एडमिन' },

  // Map
  'map.search': { en: 'Search area, locality, city...', hi: 'इलाका, लोकैलिटी, शहर खोजें...' },
  'map.nearby': { en: 'Nearby Properties', hi: 'नज़दीकी प्रॉपर्टी' },
  'map.noResults': { en: 'No properties found nearby', hi: 'नज़दीक कोई प्रॉपर्टी नहीं मिली' },

  // Filters
  'filter.title': { en: 'Filters', hi: 'फ़िल्टर' },
  'filter.propertyType': { en: 'Property Type', hi: 'प्रॉपर्टी का प्रकार' },
  'filter.listingType': { en: 'I want to', hi: 'मैं चाहता हूँ' },
  'filter.rent': { en: 'Rent', hi: 'किराया' },
  'filter.buy': { en: 'Buy', hi: 'खरीदना' },
  'filter.budget': { en: 'Budget', hi: 'बजट' },
  'filter.size': { en: 'Size', hi: 'आकार' },
  'filter.furnished': { en: 'Furnished', hi: 'फर्निश्ड' },
  'filter.unfurnished': { en: 'Unfurnished', hi: 'अनफर्निश्ड' },
  'filter.semiFurnished': { en: 'Semi-Furnished', hi: 'सेमी-फर्निश्ड' },
  'filter.radius': { en: 'Distance', hi: 'दूरी' },
  'filter.apply': { en: 'Apply Filters', hi: 'फ़िल्टर लागू करें' },
  'filter.reset': { en: 'Reset', hi: 'रीसेट' },

  // Property
  'property.rooms': { en: 'rooms', hi: 'कमरे' },
  'property.photos': { en: 'Photos', hi: 'फ़ोटो' },
  'property.amenities': { en: 'Amenities', hi: 'सुविधाएँ' },
  'property.about': { en: 'About this property', hi: 'इस प्रॉपर्टी के बारे में' },
  'property.contact': { en: 'Contact Owner', hi: 'मालिक से संपर्क करें' },
  'property.chat': { en: 'Chat with Owner', hi: 'मालिक से चैट करें' },
  'property.save': { en: 'Save', hi: 'सेव करें' },
  'property.saved': { en: 'Saved', hi: 'सेव किया' },
  'property.share': { en: 'Share', hi: 'शेयर' },
  'property.views': { en: 'views', hi: 'व्यूज़' },
  'property.saves': { en: 'saves', hi: 'सेव' },
  'property.availableFrom': { en: 'Available from', hi: 'उपलब्ध' },
  'property.size': { en: 'Size', hi: 'आकार' },
  'property.price': { en: 'Price', hi: 'कीमत' },
  'property.perMonth': { en: '/month', hi: '/महीना' },
  'property.verified': { en: 'Verified', hi: 'सत्यापित' },
  'property.featured': { en: 'Featured', hi: 'विशेष' },
  'property.virtualTour': { en: 'Virtual Tour', hi: 'वर्चुअल टूर' },

  // Owner Panel
  'owner.listProperty': { en: 'List Your Property', hi: 'अपनी प्रॉपर्टी लिस्ट करें' },
  'owner.title': { en: 'Property Title', hi: 'प्रॉपर्टी का शीर्षक' },
  'owner.description': { en: 'Description', hi: 'विवरण' },
  'owner.price': { en: 'Price', hi: 'कीमत' },
  'owner.size': { en: 'Size', hi: 'आकार' },
  'owner.address': { en: 'Address', hi: 'पता' },
  'owner.photos': { en: 'Upload Photos (max 10)', hi: 'फ़ोटो अपलोड करें (अधिकतम 10)' },
  'owner.submit': { en: 'Create Listing', hi: 'लिस्टिंग बनाएँ' },
  'owner.location': { en: 'Drop Pin on Map', hi: 'नक्शे पर पिन लगाएँ' },

  // Chat
  'chat.placeholder': { en: 'Tell me what you need...', hi: 'बताएँ आपको क्या चाहिए...' },
  'chat.welcome': { en: 'Hi! I\'m your property assistant. Describe what you\'re looking for and I\'ll find the best options for you.', hi: 'नमस्ते! मैं आपका प्रॉपर्टी सहायक हूँ। बताएँ आपको क्या चाहिए और मैं आपके लिए सबसे अच्छे विकल्प ढूंढूंगा।' },
  'chat.thinking': { en: 'Thinking...', hi: 'सोच रहा हूँ...' },

  // Messages
  'messages.title': { en: 'Messages', hi: 'संदेश' },
  'messages.noConversations': { en: 'No conversations yet', hi: 'अभी कोई बातचीत नहीं' },
  'messages.typeMessage': { en: 'Type a message...', hi: 'संदेश लिखें...' },

  // Alerts
  'alerts.title': { en: 'Area Alerts', hi: 'इलाका अलर्ट' },
  'alerts.create': { en: 'Create Alert', hi: 'अलर्ट बनाएँ' },
  'alerts.description': { en: 'Get notified when new properties match your criteria', hi: 'नई प्रॉपर्टी मिलने पर सूचना पाएँ' },

  // Agreement
  'agreement.title': { en: 'Rent Agreement', hi: 'किराया समझौता' },
  'agreement.generate': { en: 'Generate Agreement', hi: 'समझौता बनाएँ' },
  'agreement.download': { en: 'Download PDF', hi: 'PDF डाउनलोड करें' },
  'agreement.tenant': { en: 'Tenant Name', hi: 'किरायेदार का नाम' },
  'agreement.owner': { en: 'Owner Name', hi: 'मालिक का नाम' },
  'agreement.rent': { en: 'Monthly Rent', hi: 'मासिक किराया' },
  'agreement.deposit': { en: 'Security Deposit', hi: 'सिक्योरिटी डिपॉज़िट' },
  'agreement.duration': { en: 'Duration (months)', hi: 'अवधि (महीने)' },
  'agreement.startDate': { en: 'Start Date', hi: 'शुरू होने की तारीख' },

  // Admin
  'admin.title': { en: 'Admin Dashboard', hi: 'एडमिन डैशबोर्ड' },
  'admin.totalListings': { en: 'Total Listings', hi: 'कुल लिस्टिंग' },
  'admin.activeListings': { en: 'Active', hi: 'सक्रिय' },
  'admin.flagged': { en: 'Flagged', hi: 'फ़्लैग की गई' },
  'admin.users': { en: 'Users', hi: 'उपयोगकर्ता' },
  'admin.topAreas': { en: 'Top Areas', hi: 'टॉप इलाके' },
  'admin.remove': { en: 'Remove', hi: 'हटाएँ' },
  'admin.verify': { en: 'Verify', hi: 'सत्यापित करें' },

  // Auth
  'auth.login': { en: 'Login', hi: 'लॉगिन' },
  'auth.register': { en: 'Register', hi: 'रजिस्टर' },
  'auth.phone': { en: 'Phone Number', hi: 'फ़ोन नंबर' },
  'auth.otp': { en: 'Enter OTP', hi: 'OTP दर्ज करें' },
  'auth.sendOtp': { en: 'Send OTP', hi: 'OTP भेजें' },

  // Common
  'common.rupees': { en: '₹', hi: '₹' },
  'common.sqft': { en: 'sq ft', hi: 'वर्ग फ़ीट' },
  'common.sqyd': { en: 'sq yd', hi: 'वर्ग गज़' },
  'common.km': { en: 'km', hi: 'किमी' },
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'common.error': { en: 'Something went wrong', hi: 'कुछ गड़बड़ हुई' },
  'common.retry': { en: 'Retry', hi: 'फिर से कोशिश करें' },
  'common.back': { en: 'Back', hi: 'वापस' },
  'common.next': { en: 'Next', hi: 'आगे' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.save': { en: 'Save', hi: 'सेव' },
  'common.delete': { en: 'Delete', hi: 'हटाएँ' },
  'common.edit': { en: 'Edit', hi: 'संपादित करें' },
};

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string): string {
  const translation = translations[key];
  if (!translation) return key;
  return translation[currentLanguage] || translation.en || key;
}


