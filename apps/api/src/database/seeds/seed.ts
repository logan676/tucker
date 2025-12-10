import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Merchant, MerchantStatus } from '../../modules/merchant/entities/merchant.entity';
import { Category } from '../../modules/merchant/entities/category.entity';
import { Product } from '../../modules/product/entities/product.entity';
import { ProductCategory } from '../../modules/product/entities/product-category.entity';
import { Coupon, DiscountType, CouponStatus } from '../../modules/coupon/entities/coupon.entity';
import { Banner, BannerType, BannerActionType } from '../../modules/banner/entities/banner.entity';
import { Review } from '../../modules/review/entities/review.entity';

// Real food images from Unsplash
const foodImages = {
  // Chinese food
  kungPaoChicken: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400',
  sweetSourPork: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
  dimSum: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
  friedRice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
  wontonSoup: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400',
  pekinDuck: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=400',
  mapoTofu: 'https://images.unsplash.com/photo-1582452919408-c3e85cfbd3e5?w=400',

  // Japanese food
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
  sashimi: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400',
  ramen: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400',
  tempura: 'https://images.unsplash.com/photo-1581781870027-04212e231e96?w=400',
  teriyaki: 'https://images.unsplash.com/photo-1609183480237-ccb4e9b20ffd?w=400',
  udon: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=400',

  // Korean food
  bibimbap: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400',
  koreanBbq: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
  kimchiStew: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400',
  friedChicken: 'https://images.unsplash.com/photo-1626645738196-c2a72c7ba4c6?w=400',
  tteokbokki: 'https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400',

  // Burgers & Fast food
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  cheeseBurger: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
  fries: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
  hotdog: 'https://images.unsplash.com/photo-1612392062631-94e9f2f65179?w=400',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400',

  // Pizza & Italian
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  pepperoniPizza: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
  pasta: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
  lasagna: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400',

  // Thai food
  padThai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400',
  greenCurry: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400',
  tomYum: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400',
  mangoStickyRice: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=400',

  // Indian food
  butterChicken: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
  naan: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
  samosa: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400',
  tandoori: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',

  // Seafood
  grilledFish: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400',
  shrimp: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
  lobster: 'https://images.unsplash.com/photo-1553247407-23251ce81f59?w=400',
  crab: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400',
  oysters: 'https://images.unsplash.com/photo-1606731219412-4400d397d4a0?w=400',

  // BBQ & Grill
  ribs: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
  brisket: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400',
  steak: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
  grilledChicken: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',

  // Hot Pot
  hotpot: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
  beefSlices: 'https://images.unsplash.com/photo-1602253057119-44d745d9b860?w=400',

  // Desserts
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  cheesecake: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
  tiramisu: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
  iceCream: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
  macaron: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400',

  // Drinks
  bubbleTea: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  latte: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
  smoothie: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
  juice: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400',

  // Salads & Healthy
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  pokeBowl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  acaiBowl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
  avocadoToast: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',

  // Breakfast
  pancakes: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
  eggsBenedict: 'https://images.unsplash.com/photo-1608039829572-9b5e13d4e0ce?w=400',
  frenchToast: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400',
  omelette: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400',
};

// Restaurant images
const restaurantImages = {
  chinese: {
    logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200',
    banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  },
  japanese: {
    logo: 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=200',
    banner: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800',
  },
  korean: {
    logo: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=200',
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  },
  burger: {
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200',
    banner: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800',
  },
  pizza: {
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200',
    banner: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=800',
  },
  thai: {
    logo: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=200',
    banner: 'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800',
  },
  indian: {
    logo: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200',
    banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  },
  seafood: {
    logo: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=200',
    banner: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800',
  },
  bbq: {
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
    banner: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800',
  },
  cafe: {
    logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
    banner: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
  },
  dessert: {
    logo: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
    banner: 'https://images.unsplash.com/photo-1517433670267-30f41c09e2e4?w=800',
  },
  healthy: {
    logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
    banner: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  },
};

// Banner images
const bannerImages = {
  newUser: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  freeDelivery: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800',
  flashSale: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
  weekend: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  healthy: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
  dessert: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800',
  lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  dinner: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800',
};

const categories = [
  { name: 'Fast Food', icon: '🍔', sortOrder: 1 },
  { name: 'Chinese', icon: '🥡', sortOrder: 2 },
  { name: 'Japanese', icon: '🍣', sortOrder: 3 },
  { name: 'Korean', icon: '🍜', sortOrder: 4 },
  { name: 'Western', icon: '🍝', sortOrder: 5 },
  { name: 'Desserts', icon: '🍰', sortOrder: 6 },
  { name: 'Drinks', icon: '🧋', sortOrder: 7 },
  { name: 'Healthy', icon: '🥗', sortOrder: 8 },
  { name: 'Pizza', icon: '🍕', sortOrder: 9 },
  { name: 'Thai', icon: '🍛', sortOrder: 10 },
  { name: 'Indian', icon: '🫓', sortOrder: 11 },
  { name: 'Seafood', icon: '🦐', sortOrder: 12 },
  { name: 'Hot Pot', icon: '🍲', sortOrder: 13 },
  { name: 'BBQ', icon: '🍖', sortOrder: 14 },
  { name: 'Vegetarian', icon: '🥬', sortOrder: 15 },
  { name: 'Breakfast', icon: '🥞', sortOrder: 16 },
];

