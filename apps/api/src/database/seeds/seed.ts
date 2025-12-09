import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Merchant, MerchantStatus } from '../../modules/merchant/entities/merchant.entity';
import { Category } from '../../modules/merchant/entities/category.entity';
import { Product } from '../../modules/product/entities/product.entity';
import { ProductCategory } from '../../modules/product/entities/product-category.entity';

const categories = [
  { name: 'Fast Food', icon: '🍔', sortOrder: 1 },
  { name: 'Chinese', icon: '🥡', sortOrder: 2 },
  { name: 'Japanese', icon: '🍣', sortOrder: 3 },
  { name: 'Korean', icon: '🍜', sortOrder: 4 },
  { name: 'Western', icon: '🍝', sortOrder: 5 },
  { name: 'Desserts', icon: '🍰', sortOrder: 6 },
  { name: 'Drinks', icon: '🧋', sortOrder: 7 },
  { name: 'Healthy', icon: '🥗', sortOrder: 8 },
];

const merchants = [
  {
    name: 'Golden Dragon Restaurant',
    logo: 'https://picsum.photos/seed/m1/200',
    banner: 'https://picsum.photos/seed/m1b/800/400',
    description: 'Authentic Cantonese cuisine with over 20 years of tradition',
    phone: '13800000001',
    rating: 4.8,
    ratingCount: 1256,
    monthlySales: 3500,
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
    productCategories: ['Hot Dishes', 'Dim Sum', 'Soup', 'Rice & Noodles'],
    products: [
      { name: 'Kung Pao Chicken', price: 38, originalPrice: 45, description: 'Classic Sichuan style with peanuts', image: 'https://picsum.photos/seed/p1/300', isRecommend: true },
      { name: 'Sweet and Sour Pork', price: 42, description: 'Crispy pork with sweet and sour sauce', image: 'https://picsum.photos/seed/p2/300', isRecommend: true },
      { name: 'Har Gow (Shrimp Dumpling)', price: 28, description: 'Steamed crystal skin shrimp dumplings', image: 'https://picsum.photos/seed/p3/300' },
      { name: 'Char Siu Bao', price: 18, description: 'BBQ pork buns', image: 'https://picsum.photos/seed/p4/300' },
      { name: 'Wonton Soup', price: 25, description: 'Clear soup with pork and shrimp wontons', image: 'https://picsum.photos/seed/p5/300' },
      { name: 'Yangzhou Fried Rice', price: 28, originalPrice: 32, description: 'Classic fried rice with shrimp and egg', image: 'https://picsum.photos/seed/p6/300', isRecommend: true },
    ],
  },
  {
    name: 'Tokyo Sushi Bar',
    logo: 'https://picsum.photos/seed/m2/200',
    banner: 'https://picsum.photos/seed/m2b/800/400',
    description: 'Premium Japanese sushi and sashimi',
    phone: '13800000002',
    rating: 4.9,
    ratingCount: 892,
    monthlySales: 2800,
    minOrderAmount: 50,
    deliveryFee: 8,
    deliveryTime: '25-35 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Nanshan',
    address: '456 Ocean Avenue',
    longitude: 113.9234,
    latitude: 22.5123,
    features: ['Dine-in', 'Delivery'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 2,
    productCategories: ['Sushi', 'Sashimi', 'Ramen', 'Set Meals'],
    products: [
      { name: 'Salmon Sashimi (8pcs)', price: 68, description: 'Fresh Norwegian salmon', image: 'https://picsum.photos/seed/p7/300', isRecommend: true },
      { name: 'Tuna Nigiri (4pcs)', price: 48, description: 'Premium bluefin tuna', image: 'https://picsum.photos/seed/p8/300' },
      { name: 'Dragon Roll', price: 58, originalPrice: 68, description: 'Eel and avocado roll', image: 'https://picsum.photos/seed/p9/300', isRecommend: true },
      { name: 'Tonkotsu Ramen', price: 42, description: 'Rich pork bone broth ramen', image: 'https://picsum.photos/seed/p10/300' },
      { name: 'Chirashi Don', price: 88, description: 'Assorted sashimi over rice', image: 'https://picsum.photos/seed/p11/300', isRecommend: true },
    ],
  },
  {
    name: 'Burger Kingdom',
    logo: 'https://picsum.photos/seed/m3/200',
    banner: 'https://picsum.photos/seed/m3b/800/400',
    description: 'Gourmet burgers and crispy fries',
    phone: '13800000003',
    rating: 4.5,
    ratingCount: 2341,
    monthlySales: 5200,
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
    productCategories: ['Burgers', 'Sides', 'Drinks', 'Combos'],
    products: [
      { name: 'Classic Cheeseburger', price: 28, description: 'Beef patty with cheese and veggies', image: 'https://picsum.photos/seed/p12/300', isRecommend: true },
      { name: 'BBQ Bacon Burger', price: 38, originalPrice: 45, description: 'Double patty with bacon and BBQ sauce', image: 'https://picsum.photos/seed/p13/300', isRecommend: true },
      { name: 'Crispy Chicken Burger', price: 26, description: 'Crispy fried chicken breast', image: 'https://picsum.photos/seed/p14/300' },
      { name: 'French Fries (Large)', price: 12, description: 'Golden crispy fries', image: 'https://picsum.photos/seed/p15/300' },
      { name: 'Onion Rings', price: 15, description: 'Crispy battered onion rings', image: 'https://picsum.photos/seed/p16/300' },
      { name: 'Coca Cola', price: 8, description: 'Ice cold Coca Cola', image: 'https://picsum.photos/seed/p17/300' },
    ],
  },
  {
    name: 'Seoul Kitchen',
    logo: 'https://picsum.photos/seed/m4/200',
    banner: 'https://picsum.photos/seed/m4b/800/400',
    description: 'Authentic Korean BBQ and traditional dishes',
    phone: '13800000004',
    rating: 4.7,
    ratingCount: 1567,
    monthlySales: 3100,
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
    productCategories: ['BBQ', 'Stews', 'Rice Bowls', 'Side Dishes'],
    products: [
      { name: 'Korean BBQ Platter', price: 128, description: 'Assorted premium meats for 2-3 people', image: 'https://picsum.photos/seed/p18/300', isRecommend: true },
      { name: 'Kimchi Jjigae', price: 38, description: 'Spicy kimchi stew with pork', image: 'https://picsum.photos/seed/p19/300', isRecommend: true },
      { name: 'Bibimbap', price: 35, description: 'Mixed rice bowl with vegetables and egg', image: 'https://picsum.photos/seed/p20/300' },
      { name: 'Tteokbokki', price: 25, description: 'Spicy rice cakes', image: 'https://picsum.photos/seed/p21/300' },
      { name: 'Fried Chicken (Half)', price: 48, originalPrice: 58, description: 'Korean style fried chicken', image: 'https://picsum.photos/seed/p22/300', isRecommend: true },
    ],
  },
  {
    name: 'Sweet Dreams Bakery',
    logo: 'https://picsum.photos/seed/m5/200',
    banner: 'https://picsum.photos/seed/m5b/800/400',
    description: 'Freshly baked cakes, pastries and desserts',
    phone: '13800000005',
    rating: 4.6,
    ratingCount: 678,
    monthlySales: 1800,
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
    productCategories: ['Cakes', 'Pastries', 'Bread', 'Ice Cream'],
    products: [
      { name: 'Chocolate Lava Cake', price: 28, description: 'Warm chocolate cake with molten center', image: 'https://picsum.photos/seed/p23/300', isRecommend: true },
      { name: 'Strawberry Cheesecake', price: 32, originalPrice: 38, description: 'Creamy cheesecake with fresh strawberries', image: 'https://picsum.photos/seed/p24/300', isRecommend: true },
      { name: 'Croissant', price: 12, description: 'Buttery French croissant', image: 'https://picsum.photos/seed/p25/300' },
      { name: 'Matcha Roll Cake', price: 35, description: 'Light and fluffy matcha sponge roll', image: 'https://picsum.photos/seed/p26/300' },
      { name: 'Tiramisu', price: 30, description: 'Classic Italian coffee dessert', image: 'https://picsum.photos/seed/p27/300', isRecommend: true },
    ],
  },
  {
    name: 'Bubble Tea House',
    logo: 'https://picsum.photos/seed/m6/200',
    banner: 'https://picsum.photos/seed/m6b/800/400',
    description: 'Fresh milk tea and fruit drinks',
    phone: '13800000006',
    rating: 4.4,
    ratingCount: 3456,
    monthlySales: 6500,
    minOrderAmount: 10,
    deliveryFee: 3,
    deliveryTime: '15-25 min',
    province: 'Guangdong',
    city: 'Shenzhen',
    district: 'Futian',
    address: '888 Tea Road',
    longitude: 114.0678,
    latitude: 22.5456,
    features: ['Delivery', 'Takeaway'],
    status: MerchantStatus.ACTIVE,
    isOpen: true,
    categoryIndex: 6,
    productCategories: ['Milk Tea', 'Fruit Tea', 'Special Drinks', 'Toppings'],
    products: [
      { name: 'Brown Sugar Boba Milk', price: 18, description: 'Fresh milk with brown sugar pearls', image: 'https://picsum.photos/seed/p28/300', isRecommend: true },
      { name: 'Taro Milk Tea', price: 16, description: 'Creamy taro flavored milk tea', image: 'https://picsum.photos/seed/p29/300', isRecommend: true },
      { name: 'Mango Pomelo Sago', price: 22, description: 'Fresh mango with pomelo and sago', image: 'https://picsum.photos/seed/p30/300' },
      { name: 'Passion Fruit Green Tea', price: 15, description: 'Refreshing green tea with passion fruit', image: 'https://picsum.photos/seed/p31/300' },
      { name: 'Cheese Foam Oolong', price: 20, originalPrice: 25, description: 'Oolong tea topped with cheese foam', image: 'https://picsum.photos/seed/p32/300', isRecommend: true },
    ],
  },
];

export async function seed(dataSource: DataSource) {
  console.log('Starting seed...');

  const categoryRepo = dataSource.getRepository(Category);
  const merchantRepo = dataSource.getRepository(Merchant);
  const productCategoryRepo = dataSource.getRepository(ProductCategory);
  const productRepo = dataSource.getRepository(Product);

  // Clear existing data
  await productRepo.delete({});
  await productCategoryRepo.delete({});
  await merchantRepo.delete({});
  await categoryRepo.delete({});

  console.log('Creating categories...');
  const savedCategories = await categoryRepo.save(
    categories.map((c) => categoryRepo.create(c)),
  );
  console.log(`Created ${savedCategories.length} categories`);

  console.log('Creating merchants with products...');
  for (const merchantData of merchants) {
    const { productCategories: prodCats, products, categoryIndex, ...merchantFields } = merchantData;

    const merchant = await merchantRepo.save(
      merchantRepo.create({
        ...merchantFields,
        categoryId: savedCategories[categoryIndex].id,
      }),
    );

    // Create product categories for this merchant
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
        }),
      ),
    );

    console.log(`Created merchant: ${merchant.name} with ${products.length} products`);
  }

  console.log('Seed completed!');
}
