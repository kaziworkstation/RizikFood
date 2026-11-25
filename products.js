/* ==========================================================
   products.js  — ডেমো প্রোডাক্ট ডেটা
   .NET MVC তে কনভার্ট করার সময় এই অ্যারেটি Model/Database
   (Product, Category) থেকে আসবে এবং JSON হিসেবে View-তে যাবে।
   price = প্রতি ১ কেজির দাম (৳)। variants = ওজন অনুযায়ী গুণক।
   ========================================================== */

const CATEGORIES = [
  { id: "all",    name: "সব পণ্য" },
  { id: "ghee",   name: "ঘী" },
  { id: "honey",  name: "মধু" },
  { id: "nuts",   name: "বাদাম" },
  { id: "raisin", name: "কিসমিস" },
  { id: "dry",    name: "ড্রাই ফ্রুটস" },
  { id: "dates",  name: "খেজুর" }
];

/* ওজন অপশন: label, কেজির অনুপাত (factor) */
const WEIGHTS = {
  kg: [
    { label: "২৫০ গ্রাম", factor: 0.25 },
    { label: "৫০০ গ্রাম", factor: 0.5 },
    { label: "১ কেজি",    factor: 1 }
  ],
  liquid: [
    { label: "২৫০ গ্রাম", factor: 0.25 },
    { label: "৫০০ গ্রাম", factor: 0.5 },
    { label: "১ কেজি",    factor: 1 },
    { label: "২ কেজি",    factor: 2 }
  ]
};