const merchants = [
  {
    name: 'Golden Dragon Restaurant',
    logo: restaurantImages.chinese.logo,
    banner: restaurantImages.chinese.banner,
    description: 'Authentic Cantonese cuisine with over 20 years of tradition. Fresh ingredients, traditional recipes.',
    phone: '13800000001',
    rating: 4.8,
    ratingCount: 2856,
    monthlySales: 8500,
    minOrderAmount: 20,
    deliveryFee: 5,
    deliveryTime: '30-45 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Futian',
    address: '123 Food Street, Building A',
    longitude: 114.0579,
    latitude: 22.5431,
    features: ['Dine-in', 'Delivery', 'Takeaway'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 1,
    productCategories: ['Hot Dishes', 'Dim Sum', 'Soup', 'Rice & Noodles', 'Chef Specials'],
    products: [
      { name: 'Kung Pao Chicken', price: 38, originalPrice: 45, description: 'Classic Sichuan style with peanuts and dried chili', image: foodImages.kungPaoChicken, isRecommend: true, monthlySales: 1250 },
      { name: 'Sweet and Sour Pork', price: 42, description: 'Crispy pork with tangy sweet and sour sauce', image: foodImages.sweetSourPork, isRecommend: true, monthlySales: 980 },
      { name: 'Har Gow (Shrimp Dumpling)', price: 28, description: 'Steamed crystal skin shrimp dumplings, 4 pieces', image: foodImages.dimSum, monthlySales: 756 },
      { name: 'Char Siu Bao', price: 18, description: 'Fluffy BBQ pork buns, 3 pieces', image: foodImages.dimSum, monthlySales: 623 },
      { name: 'Wonton Soup', price: 25, description: 'Clear soup with pork and shrimp wontons', image: foodImages.wontonSoup, monthlySales: 445 },
      { name: 'Yangzhou Fried Rice', price: 28, originalPrice: 32, description: 'Classic fried rice with shrimp, egg and vegetables', image: foodImages.friedRice, isRecommend: true, monthlySales: 1120 },
      { name: 'Mapo Tofu', price: 32, description: 'Spicy tofu with minced pork in chili bean sauce', image: foodImages.mapoTofu, monthlySales: 567 },
      { name: 'Peking Duck (Half)', price: 168, originalPrice: 198, description: 'Crispy roasted duck with pancakes and sauce', image: foodImages.pekinDuck, isRecommend: true, monthlySales: 234 },
    ],
  },
  {
    name: 'Tokyo Sushi Master',
    logo: restaurantImages.japanese.logo,
    banner: restaurantImages.japanese.banner,
    description: 'Premium Japanese sushi and sashimi. Fresh fish flown in daily from Tsukiji Market.',
    phone: '13800000002',
    rating: 4.9,
    ratingCount: 1892,
    monthlySales: 5800,
    minOrderAmount: 50,
    deliveryFee: 8,
    deliveryTime: '25-35 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '456 Ocean Avenue',
    longitude: 113.9234,
    latitude: 22.5123,
    features: ['Dine-in', 'Delivery', 'Omakase'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 2,
    productCategories: ['Sushi', 'Sashimi', 'Ramen', 'Set Meals', 'Appetizers'],
    products: [
      { name: 'Salmon Sashimi (8pcs)', price: 68, description: 'Fresh Norwegian salmon, premium cut', image: foodImages.sashimi, isRecommend: true, monthlySales: 890 },
      { name: 'Tuna Nigiri (4pcs)', price: 48, description: 'Premium bluefin tuna on seasoned rice', image: foodImages.sushi, monthlySales: 567 },
      { name: 'Dragon Roll', price: 58, originalPrice: 68, description: 'Eel and avocado roll with special sauce', image: foodImages.sushi, isRecommend: true, monthlySales: 723 },
      { name: 'Tonkotsu Ramen', price: 42, description: 'Rich 12-hour pork bone broth with chashu', image: foodImages.ramen, isRecommend: true, monthlySales: 1045 },
      { name: 'Chirashi Don', price: 88, description: 'Assorted fresh sashimi over seasoned rice', image: foodImages.sashimi, monthlySales: 456 },
      { name: 'Tempura Udon', price: 45, description: 'Hot udon noodles with crispy shrimp tempura', image: foodImages.udon, monthlySales: 378 },
      { name: 'Teriyaki Chicken', price: 52, description: 'Grilled chicken with homemade teriyaki sauce', image: foodImages.teriyaki, monthlySales: 445 },
    ],
  },
  {
    name: 'Burger Kingdom',
    logo: restaurantImages.burger.logo,
    banner: restaurantImages.burger.banner,
    description: 'Gourmet burgers made with 100% Angus beef. Crispy fries and craft shakes.',
    phone: '13800000003',
    rating: 4.5,
    ratingCount: 4341,
    monthlySales: 12200,
    minOrderAmount: 15,
    deliveryFee: 3,
    deliveryTime: '20-30 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Luohu',
    address: '789 Main Street',
    longitude: 114.1234,
    latitude: 22.5567,
    features: ['Delivery', 'Takeaway', '24H'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 0,
    productCategories: ['Signature Burgers', 'Classic Burgers', 'Sides', 'Drinks', 'Combos'],
    products: [
      { name: 'Classic Cheeseburger', price: 28, description: 'Angus beef patty with melted cheddar and fresh veggies', image: foodImages.cheeseBurger, isRecommend: true, monthlySales: 2340 },
      { name: 'BBQ Bacon Burger', price: 38, originalPrice: 45, description: 'Double patty with crispy bacon and smoky BBQ sauce', image: foodImages.burger, isRecommend: true, monthlySales: 1890 },
      { name: 'Crispy Chicken Burger', price: 26, description: 'Golden fried chicken breast with spicy mayo', image: foodImages.burger, monthlySales: 1234 },
      { name: 'Mushroom Swiss Burger', price: 35, description: 'Sautéed mushrooms with melted Swiss cheese', image: foodImages.burger, monthlySales: 876 },
      { name: 'French Fries (Large)', price: 12, description: 'Golden crispy fries with sea salt', image: foodImages.fries, isRecommend: true, monthlySales: 3456 },
      { name: 'Onion Rings', price: 15, description: 'Crispy battered onion rings', image: foodImages.fries, monthlySales: 987 },
      { name: 'Chocolate Milkshake', price: 18, description: 'Thick and creamy chocolate shake', image: foodImages.smoothie, monthlySales: 765 },
    ],
  },
  {
    name: 'Seoul Kitchen',
    logo: restaurantImages.korean.logo,
    banner: restaurantImages.korean.banner,
    description: 'Authentic Korean BBQ and traditional dishes. Premium meats grilled at your table.',
    phone: '13800000004',
    rating: 4.7,
    ratingCount: 2567,
    monthlySales: 7100,
    minOrderAmount: 30,
    deliveryFee: 6,
    deliveryTime: '35-50 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Futian',
    address: '321 Korea Town',
    longitude: 114.0612,
    latitude: 22.5389,
    features: ['Dine-in', 'Delivery', 'Group Meals'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 3,
    productCategories: ['BBQ', 'Stews', 'Rice Bowls', 'Fried Chicken', 'Side Dishes'],
    products: [
      { name: 'Korean BBQ Set for 2', price: 168, originalPrice: 198, description: 'Assorted premium meats with all side dishes', image: foodImages.koreanBbq, isRecommend: true, monthlySales: 567 },
      { name: 'Kimchi Jjigae', price: 38, description: 'Spicy kimchi stew with pork belly', image: foodImages.kimchiStew, isRecommend: true, monthlySales: 890 },
      { name: 'Bibimbap', price: 35, description: 'Mixed rice bowl with vegetables, egg and gochujang', image: foodImages.bibimbap, monthlySales: 1234 },
      { name: 'Tteokbokki', price: 25, description: 'Chewy rice cakes in sweet and spicy sauce', image: foodImages.tteokbokki, monthlySales: 765 },
      { name: 'Korean Fried Chicken (Half)', price: 58, originalPrice: 68, description: 'Crispy double-fried chicken, choice of sauce', image: foodImages.friedChicken, isRecommend: true, monthlySales: 1567 },
      { name: 'Japchae', price: 32, description: 'Sweet potato noodles with vegetables', image: foodImages.noodles, monthlySales: 445 },
    ],
  },
  {
    name: 'Pizza Paradise',
    logo: restaurantImages.pizza.logo,
    banner: restaurantImages.pizza.banner,
    description: 'Authentic Italian pizza baked in wood-fired oven. Fresh ingredients, homemade dough.',
    phone: '13800000005',
    rating: 4.6,
    ratingCount: 3890,
    monthlySales: 9200,
    minOrderAmount: 35,
    deliveryFee: 5,
    deliveryTime: '30-45 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '123 Italian Street',
    longitude: 113.9567,
    latitude: 22.5123,
    features: ['Dine-in', 'Delivery', 'Takeaway'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 8,
    productCategories: ['Classic Pizzas', 'Specialty Pizzas', 'Pasta', 'Appetizers', 'Desserts'],
    products: [
      { name: 'Margherita', price: 48, description: 'San Marzano tomatoes, fresh mozzarella, basil', image: foodImages.pizza, isRecommend: true, monthlySales: 1890 },
      { name: 'Pepperoni Supreme', price: 58, originalPrice: 68, description: 'Loaded with pepperoni and extra cheese', image: foodImages.pepperoniPizza, isRecommend: true, monthlySales: 2340 },
      { name: 'BBQ Chicken', price: 62, description: 'Grilled chicken, red onion, BBQ sauce', image: foodImages.pizza, monthlySales: 1234 },
      { name: 'Quattro Formaggi', price: 65, description: 'Four cheese blend: mozzarella, gorgonzola, parmesan, fontina', image: foodImages.pizza, monthlySales: 876 },
      { name: 'Spaghetti Carbonara', price: 38, description: 'Creamy pasta with pancetta and parmesan', image: foodImages.pasta, isRecommend: true, monthlySales: 1567 },
      { name: 'Lasagna', price: 45, description: 'Layers of pasta, meat sauce, and béchamel', image: foodImages.lasagna, monthlySales: 789 },
      { name: 'Tiramisu', price: 28, description: 'Classic Italian coffee dessert', image: foodImages.tiramisu, monthlySales: 567 },
    ],
  },
  {
    name: 'Thai Spice Kitchen',
    logo: restaurantImages.thai.logo,
    banner: restaurantImages.thai.banner,
    description: 'Authentic Thai flavors with fresh herbs and spices. From Bangkok to your doorstep.',
    phone: '13800000006',
    rating: 4.7,
    ratingCount: 1834,
    monthlySales: 5900,
    minOrderAmount: 25,
    deliveryFee: 6,
    deliveryTime: '35-50 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Futian',
    address: '456 Spice Avenue',
    longitude: 114.0456,
    latitude: 22.5345,
    features: ['Dine-in', 'Delivery', 'Spicy Options'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 9,
    productCategories: ['Curries', 'Stir-fry', 'Soups', 'Noodles', 'Desserts'],
    products: [
      { name: 'Pad Thai', price: 35, description: 'Classic stir-fried rice noodles with shrimp', image: foodImages.padThai, isRecommend: true, monthlySales: 1456 },
      { name: 'Green Curry Chicken', price: 42, description: 'Spicy green curry with coconut milk and Thai basil', image: foodImages.greenCurry, isRecommend: true, monthlySales: 1234 },
      { name: 'Tom Yum Goong', price: 38, originalPrice: 45, description: 'Hot and sour soup with prawns and mushrooms', image: foodImages.tomYum, isRecommend: true, monthlySales: 987 },
      { name: 'Massaman Curry', price: 48, description: 'Rich curry with potatoes, peanuts and tender beef', image: foodImages.greenCurry, monthlySales: 765 },
      { name: 'Mango Sticky Rice', price: 25, description: 'Sweet coconut sticky rice with fresh mango', image: foodImages.mangoStickyRice, monthlySales: 890 },
      { name: 'Thai Iced Tea', price: 15, description: 'Sweet and creamy orange Thai tea', image: foodImages.bubbleTea, monthlySales: 1123 },
    ],
  },
  {
    name: 'Mumbai Spice House',
    logo: restaurantImages.indian.logo,
    banner: restaurantImages.indian.banner,
    description: 'Traditional Indian cuisine with rich spices and authentic recipes from Mumbai.',
    phone: '13800000007',
    rating: 4.5,
    ratingCount: 1287,
    monthlySales: 4100,
    minOrderAmount: 30,
    deliveryFee: 5,
    deliveryTime: '40-55 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Luohu',
    address: '789 Curry Lane',
    longitude: 114.1123,
    latitude: 22.5567,
    features: ['Dine-in', 'Delivery', 'Vegetarian Options'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 10,
    productCategories: ['Curries', 'Tandoori', 'Biryani', 'Breads', 'Desserts'],
    products: [
      { name: 'Butter Chicken', price: 48, description: 'Creamy tomato curry with tender chicken tikka', image: foodImages.butterChicken, isRecommend: true, monthlySales: 1234 },
      { name: 'Chicken Biryani', price: 45, originalPrice: 55, description: 'Fragrant basmati rice with spiced chicken', image: foodImages.biryani, isRecommend: true, monthlySales: 987 },
      { name: 'Palak Paneer', price: 38, description: 'Creamy spinach curry with cottage cheese', image: foodImages.butterChicken, monthlySales: 654 },
      { name: 'Garlic Naan', price: 12, description: 'Soft tandoori bread with garlic butter', image: foodImages.naan, monthlySales: 1567 },
      { name: 'Tandoori Chicken', price: 52, description: 'Marinated chicken cooked in clay oven', image: foodImages.tandoori, isRecommend: true, monthlySales: 876 },
      { name: 'Samosa (2pcs)', price: 18, description: 'Crispy pastry with spiced potato filling', image: foodImages.samosa, monthlySales: 1234 },
      { name: 'Mango Lassi', price: 18, description: 'Sweet yogurt drink with fresh mango', image: foodImages.smoothie, monthlySales: 765 },
    ],
  },
  {
    name: 'Ocean Fresh Seafood',
    logo: restaurantImages.seafood.logo,
    banner: restaurantImages.seafood.banner,
    description: 'Daily fresh seafood from local fishermen. Live tanks and premium catches.',
    phone: '13800000008',
    rating: 4.8,
    ratingCount: 1056,
    monthlySales: 3800,
    minOrderAmount: 60,
    deliveryFee: 8,
    deliveryTime: '35-50 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '321 Harbor Road',
    longitude: 113.9234,
    latitude: 22.4987,
    features: ['Dine-in', 'Delivery', 'Live Seafood'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 11,
    productCategories: ['Fish', 'Shellfish', 'Crustaceans', 'Grilled', 'Soups'],
    products: [
      { name: 'Steamed Sea Bass', price: 138, description: 'Fresh sea bass with ginger and scallions', image: foodImages.grilledFish, isRecommend: true, monthlySales: 456 },
      { name: 'Garlic Butter Prawns', price: 78, originalPrice: 88, description: 'Jumbo prawns in garlic butter sauce', image: foodImages.shrimp, isRecommend: true, monthlySales: 678 },
      { name: 'Salt & Pepper Squid', price: 48, description: 'Crispy fried squid with spices', image: foodImages.shrimp, monthlySales: 567 },
      { name: 'Crab in Black Pepper', price: 168, description: 'Whole crab in aromatic black pepper sauce', image: foodImages.crab, isRecommend: true, monthlySales: 345 },
      { name: 'Fresh Oysters (6pcs)', price: 88, description: 'Freshly shucked oysters on ice', image: foodImages.oysters, monthlySales: 234 },
      { name: 'Lobster Thermidor', price: 288, description: 'Whole lobster in creamy cognac sauce', image: foodImages.lobster, monthlySales: 123 },
    ],
  },
  {
    name: 'Smoky BBQ Pit',
    logo: restaurantImages.bbq.logo,
    banner: restaurantImages.bbq.banner,
    description: 'American style BBQ with 12-hour smoked meats. Low and slow perfection.',
    phone: '13800000009',
    rating: 4.7,
    ratingCount: 2178,
    monthlySales: 6200,
    minOrderAmount: 40,
    deliveryFee: 6,
    deliveryTime: '30-45 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '890 Smoke Avenue',
    longitude: 113.9345,
    latitude: 22.5098,
    features: ['Dine-in', 'Delivery', 'Catering'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 13,
    productCategories: ['Ribs', 'Brisket', 'Chicken', 'Sides', 'Desserts'],
    products: [
      { name: 'Baby Back Ribs (Full)', price: 138, originalPrice: 158, description: '12-hour smoked pork ribs with house rub', image: foodImages.ribs, isRecommend: true, monthlySales: 890 },
      { name: 'Texas Brisket', price: 98, description: 'Slow-smoked beef brisket, sliced', image: foodImages.brisket, isRecommend: true, monthlySales: 765 },
      { name: 'Pulled Pork Sandwich', price: 42, description: 'Tender pulled pork on brioche bun', image: foodImages.sandwich, monthlySales: 567 },
      { name: 'BBQ Chicken', price: 58, description: 'Half chicken with smoky glaze', image: foodImages.grilledChicken, isRecommend: true, monthlySales: 678 },
      { name: 'Mac and Cheese', price: 22, description: 'Creamy four-cheese macaroni', image: foodImages.pasta, monthlySales: 890 },
      { name: 'Coleslaw', price: 15, description: 'Creamy cabbage slaw', image: foodImages.salad, monthlySales: 567 },
      { name: 'Cornbread', price: 12, description: 'Sweet buttery cornbread', image: foodImages.croissant, monthlySales: 445 },
    ],
  },
  {
    name: 'Sweet Dreams Bakery',
    logo: restaurantImages.dessert.logo,
    banner: restaurantImages.dessert.banner,
    description: 'Freshly baked cakes, pastries and artisan desserts. Made with love daily.',
    phone: '13800000010',
    rating: 4.6,
    ratingCount: 1678,
    monthlySales: 4800,
    minOrderAmount: 25,
    deliveryFee: 5,
    deliveryTime: '25-40 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '567 Sweet Lane',
    longitude: 113.9456,
    latitude: 22.5234,
    features: ['Delivery', 'Takeaway', 'Custom Orders'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 5,
    productCategories: ['Cakes', 'Pastries', 'Bread', 'Ice Cream', 'Drinks'],
    products: [
      { name: 'Chocolate Lava Cake', price: 32, description: 'Warm chocolate cake with molten center', image: foodImages.cake, isRecommend: true, monthlySales: 1234 },
      { name: 'New York Cheesecake', price: 35, originalPrice: 42, description: 'Creamy cheesecake with berry compote', image: foodImages.cheesecake, isRecommend: true, monthlySales: 987 },
      { name: 'French Croissant', price: 15, description: 'Buttery flaky French croissant', image: foodImages.croissant, monthlySales: 765 },
      { name: 'Tiramisu', price: 38, description: 'Classic Italian coffee dessert', image: foodImages.tiramisu, isRecommend: true, monthlySales: 876 },
      { name: 'Macarons (6pcs)', price: 42, description: 'Assorted French macarons', image: foodImages.macaron, monthlySales: 654 },
      { name: 'Gelato (2 scoops)', price: 28, description: 'Italian gelato, choice of flavors', image: foodImages.iceCream, monthlySales: 1123 },
    ],
  },
  {
    name: 'Bubble Tea House',
    logo: restaurantImages.cafe.logo,
    banner: restaurantImages.cafe.banner,
    description: 'Fresh milk tea and fruit drinks. Handcrafted with premium ingredients.',
    phone: '13800000011',
    rating: 4.4,
    ratingCount: 5456,
    monthlySales: 15500,
    minOrderAmount: 10,
    deliveryFee: 3,
    deliveryTime: '15-25 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Futian',
    address: '888 Tea Road',
    longitude: 114.0678,
    latitude: 22.5456,
    features: ['Delivery', 'Takeaway', 'Customizable'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 6,
    productCategories: ['Milk Tea', 'Fruit Tea', 'Fresh Milk', 'Special Drinks', 'Toppings'],
    products: [
      { name: 'Brown Sugar Boba Milk', price: 18, description: 'Fresh milk with caramelized brown sugar pearls', image: foodImages.bubbleTea, isRecommend: true, monthlySales: 4567 },
      { name: 'Taro Milk Tea', price: 16, description: 'Creamy taro flavored milk tea', image: foodImages.bubbleTea, isRecommend: true, monthlySales: 3456 },
      { name: 'Mango Pomelo Sago', price: 22, description: 'Fresh mango with pomelo and coconut sago', image: foodImages.smoothie, monthlySales: 2345 },
      { name: 'Passion Fruit Green Tea', price: 15, description: 'Refreshing green tea with real passion fruit', image: foodImages.juice, monthlySales: 1890 },
      { name: 'Cheese Foam Oolong', price: 20, originalPrice: 25, description: 'Premium oolong topped with salty cheese foam', image: foodImages.bubbleTea, isRecommend: true, monthlySales: 2678 },
      { name: 'Strawberry Smoothie', price: 22, description: 'Fresh strawberry smoothie with milk', image: foodImages.smoothie, monthlySales: 1567 },
    ],
  },
  {
    name: 'Coffee & Co',
    logo: restaurantImages.cafe.logo,
    banner: restaurantImages.cafe.banner,
    description: 'Specialty coffee roasted in-house. Fresh pastries and cozy vibes.',
    phone: '13800000012',
    rating: 4.5,
    ratingCount: 3345,
    monthlySales: 8800,
    minOrderAmount: 15,
    deliveryFee: 3,
    deliveryTime: '15-25 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '456 Coffee Lane',
    longitude: 113.9345,
    latitude: 22.5234,
    features: ['Delivery', 'Takeaway', 'Wifi'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 6,
    productCategories: ['Espresso', 'Cold Brew', 'Tea', 'Pastries', 'Snacks'],
    products: [
      { name: 'Flat White', price: 28, description: 'Double shot with velvety steamed milk', image: foodImages.latte, isRecommend: true, monthlySales: 2345 },
      { name: 'Cold Brew', price: 25, originalPrice: 30, description: '16-hour steeped cold brew', image: foodImages.coffee, isRecommend: true, monthlySales: 1890 },
      { name: 'Matcha Latte', price: 32, description: 'Premium Japanese matcha with oat milk', image: foodImages.bubbleTea, isRecommend: true, monthlySales: 1567 },
      { name: 'Pour Over', price: 35, description: 'Single origin hand drip coffee', image: foodImages.coffee, monthlySales: 876 },
      { name: 'Almond Croissant', price: 22, description: 'Flaky croissant with almond cream', image: foodImages.croissant, monthlySales: 1234 },
      { name: 'Banana Bread', price: 18, description: 'Moist and flavorful with walnuts', image: foodImages.cake, monthlySales: 987 },
    ],
  },
  {
    name: 'Healthy Bites',
    logo: restaurantImages.healthy.logo,
    banner: restaurantImages.healthy.banner,
    description: 'Fresh salads, protein bowls and healthy options. Fuel your day right.',
    phone: '13800000013',
    rating: 4.4,
    ratingCount: 1890,
    monthlySales: 4900,
    minOrderAmount: 25,
    deliveryFee: 4,
    deliveryTime: '20-30 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '123 Health Street',
    longitude: 113.9678,
    latitude: 22.5123,
    features: ['Delivery', 'Takeaway', 'Customizable'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 7,
    productCategories: ['Salads', 'Poke Bowls', 'Wraps', 'Smoothies', 'Juices'],
    products: [
      { name: 'Grilled Chicken Caesar', price: 42, description: 'Romaine, parmesan, croutons, caesar dressing', image: foodImages.salad, isRecommend: true, monthlySales: 1234 },
      { name: 'Salmon Poke Bowl', price: 52, originalPrice: 58, description: 'Fresh salmon, rice, edamame, avocado', image: foodImages.pokeBowl, isRecommend: true, monthlySales: 987 },
      { name: 'Acai Bowl', price: 38, description: 'Acai blend topped with granola and fruits', image: foodImages.acaiBowl, isRecommend: true, monthlySales: 876 },
      { name: 'Avocado Toast', price: 32, description: 'Sourdough with smashed avocado and eggs', image: foodImages.avocadoToast, monthlySales: 1123 },
      { name: 'Green Detox Juice', price: 25, description: 'Kale, apple, celery, ginger', image: foodImages.juice, monthlySales: 765 },
      { name: 'Berry Smoothie', price: 28, description: 'Mixed berries with Greek yogurt', image: foodImages.smoothie, monthlySales: 654 },
    ],
  },
  {
    name: 'Sunrise Breakfast',
    logo: restaurantImages.cafe.logo,
    banner: restaurantImages.cafe.banner,
    description: 'All-day breakfast and brunch favorites. Start your day delicious.',
    phone: '13800000014',
    rating: 4.4,
    ratingCount: 2234,
    monthlySales: 5800,
    minOrderAmount: 20,
    deliveryFee: 4,
    deliveryTime: '20-30 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Luohu',
    address: '456 Sunrise Road',
    longitude: 114.1234,
    latitude: 22.5678,
    features: ['Dine-in', 'Delivery', 'Early Hours'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 15,
    productCategories: ['Eggs', 'Pancakes', 'Sandwiches', 'Coffee', 'Juices'],
    products: [
      { name: 'Full English Breakfast', price: 52, description: 'Eggs, bacon, sausage, beans, toast, tomatoes', image: foodImages.omelette, isRecommend: true, monthlySales: 1234 },
      { name: 'Eggs Benedict', price: 45, originalPrice: 52, description: 'Poached eggs, ham, hollandaise on English muffin', image: foodImages.eggsBenedict, isRecommend: true, monthlySales: 987 },
      { name: 'Fluffy Pancakes', price: 32, description: 'Stack of 3 with maple syrup and butter', image: foodImages.pancakes, isRecommend: true, monthlySales: 1567 },
      { name: 'French Toast', price: 35, description: 'Brioche with berries and whipped cream', image: foodImages.frenchToast, monthlySales: 876 },
      { name: 'Smoked Salmon Bagel', price: 42, description: 'Cream cheese, capers, red onion', image: foodImages.sandwich, monthlySales: 654 },
      { name: 'Fresh Orange Juice', price: 18, description: 'Freshly squeezed oranges', image: foodImages.juice, monthlySales: 1234 },
    ],
  },
  {
    name: 'Steak & Grill House',
    logo: restaurantImages.bbq.logo,
    banner: restaurantImages.bbq.banner,
    description: 'Premium steaks cooked to perfection. USDA Prime and Wagyu available.',
    phone: '13800000015',
    rating: 4.8,
    ratingCount: 978,
    monthlySales: 2500,
    minOrderAmount: 80,
    deliveryFee: 10,
    deliveryTime: '40-55 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Futian',
    address: '890 Grill Avenue',
    longitude: 114.0789,
    latitude: 22.5567,
    features: ['Dine-in', 'Delivery', 'Premium'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 4,
    productCategories: ['Steaks', 'Seafood', 'Sides', 'Desserts', 'Wine'],
    products: [
      { name: 'Ribeye Steak (300g)', price: 188, description: 'USDA Prime ribeye, choice of doneness', image: foodImages.steak, isRecommend: true, monthlySales: 456 },
      { name: 'Filet Mignon (200g)', price: 208, originalPrice: 238, description: 'Tender beef tenderloin wrapped in bacon', image: foodImages.steak, isRecommend: true, monthlySales: 345 },
      { name: 'T-Bone Steak (400g)', price: 228, description: 'Classic T-bone cut', image: foodImages.steak, isRecommend: true, monthlySales: 234 },
      { name: 'Wagyu Burger', price: 98, description: 'A5 Wagyu beef patty with truffle aioli', image: foodImages.burger, monthlySales: 567 },
      { name: 'Truffle Mashed Potato', price: 42, description: 'Creamy potato with black truffle', image: foodImages.fries, monthlySales: 345 },
      { name: 'Grilled Asparagus', price: 32, description: 'With garlic butter and parmesan', image: foodImages.salad, monthlySales: 234 },
    ],
  },
];

// Banners data
const banners = [
  {
    title: 'New User Special',
    subtitle: '¥20 off your first order',
    imageUrl: bannerImages.newUser,
    type: BannerType.HOME,
    actionType: BannerActionType.COUPON,
    actionValue: 'NEWUSER20',
    sortOrder: 1,
  },
  {
    title: 'Free Delivery Week',
    subtitle: 'No delivery fee on all orders',
    imageUrl: bannerImages.freeDelivery,
    type: BannerType.HOME,
    actionType: BannerActionType.NONE,
    sortOrder: 2,
  },
  {
    title: 'Flash Sale',
    subtitle: 'Up to 50% off selected items',
    imageUrl: bannerImages.flashSale,
    type: BannerType.PROMOTION,
    actionType: BannerActionType.CATEGORY,
    actionValue: 'flash-sale',
    sortOrder: 3,
  },
  {
    title: 'Weekend Brunch',
    subtitle: 'Brunch specials every weekend',
    imageUrl: bannerImages.weekend,
    type: BannerType.HOME,
    actionType: BannerActionType.CATEGORY,
    sortOrder: 4,
  },
  {
    title: 'Healthy Choices',
    subtitle: 'Fresh salads and smoothies',
    imageUrl: bannerImages.healthy,
    type: BannerType.CATEGORY,
    actionType: BannerActionType.CATEGORY,
    sortOrder: 5,
  },
  {
    title: 'Sweet Treats',
    subtitle: 'Desserts and pastries',
    imageUrl: bannerImages.dessert,
    type: BannerType.CATEGORY,
    actionType: BannerActionType.CATEGORY,
    sortOrder: 6,
  },
  {
    title: 'Lunch Deals',
    subtitle: 'Set meals from ¥25',
    imageUrl: bannerImages.lunch,
    type: BannerType.PROMOTION,
    actionType: BannerActionType.NONE,
    sortOrder: 7,
  },
  {
    title: 'Dinner for Two',
    subtitle: 'Romantic dinner packages',
    imageUrl: bannerImages.dinner,
    type: BannerType.PROMOTION,
    actionType: BannerActionType.NONE,
    sortOrder: 8,
  },
];

// Coupons data
const coupons = [
  {
    code: 'NEWUSER20',
    name: 'New User Welcome',
    description: '¥20 off your first order',
    discountType: DiscountType.FIXED,
    discountValue: 20,
    minOrderAmount: 30,
    totalLimit: 0,
    perUserLimit: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'SAVE10',
    name: '10% Off',
    description: '10% off orders over ¥50',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    minOrderAmount: 50,
    maxDiscount: 30,
    totalLimit: 1000,
    perUserLimit: 3,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FREEDEL',
    name: 'Free Delivery',
    description: 'Free delivery on orders over ¥40',
    discountType: DiscountType.FIXED,
    discountValue: 8,
    minOrderAmount: 40,
    totalLimit: 500,
    perUserLimit: 5,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'WEEKEND15',
    name: 'Weekend Special',
    description: '¥15 off weekend orders',
    discountType: DiscountType.FIXED,
    discountValue: 15,
    minOrderAmount: 60,
    totalLimit: 200,
    perUserLimit: 2,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'LUNCH25',
    name: 'Lunch Deal',
    description: '25% off lunch orders (11am-2pm)',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 25,
    minOrderAmount: 35,
    maxDiscount: 20,
    totalLimit: 300,
    perUserLimit: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FLASH50',
    name: 'Flash Sale',
    description: '50% off selected items',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 50,
    minOrderAmount: 80,
    maxDiscount: 50,
    totalLimit: 100,
    perUserLimit: 1,
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
];

// Review templates
const reviewTemplates = [
  { content: 'Amazing food! Fresh ingredients and great taste. Will order again.', rating: 5, tasteRating: 5, packagingRating: 5, deliveryRating: 5 },
  { content: 'Very good, delivery was fast and food was still hot.', rating: 5, tasteRating: 5, packagingRating: 4, deliveryRating: 5 },
  { content: 'Delicious! Exactly as described. Highly recommend.', rating: 5, tasteRating: 5, packagingRating: 5, deliveryRating: 4 },
  { content: 'Great quality and generous portions. Satisfied!', rating: 4.5, tasteRating: 5, packagingRating: 4, deliveryRating: 4 },
  { content: 'Food was good but packaging could be better.', rating: 4, tasteRating: 4, packagingRating: 3, deliveryRating: 4 },
  { content: 'Tasty food, reasonable price. Good value for money.', rating: 4, tasteRating: 4, packagingRating: 4, deliveryRating: 4 },
  { content: 'Nice flavors, will definitely order again!', rating: 4.5, tasteRating: 5, packagingRating: 4, deliveryRating: 5 },
  { content: 'Authentic taste, reminds me of home cooking.', rating: 5, tasteRating: 5, packagingRating: 5, deliveryRating: 4 },
  { content: 'Delivery was a bit slow but food quality made up for it.', rating: 4, tasteRating: 5, packagingRating: 4, deliveryRating: 3 },
  { content: 'Everything was perfect! Fast delivery, great taste.', rating: 5, tasteRating: 5, packagingRating: 5, deliveryRating: 5 },
  { content: 'Portions are generous. Very filling meal.', rating: 4.5, tasteRating: 4, packagingRating: 4, deliveryRating: 5 },
  { content: 'Good food at reasonable prices. Happy customer!', rating: 4, tasteRating: 4, packagingRating: 4, deliveryRating: 4 },
  { content: 'Fresh and tasty. Packaging kept everything intact.', rating: 4.5, tasteRating: 5, packagingRating: 5, deliveryRating: 4 },
  { content: 'Best restaurant in the area! Never disappoints.', rating: 5, tasteRating: 5, packagingRating: 5, deliveryRating: 5 },
  { content: 'Quick delivery and food was still hot. Great!', rating: 4.5, tasteRating: 4, packagingRating: 4, deliveryRating: 5 },
];

const reviewerNames = ['Alex W.', 'Sarah L.', 'Mike C.', 'Emily R.', 'David K.', 'Lisa M.', 'John P.', 'Amy H.', 'Chris T.', 'Rachel S.'];

export async function seed(dataSource: DataSource) {
  console.log('Starting comprehensive seed...');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const merchantRepo = dataSource.getRepository(Merchant);
  const productCategoryRepo = dataSource.getRepository(ProductCategory);
  const productRepo = dataSource.getRepository(Product);
  const couponRepo = dataSource.getRepository(Coupon);
  const bannerRepo = dataSource.getRepository(Banner);
  const reviewRepo = dataSource.getRepository(Review);

  // Clear existing data
  console.log('Clearing existing data...');
  try {
    await reviewRepo.createQueryBuilder().delete().from(Review).execute();
  } catch (e) { /* table might not exist */ }
  try {
    await bannerRepo.createQueryBuilder().delete().from(Banner).execute();
  } catch (e) { /* table might not exist */ }
  await couponRepo.createQueryBuilder().delete().from(Coupon).execute();
  await productRepo.createQueryBuilder().delete().from(Product).execute();
  await productCategoryRepo.createQueryBuilder().delete().from(ProductCategory).execute();
  await merchantRepo.createQueryBuilder().delete().from(Merchant).execute();
  await categoryRepo.createQueryBuilder().delete().from(Category).execute();

  // Create test users for reviews
  console.log('Creating test users for reviews...');
  const testUsers: User[] = [];
  for (let i = 0; i < 10; i++) {
    const user = userRepo.create({
      phone: `1380000${1000 + i}`,
      name: reviewerNames[i],
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    });
    const savedUser = await userRepo.save(user);
    testUsers.push(savedUser);
  }
  console.log(`Created ${testUsers.length} test users`);

  // Create categories
  console.log('Creating categories...');
  const savedCategories = await categoryRepo.save(
    categories.map((c) => categoryRepo.create(c)),
  );
  console.log(`Created ${savedCategories.length} categories`);

  // Create merchants with products
  console.log('Creating merchants with products...');
  const savedMerchants: Merchant[] = [];
  for (const merchantData of merchants) {
    const { productCategories: prodCats, products, categoryIndex, ...merchantFields } = merchantData;

    const merchant = await merchantRepo.save(
      merchantRepo.create({
        ...merchantFields,
        categoryId: savedCategories[categoryIndex].id,
      }),
    );
    savedMerchants.push(merchant);

    // Create product categories
    const savedProdCats = await productCategoryRepo.save(
      prodCats.map((name, index) =>
        productCategoryRepo.create({
          merchantId: merchant.id,
          name,
          sortOrder: index,
        }),
      ),
    );

    // Create products
    await productRepo.save(
      products.map((prod, index) =>
        productRepo.create({
          ...prod,
          merchantId: merchant.id,
          categoryId: savedProdCats[index % savedProdCats.length].id,
          sortOrder: index,
          isAvailable: true,
          monthlySales: prod.monthlySales || Math.floor(Math.random() * 500) + 100,
        }),
      ),
    );

    console.log(`Created merchant: ${merchant.name} with ${products.length} products`);
  }

  // Create coupons
  console.log('Creating coupons...');
  await couponRepo.save(
    coupons.map((c) => couponRepo.create(c)),
  );
  console.log(`Created ${coupons.length} coupons`);

  // Create banners
  console.log('Creating banners...');
  try {
    await bannerRepo.save(
      banners.map((b) => bannerRepo.create(b)),
    );
    console.log(`Created ${banners.length} banners`);
  } catch (e) {
    console.log('Banner table not available, skipping...');
  }

  // Create reviews (fake reviews for each merchant)
  console.log('Creating reviews...');
  try {
    const reviews: Partial<Review>[] = [];
    for (const merchant of savedMerchants) {
      // Create 5-15 reviews per merchant
      const reviewCount = Math.floor(Math.random() * 11) + 5;
      for (let i = 0; i < reviewCount; i++) {
        const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
        const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];
        reviews.push({
          merchantId: merchant.id,
          userId: randomUser.id,
          rating: template.rating,
          content: template.content,
          tasteRating: template.tasteRating,
          packagingRating: template.packagingRating,
          deliveryRating: template.deliveryRating,
          likes: Math.floor(Math.random() * 50),
          isAnonymous: Math.random() > 0.7,
        });
      }
    }
    await reviewRepo.save(reviews.map(r => reviewRepo.create(r)));
    console.log(`Created ${reviews.length} reviews`);
  } catch (e) {
    console.log('Review table not available, skipping...', e);
  }

  console.log('\n========================================');
  console.log('Seed completed successfully!');
  console.log('========================================');
  console.log(`Categories: ${savedCategories.length}`);
  console.log(`Merchants: ${savedMerchants.length}`);
  console.log(`Coupons: ${coupons.length}`);
  console.log(`Banners: ${banners.length}`);
  console.log('========================================\n');
}
