// MasterData.ts - Sabhi Categories ka Dummy Data
export const MASTER_CATALOG = [
  {
    category: "General Store",
    type: "BRANDED",
    icon: "🛒",
    products: [
      { id: "g1", name: "Maggi 70g", price: 14, image: "https://m.media-amazon.com/images/I/81096-UStpL._SL1500_.jpg" },
      { id: "g2", name: "Fortune Oil 1L", price: 125, image: "https://m.media-amazon.com/images/I/61mNStpM-ML._SL1000_.jpg" },
      { id: "g3", name: "Tata Tea 250g", price: 150, image: "https://m.media-amazon.com/images/I/61ByXAtuS2L._SL1000_.jpg" },
      { id: "g4", name: "Aashirvaad Atta 5kg", price: 260, image: "https://m.media-amazon.com/images/I/81S6UId7pJL._SL1500_.jpg" },
      { id: "g5", name: "Lux Soap", price: 35, image: "https://m.media-amazon.com/images/I/51sh367Y38L.jpg" },
      { id: "g6", name: "Colgate Paste", price: 55, image: "https://m.media-amazon.com/images/I/61p-CqNq01L._SL1000_.jpg" },
    ]
  },
  {
    category: "मिष्ठान्न भंडार",
    type: "UNIQUE",
    icon: "🍰",
    products: [
      { id: "s1", name: "Kaju Katli", price: 800, image: "https://5.imimg.com/data5/SELLER/Default/2021/3/RE/HI/TM/125345711/kaju-katli.jpg" },
      { id: "s2", name: "Gulab Jamun", price: 320, image: "https://m.media-amazon.com/images/I/71YvR5O-DkL._SL1500_.jpg" },
      { id: "s3", name: "Desi Ghee Laddu", price: 550, image: "https://m.media-amazon.com/images/I/81S6UId7pJL._SL1500_.jpg" },
    ]
  },
  {
    category: "Restaurants (Food)",
    type: "UNIQUE",
    icon: "🍔",
    products: [
      { id: "r1", name: "Paneer Butter Masala", price: 220, image: "https://m.media-amazon.com/images/I/91M9pUv-nGL._UL1500_.jpg" },
      { id: "r2", name: "Veg Deluxe Thali", price: 180, image: "https://m.media-amazon.com/images/I/71u96-T5v6L._UL1500_.jpg" },
      { id: "r3", name: "Special Pizza", price: 299, image: "https://m.media-amazon.com/images/I/61p-CqNq01L._SL1000_.jpg" },
    ]
  },
  {
    category: "Clothes & Fashion",
    type: "UNIQUE",
    icon: "👗",
    products: [
      { id: "f1", name: "Cotton Saree", price: 1200, image: "https://m.media-amazon.com/images/I/91M9pUv-nGL._UL1500_.jpg" },
      { id: "f2", name: "Party Wear Dress", price: 2500, image: "https://m.media-amazon.com/images/I/71u96-T5v6L._UL1500_.jpg" },
      { id: "f3", name: "Men's Casual Shirt", price: 850, image: "https://m.media-amazon.com/images/I/61p-CqNq01L._SL1000_.jpg" },
    ]
  },
  {
    category: "Mobile & Accessories",
    type: "BRANDED",
    icon: "📱",
    products: [
      { id: "m1", name: "iPhone 15 Case", price: 499, image: "https://m.media-amazon.com/images/I/71VW8LmqcPL._SL1500_.jpg" },
      { id: "m2", name: "Bluetooth Earbuds", price: 1299, image: "https://m.media-amazon.com/images/I/817WWpaGyVL._SL1500_.jpg" },
      { id: "m3", name: "Fast Charger", price: 899, image: "https://m.media-amazon.com/images/I/51ipNfWXY7L._SL1500_.jpg" },
    ]
  },
  {
    category: "Toys & Gifts",
    type: "UNIQUE",
    icon: "🧸",
    products: [
      { id: "t1", name: "Remote Control Car", price: 1200, image: "https://m.media-amazon.com/images/I/81096-UStpL._SL1500_.jpg" },
      { id: "t2", name: "Soft Teddy Bear", price: 500, image: "https://m.media-amazon.com/images/I/61ByXAtuS2L._SL1000_.jpg" },
      { id: "t3", name: "Birthday Gift Pack", price: 450, image: "https://m.media-amazon.com/images/I/81S6UId7pJL._SL1500_.jpg" },
    ]
  },
  {
    category: "Shoes Store",
    type: "UNIQUE",
    icon: "👟",
    products: [
      { id: "sh1", name: "Running Shoes", price: 1599, image: "https://m.media-amazon.com/images/I/61ByXAtuS2L._SL1000_.jpg" },
      { id: "sh2", name: "Formal Shoes", price: 2200, image: "https://m.media-amazon.com/images/I/81096-UStpL._SL1500_.jpg" },
      { id: "sh3", name: "Sports Sandals", price: 899, image: "https://m.media-amazon.com/images/I/51sh367Y38L.jpg" },
    ]
  },
  {
    category: "TV & Fridge (Electronics)",
    type: "BRANDED",
    icon: "📺",
    products: [
      { id: "e1", name: "32 inch LED TV", price: 12500, image: "https://m.media-amazon.com/images/I/71u96-T5v6L._UL1500_.jpg" },
      { id: "e2", name: "Single Door Fridge", price: 14500, image: "https://m.media-amazon.com/images/I/71VW8LmqcPL._SL1500_.jpg" },
      { id: "e3", name: "Washing Machine", price: 18900, image: "https://m.media-amazon.com/images/I/817WWpaGyVL._SL1500_.jpg" },
    ]
  },
  {
    category: "Beauty & Personal Care",
    type: "BRANDED",
    icon: "💄",
    products: [
      { id: "b1", name: "Matte Lipstick", price: 299, image: "https://m.media-amazon.com/images/I/51sh367Y38L.jpg" },
      { id: "b2", name: "Face Wash", price: 150, image: "https://m.media-amazon.com/images/I/61p-CqNq01L._SL1000_.jpg" },
      { id: "b3", name: "Hair Serum", price: 350, image: "https://m.media-amazon.com/images/I/61ByXAtuS2L._SL1000_.jpg" },
    ]
  },
  {
    category: "Kids Zone",
    type: "UNIQUE",
    icon: "👶",
    products: [
      { id: "k1", name: "Baby Diapers", price: 450, image: "https://m.media-amazon.com/images/I/81S6UId7pJL._SL1500_.jpg" },
      { id: "k2", name: "Baby Lotion", price: 220, image: "https://m.media-amazon.com/images/I/61mNStpM-ML._SL1000_.jpg" },
      { id: "k3", name: "Kids School Bag", price: 799, image: "https://m.media-amazon.com/images/I/81096-UStpL._SL1500_.jpg" },
    ]
  }
];