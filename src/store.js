import { create } from 'zustand';
import { SUPABASE_CONFIG } from './config/supabase.config';

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

// Helper to save to localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Initialize Supabase credentials from config or localStorage
const initializeSupabaseCredentials = () => {
  // If config has values, use those (takes precedence)
  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    return {
      url: SUPABASE_CONFIG.url,
      anonKey: SUPABASE_CONFIG.anonKey,
      userId: SUPABASE_CONFIG.defaultUserId
    };
  }

  // Otherwise, load from localStorage (for backwards compatibility)
  return {
    url: loadFromStorage('supabase_url', ''),
    anonKey: loadFromStorage('supabase_anon_key', ''),
    userId: loadFromStorage('user_id', '')
  };
};

// Create Zustand store
const useStore = create((set, get) => ({
  // Wardrobe State
  categories: loadFromStorage('wardrobe_categories', [
    { id: 1, name: 'Workwear' },
    { id: 2, name: 'Smartwear' },
    { id: 3, name: 'Streetwear' },
    { id: 4, name: 'Casual Clothes' },
    { id: 5, name: 'Active Clothes' },
    { id: 6, name: 'Other' }
  ]),

  wardrobeData: loadFromStorage('wardrobe_data', {
    1: {
      over: ['Suit: Navy + Charcoal'],
      tops: ['10x Uniqlo Shirts'],
      bottoms: ['Pants: Navy + Charcoal'],
      shoes: ['Oxfords', 'Tassel Loafers'],
      accessories: [],
      brands: []
    },
    2: {
      over: ['Half Zips: RM + SS', 'Full Zips: SS'],
      tops: ['Polos: SS', 'Casual Shirt'],
      bottoms: ['Pants: Navy + Sand + Linen', 'Shorts: Sand Linen shorts'],
      shoes: ['White Sneakers', 'Casual Loafers', 'Birk Sandals'],
      accessories: [],
      brands: []
    },
    3: {
      over: ['Hoodies: Black + ILU', 'Jacket: Grey zip'],
      tops: ['2x White Shirts', '3x Oversized shirts'],
      bottoms: ['Jeans: brown carpenter, black, light navy', 'Jean shorts: light navy, black'],
      shoes: ['Brown dunk lows', 'CDG Converses', 'Birk Clogs'],
      accessories: [],
      brands: []
    },
    4: {
      over: ['Sweater: Grey'],
      tops: ['2x navy shirts'],
      bottoms: ['straight leg trackpant: black + grey', 'ribbed cuff trackpant: black + blue', 'trackshorts: black + grey'],
      shoes: ['Home Slippers/uggs'],
      accessories: [],
      brands: []
    },
    5: {
      over: ['2xu spacer hoodie'],
      tops: ['black/navy t-shirt', 'black + white singlet', 'compression + half-zip'],
      bottoms: ['Shorts: 3x gymshark/asic'],
      shoes: ['Reeboks (Lifting)', 'Nike V5 RNR (Cardio)', 'Shower Slides (Adidas)'],
      accessories: [],
      brands: []
    },
    6: {
      over: [],
      tops: [],
      bottoms: ['Hiking/Fleece pants', 'Boardshorts'],
      shoes: [],
      accessories: [],
      brands: []
    }
  }),

  wishlist: new Set(loadFromStorage('wardrobe_wishlist', [])),
  brandUrls: loadFromStorage('wardrobe_brand_urls', {}),
  wishlistUrls: loadFromStorage('wardrobe_wishlist_urls', {}),
  imageUrls: loadFromStorage('wardrobe_image_urls', {}),
  itemNotes: loadFromStorage('wardrobe_item_notes', {}),

  // Fit Cards State - saved outfit combinations (over/top/bottom/shoes)
  fitCards: loadFromStorage('fitCards', []),

  // Grooming State
  groomingData: loadFromStorage('groomingData', {
    am: [
      ['Gentle Cleanser', 'CeraVe Hydrating Cleanser', ''],
      ['Toner', 'Thayers Witch Hazel', ''],
      ['Vitamin C Serum', 'The Ordinary Vitamin C 23%', ''],
      ['Moisturizer', 'Cetaphil Daily Hydrating Lotion', ''],
      ['Sunscreen SPF 50', 'La Roche-Posay Anthelios', '']
    ],
    pm: [
      ['Oil Cleanser', 'DHC Deep Cleansing Oil', ''],
      ['Foaming Cleanser', 'CeraVe Foaming Facial Cleanser', ''],
      ['Exfoliant', 'Paula\'s Choice 2% BHA - 2-3x/week', ''],
      ['Retinol Serum', 'The Ordinary Retinol 0.5%', ''],
      ['Night Cream', 'Neutrogena Hydro Boost Night', '']
    ],
    shaving: [
      ['Face: Wet Shave', 'Every other day - Safety razor', ''],
      ['Body: Trimmer', 'Weekly - Guard #2', ''],
      ['Laser: Back & Shoulders', 'Session 4/8 - Next: Nov 15', '']
    ],
    hair: [
      ['Shampoo', 'Olaplex No. 4 - 2-3x/week', ''],
      ['Conditioner', 'Olaplex No. 5', ''],
      ['Hair Oil', 'Moroccanoil - 1-2 pumps', ''],
      ['Styling', 'Baxter Clay Pomade', '']
    ],
    perfumes: [
      ['Daily: Bleu de Chanel', 'Woody aromatic', ''],
      ['Evening: Dior Sauvage', 'Fresh spicy', ''],
      ['Summer: Acqua di Gio', 'Aquatic citrus', '']
    ],
    supplements: [
      ['Morning: Multivitamin', 'Garden of Life Men\'s Multi', ''],
      ['Morning: Vitamin D3', '5000 IU', ''],
      ['Morning: Omega-3', 'Nordic Naturals - 2 caps', ''],
      ['Evening: Magnesium', '400mg before bed', '']
    ],
    treatments: [
      ['Treatment Name', 'Details', ''],
      ['Treatment Name', 'Details', '']
    ],
    notes: ''
  }),

  // Supabase Settings - Auto-initialize from config or localStorage
  ...(() => {
    const { url, anonKey, userId } = initializeSupabaseCredentials();
    return {
      supabaseUrl: url,
      supabaseAnonKey: anonKey,
      userId: userId
    };
  })(),

  // Blueprint State
  blueprintData: loadFromStorage('blueprintData', {
    dailyMantra: '',
    dailyMantraDate: '', // Track when the mantra was last set
    dailyIntentions: '',
    weeklyIntentions: '',
    todoContent: '',
    lifeNow: {
      training: 'gym + cardio + diet',
      reading: 'sidequests',
      sports: 'tennis, golf',
      practices: [
        'Morning frame check and intention setting',
        'Awareness throughout the day',
        'Evening reflection'
      ],
      dailyGoals: [
        '20min meditation/discomfort sit',
        'approval seeking detection log',
        'one hard thing over optimal by by by'
      ]
    },
    lifeNextYear: {
      career: 'UBS + marketwatch/writeups',
      reading: 'fintwit, substack, books, news',
      training: 'Training',
      activities: 'Poker/Tennis/Golf',
      travel: 'skiing/surfing'
    }
  }),

  // Weekly Tracker State
  weeklyTracker: loadFromStorage('weeklyTracker', {
    currentWeek: {
      weekStart: null, // Monday of current week
      gymSessions: 0,
      zone2Minutes: 0
    },
    history: [] // Array of past weeks: { weekStart, gymSessions, zone2Minutes }
  }),

  // Daily Reflection State
  dailyReflection: loadFromStorage('dailyReflection', {
    currentDate: null,
    answers: ['', '', '', '', ''], // 5 questions
    submitted: [false, false, false, false, false], // Track which questions are submitted
    history: [] // Array of past reflections: { date, answers }
  }),

  // Weight Tracking State
  weightData: loadFromStorage('weightData', {
    entries: [] // Array of weight entries: { date, weight }
  }),

  // Food Planner State
  foodData: loadFromStorage('foodData', {
    groceryList: [], // Array of grocery items: { text, checked }
    mealPlan: {
      monday: { breakfast: '', lunch: '', dinner: '', snack: '' },
      tuesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
      wednesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
      thursday: { breakfast: '', lunch: '', dinner: '', snack: '' },
      friday: { breakfast: '', lunch: '', dinner: '', snack: '' },
      saturday: { breakfast: '', lunch: '', dinner: '', snack: '' },
      sunday: { breakfast: '', lunch: '', dinner: '', snack: '' }
    },
    mealPlans: {}, // Week-based meal plans: { 'YYYY-MM-DD': { monday: {...}, ... } }
    recipes: [], // Array of recipes: { name, description, tag }
    inspo: '' // Inspo notepad for meal ideas
  }),

  // Media Tracker State
  mediaData: loadFromStorage('mediaData', {
    consumed: [], // Array of consumed media items
    toConsume: [], // Array of media to consume (consolidated read/watch list)
    weeklyRecaps: [], // Array of weekly recaps
    frameworks: [] // Array of frameworks: { id, title, description, examples, dateAdded }
  }),

  // Network Tracker State
  networkData: loadFromStorage('networkData', {
    contacts: [], // Array of contacts: { id, name, company, position, location, linkedin_url, notes, date_added, last_contact_date, contact_type, status }
    weeklyPlanner: [] // Array of contact IDs for this week's catch-ups (max 3)
  }),

  // Actions for Wardrobe
  updateCategories: (categories) => {
    set({ categories });
    saveToStorage('wardrobe_categories', categories);
  },

  updateWardrobe: (wardrobeData) => {
    set({ wardrobeData });
    saveToStorage('wardrobe_data', wardrobeData);
  },

  updateWishlist: (wishlist) => {
    set({ wishlist });
    saveToStorage('wardrobe_wishlist', Array.from(wishlist));
  },

  updateBrandUrls: (brandUrls) => {
    set({ brandUrls });
    saveToStorage('wardrobe_brand_urls', brandUrls);
  },

  updateWishlistUrls: (wishlistUrls) => {
    set({ wishlistUrls });
    saveToStorage('wardrobe_wishlist_urls', wishlistUrls);
  },

  updateImageUrls: (imageUrls) => {
    set({ imageUrls });
    saveToStorage('wardrobe_image_urls', imageUrls);
  },

  updateItemNotes: (itemNotes) => {
    set({ itemNotes });
    saveToStorage('wardrobe_item_notes', itemNotes);
  },

  // Actions for Fit Cards
  updateFitCards: (fitCards) => {
    set({ fitCards });
    saveToStorage('fitCards', fitCards);
  },

  // Actions for Grooming
  updateGrooming: (groomingData) => {
    set({ groomingData });
    saveToStorage('groomingData', groomingData);
  },

  // Actions for Blueprint
  updateBlueprint: (blueprintData) => {
    set({ blueprintData });
    saveToStorage('blueprintData', blueprintData);
  },

  // Actions for Weekly Tracker
  updateWeeklyTracker: (weeklyTracker) => {
    set({ weeklyTracker });
    saveToStorage('weeklyTracker', weeklyTracker);
  },

  // Actions for Daily Reflection
  updateDailyReflection: (dailyReflection) => {
    set({ dailyReflection });
    saveToStorage('dailyReflection', dailyReflection);
  },

  // Actions for Weight Tracking
  updateWeightData: (weightData) => {
    set({ weightData });
    saveToStorage('weightData', weightData);
  },

  // Actions for Food Planner
  updateFoodData: (foodData) => {
    set({ foodData });
    saveToStorage('foodData', foodData);
  },

  // Actions for Media Tracker
  updateMediaData: (mediaData) => {
    set({ mediaData });
    saveToStorage('mediaData', mediaData);
  },

  // Actions for Network Tracker
  updateNetworkData: (networkData) => {
    set({ networkData });
    saveToStorage('networkData', networkData);
  },

  // Actions for Supabase Settings
  updateSupabaseSettings: (url, anonKey, userId) => {
    set({ supabaseUrl: url, supabaseAnonKey: anonKey, userId });
    saveToStorage('supabase_url', url);
    saveToStorage('supabase_anon_key', anonKey);
    saveToStorage('user_id', userId);
  },

  // Reload all state from localStorage (useful after sync download)
  reloadFromStorage: () => {
    set({
      categories: loadFromStorage('wardrobe_categories', [
        { id: 1, name: 'Workwear' },
        { id: 2, name: 'Smartwear' },
        { id: 3, name: 'Streetwear' },
        { id: 4, name: 'Casual Clothes' },
        { id: 5, name: 'Active Clothes' },
        { id: 6, name: 'Other' }
      ]),
      wardrobeData: loadFromStorage('wardrobe_data', {
        1: {
          over: ['Suit: Navy + Charcoal'],
          tops: ['10x Uniqlo Shirts'],
          bottoms: ['Pants: Navy + Charcoal'],
          shoes: ['Oxfords', 'Tassel Loafers'],
          accessories: [],
          brands: []
        },
        2: {
          over: ['Half Zips: RM + SS', 'Full Zips: SS'],
          tops: ['Polos: SS', 'Casual Shirt'],
          bottoms: ['Pants: Navy + Sand + Linen', 'Shorts: Sand Linen shorts'],
          shoes: ['White Sneakers', 'Casual Loafers', 'Birk Sandals'],
          accessories: [],
          brands: []
        },
        3: {
          over: ['Hoodies: Black + ILU', 'Jacket: Grey zip'],
          tops: ['2x White Shirts', '3x Oversized shirts'],
          bottoms: ['Jeans: brown carpenter, black, light navy', 'Jean shorts: light navy, black'],
          shoes: ['Brown dunk lows', 'CDG Converses', 'Birk Clogs'],
          accessories: [],
          brands: []
        },
        4: {
          over: ['Sweater: Grey'],
          tops: ['2x navy shirts'],
          bottoms: ['straight leg trackpant: black + grey', 'ribbed cuff trackpant: black + blue', 'trackshorts: black + grey'],
          shoes: ['Home Slippers/uggs'],
          accessories: [],
          brands: []
        },
        5: {
          over: ['2xu spacer hoodie'],
          tops: ['black/navy t-shirt', 'black + white singlet', 'compression + half-zip'],
          bottoms: ['Shorts: 3x gymshark/asic'],
          shoes: ['Reeboks (Lifting)', 'Nike V5 RNR (Cardio)', 'Shower Slides (Adidas)'],
          accessories: [],
          brands: []
        },
        6: {
          over: [],
          tops: [],
          bottoms: ['Hiking/Fleece pants', 'Boardshorts'],
          shoes: [],
          accessories: [],
          brands: []
        }
      }),
      wishlist: new Set(loadFromStorage('wardrobe_wishlist', [])),
      brandUrls: loadFromStorage('wardrobe_brand_urls', {}),
      wishlistUrls: loadFromStorage('wardrobe_wishlist_urls', {}),
      imageUrls: loadFromStorage('wardrobe_image_urls', {}),
      itemNotes: loadFromStorage('wardrobe_item_notes', {}),
      fitCards: loadFromStorage('fitCards', []),
      groomingData: loadFromStorage('groomingData', {
        am: [
          ['Gentle Cleanser', 'CeraVe Hydrating Cleanser'],
          ['Toner', 'Thayers Witch Hazel'],
          ['Vitamin C Serum', 'The Ordinary Vitamin C 23%'],
          ['Moisturizer', 'Cetaphil Daily Hydrating Lotion'],
          ['Sunscreen SPF 50', 'La Roche-Posay Anthelios']
        ],
        pm: [
          ['Oil Cleanser', 'DHC Deep Cleansing Oil'],
          ['Foaming Cleanser', 'CeraVe Foaming Facial Cleanser'],
          ['Exfoliant', 'Paula\'s Choice 2% BHA - 2-3x/week'],
          ['Retinol Serum', 'The Ordinary Retinol 0.5%'],
          ['Night Cream', 'Neutrogena Hydro Boost Night']
        ],
        shaving: [
          ['Face: Wet Shave', 'Every other day - Safety razor'],
          ['Body: Trimmer', 'Weekly - Guard #2'],
          ['Laser: Back & Shoulders', 'Session 4/8 - Next: Nov 15']
        ],
        hair: [
          ['Shampoo', 'Olaplex No. 4 - 2-3x/week'],
          ['Conditioner', 'Olaplex No. 5'],
          ['Hair Oil', 'Moroccanoil - 1-2 pumps'],
          ['Styling', 'Baxter Clay Pomade']
        ],
        perfumes: [
          ['Daily: Bleu de Chanel', 'Woody aromatic'],
          ['Evening: Dior Sauvage', 'Fresh spicy'],
          ['Summer: Acqua di Gio', 'Aquatic citrus']
        ],
        supplements: [
          ['Morning: Multivitamin', 'Garden of Life Men\'s Multi'],
          ['Morning: Vitamin D3', '5000 IU'],
          ['Morning: Omega-3', 'Nordic Naturals - 2 caps'],
          ['Evening: Magnesium', '400mg before bed']
        ],
        treatments: [
          ['Treatment Name', 'Details'],
          ['Treatment Name', 'Details']
        ],
        notes: ''
      }),
      blueprintData: loadFromStorage('blueprintData', {
        dailyMantra: '',
        dailyMantraDate: '',
        dailyIntentions: '',
        weeklyIntentions: '',
        todoContent: '',
        lifeNow: {
          training: 'gym + cardio + diet',
          reading: 'sidequests',
          sports: 'tennis, golf',
          practices: [
            'Morning frame check and intention setting',
            'Awareness throughout the day',
            'Evening reflection'
          ],
          dailyGoals: [
            '20min meditation/discomfort sit',
            'approval seeking detection log',
            'one hard thing over optimal by by by'
          ]
        },
        lifeNextYear: {
          career: 'UBS + marketwatch/writeups',
          reading: 'fintwit, substack, books, news',
          training: 'Training',
          activities: 'Poker/Tennis/Golf',
          travel: 'skiing/surfing'
        }
      }),
      weeklyTracker: loadFromStorage('weeklyTracker', {
        currentWeek: {
          weekStart: null,
          gymSessions: 0,
          zone2Minutes: 0
        },
        history: []
      }),
      dailyReflection: loadFromStorage('dailyReflection', {
        currentDate: null,
        answers: ['', '', '', '', ''],
        submitted: [false, false, false, false, false],
        history: []
      }),
      weightData: loadFromStorage('weightData', {
        entries: []
      }),
      foodData: loadFromStorage('foodData', {
        groceryList: [],
        mealPlan: {
          monday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          tuesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          wednesday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          thursday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          friday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          saturday: { breakfast: '', lunch: '', dinner: '', snack: '' },
          sunday: { breakfast: '', lunch: '', dinner: '', snack: '' }
        },
        mealPlans: {},
        recipes: [],
        inspo: ''
      }),
      mediaData: loadFromStorage('mediaData', {
        consumed: [],
        toConsume: [],
        weeklyRecaps: [],
        frameworks: [] // { id, title, description, examples, dateAdded }
      }),
      networkData: loadFromStorage('networkData', {
        contacts: [],
        weeklyPlanner: []
      })
    });
  }
}));

export default useStore;