const PRODUCTS = [
  /* ---------- ঘী ---------- */
  { id: 1,  name: "খাঁটি গাওয়া ঘী",       en: "Pure Gawa Ghee",       cat: "ghee",   price: 1450, oldPrice: 1650, emoji: "🧈", bg: "#fff3c4", weights: "liquid", badge: "বেস্টসেলার", rating: 4.9, reviews: 312, desc: "গরুর দুধের সর থেকে তৈরি ঐতিহ্যবাহী গাওয়া ঘী। রান্না ও পরোটায় দারুণ ঘ্রাণ।" },
  { id: 2,  name: "দেশি গরুর ঘী",          en: "Desi Cow Ghee",        cat: "ghee",   price: 1750, oldPrice: null, emoji: "🧈", bg: "#ffe9a8", weights: "liquid", badge: "অর্গানিক", rating: 4.8, reviews: 189, desc: "দেশি গরুর দুধ থেকে ধীরে জ্বালানো ঘী, প্রিজারভেটিভ ছাড়া।" },
  { id: 3,  name: "মহিষের ঘী",             en: "Buffalo Ghee",         cat: "ghee",   price: 1350, oldPrice: 1500, emoji: "🫙", bg: "#fff0b8", weights: "liquid", badge: "অফার", rating: 4.6, reviews: 97, desc: "ঘন ও স্বাদে ভরপুর মহিষের দুধের ঘী।" },

  /* ---------- মধু ---------- */
  { id: 4,  name: "সুন্দরবনের খলিশা মধু",  en: "Sundarban Khalisha Honey", cat: "honey", price: 900,  oldPrice: 1050, emoji: "🍯", bg: "#ffd98a", weights: "liquid", badge: "সুন্দরবন", rating: 4.9, reviews: 441, desc: "খলিশা ফুলের নির্যাসে তৈরি প্রাকৃতিক মধু, হালকা টক-মিষ্টি স্বাদ।" },
  { id: 5,  name: "সরিষা ফুলের মধু",       en: "Mustard Flower Honey", cat: "honey",  price: 650,  oldPrice: null, emoji: "🍯", bg: "#ffe39a", weights: "liquid", badge: null, rating: 4.7, reviews: 268, desc: "সরিষা মৌসুমের ঘন, ক্রিমি মধু। শীতে সবচেয়ে জনপ্রিয়।" },
  { id: 6,  name: "লিচু ফুলের মধু",        en: "Litchi Flower Honey",  cat: "honey",  price: 750,  oldPrice: 820, emoji: "🍯", bg: "#ffdb9e", weights: "liquid", badge: "নতুন", rating: 4.8, reviews: 120, desc: "লিচু বাগান থেকে সংগ্রহ করা সুগন্ধি মধু।" },
  { id: 7,  name: "কালিজিরা ফুলের মধু",    en: "Black Seed Honey",     cat: "honey",  price: 1100, oldPrice: null, emoji: "🍯", bg: "#f5c26b", weights: "liquid", badge: "প্রিমিয়াম", rating: 4.9, reviews: 203, desc: "গাঢ় রঙ ও ঝাঁঝালো স্বাদের কালিজিরা মধু, স্বাস্থ্যসচেতনদের প্রিয়।" },

  /* ---------- বাদাম ---------- */
  { id: 8,  name: "কাঠবাদাম",              en: "Almonds",              cat: "nuts",   price: 1600, oldPrice: 1800, emoji: "🌰", bg: "#f3dfc1", weights: "kg", badge: "বেস্টসেলার", rating: 4.8, reviews: 356, desc: "আমেরিকান ক্যালিফোর্নিয়া কাঠবাদাম, মচমচে ও সতেজ।" },
  { id: 9,  name: "কাজুবাদাম (গোটা)",      en: "Cashew Nuts",          cat: "nuts",   price: 1900, oldPrice: null, emoji: "🥜", bg: "#f6e6c8", weights: "kg", badge: null, rating: 4.7, reviews: 244, desc: "ভিয়েতনামি W320 গ্রেডের বড় সাইজের কাজুবাদাম।" },
  { id: 10, name: "পেস্তা বাদাম",          en: "Pistachios",           cat: "nuts",   price: 2600, oldPrice: 2850, emoji: "🥜", bg: "#dfeccb", weights: "kg", badge: "প্রিমিয়াম", rating: 4.8, reviews: 131, desc: "খোসা ছাড়ানো, হালকা লবণাক্ত ইরানি পেস্তা।" },
  { id: 11, name: "আখরোট",                 en: "Walnuts",              cat: "nuts",   price: 1750, oldPrice: null, emoji: "🌰", bg: "#ead5b5", weights: "kg", badge: null, rating: 4.6, reviews: 88, desc: "ওমেগা-৩ সমৃদ্ধ খোসা ছাড়ানো চিলিয়ান আখরোট।" },
  { id: 12, name: "চিনাবাদাম (রোস্টেড)",   en: "Roasted Peanuts",      cat: "nuts",   price: 280,  oldPrice: null, emoji: "🥜", bg: "#f1dcb9", weights: "kg", badge: "সাশ্রয়ী", rating: 4.5, reviews: 402, desc: "হালকা লবণ দেওয়া ভাজা চিনাবাদাম, আড্ডার সঙ্গী।" },

  /* ---------- কিসমিস ---------- */
  { id: 13, name: "সবুজ কিসমিস",           en: "Green Raisins",        cat: "raisin", price: 850,  oldPrice: 950, emoji: "🍇", bg: "#e4efc0", weights: "kg", badge: "অফার", rating: 4.7, reviews: 175, desc: "বীজহীন আফগান সবুজ কিসমিস, রসালো ও মিষ্টি।" },
  { id: 14, name: "কালো কিসমিস",           en: "Black Raisins",        cat: "raisin", price: 780,  oldPrice: null, emoji: "🍇", bg: "#d9cce6", weights: "kg", badge: null, rating: 4.6, reviews: 143, desc: "পায়েস ও পোলাওয়ের জন্য আদর্শ কালো কিসমিস।" },
  { id: 15, name: "গোল্ডেন কিসমিস",        en: "Golden Raisins",       cat: "raisin", price: 900,  oldPrice: null, emoji: "🍇", bg: "#fbe8a0", weights: "kg", badge: "নতুন", rating: 4.8, reviews: 76, desc: "সোনালি রঙের নরম কিসমিস, কেক ও ডেজার্টে দারুণ।" },

  /* ---------- ড্রাই ফ্রুটস ---------- */
  { id: 16, name: "শুকনো এপ্রিকট",         en: "Dried Apricots",       cat: "dry",    price: 1200, oldPrice: 1350, emoji: "🍑", bg: "#ffd3a8", weights: "kg", badge: null, rating: 4.7, reviews: 109, desc: "তুর্কি এপ্রিকট, আয়রন ও ফাইবারে ভরপুর।" },
  { id: 17, name: "শুকনো ডুমুর",           en: "Dried Figs",           cat: "dry",    price: 1500, oldPrice: null, emoji: "🫐", bg: "#e5cfe0", weights: "kg", badge: "স্বাস্থ্যকর", rating: 4.6, reviews: 84, desc: "প্রাকৃতিক মিষ্টি, নরম ও চিউই আফগান ডুমুর।" },
  { id: 18, name: "মিক্সড ড্রাই ফ্রুট",    en: "Mixed Dry Fruits",     cat: "dry",    price: 1650, oldPrice: 1850, emoji: "🥗", bg: "#f9e0c0", weights: "kg", badge: "কম্বো", rating: 4.9, reviews: 267, desc: "কাঠবাদাম, কাজু, কিসমিস, আখরোট ও এপ্রিকটের মিশ্রণ।" },
  { id: 19, name: "শুকনো আলুবোখারা",       en: "Dried Prunes",         cat: "dry",    price: 950,  oldPrice: null, emoji: "🫐", bg: "#d6c3d9", weights: "kg", badge: null, rating: 4.5, reviews: 59, desc: "টক-মিষ্টি স্বাদের বীজহীন আলুবোখারা।" },

  /* ---------- খেজুর ---------- */
  { id: 20, name: "আজওয়া খেজুর",          en: "Ajwa Dates",           cat: "dates",  price: 2800, oldPrice: 3100, emoji: "🌴", bg: "#e7d2bd", weights: "kg", badge: "মদিনা", rating: 4.9, reviews: 521, desc: "মদিনার বিখ্যাত আজওয়া খেজুর, নরম ও মধুর স্বাদ।" },
  { id: 21, name: "মেডজুল খেজুর",          en: "Medjool Dates",        cat: "dates",  price: 1800, oldPrice: null, emoji: "🌴", bg: "#edd7bd", weights: "kg", badge: "জাম্বো", rating: 4.8, reviews: 298, desc: "বড় সাইজের ক্যারামেলের মতো মিষ্টি মেডজুল খেজুর।" },
  { id: 22, name: "সুকারি খেজুর",          en: "Sukkari Dates",        cat: "dates",  price: 1300, oldPrice: 1450, emoji: "🌴", bg: "#f3dfb6", weights: "kg", badge: "অফার", rating: 4.7, reviews: 214, desc: "সৌদি আরবের সোনালি, কচকচে ও মিষ্টি সুকারি।" }
];
