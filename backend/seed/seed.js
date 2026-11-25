const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

dotenv.config({ path: __dirname + '/../.env' });

const seedProducts = [
  {
    name: 'Hydrating Facial Cleanser',
    description: 'Gentle, non-foaming facial wash formulated with 3 essential ceramides and hyaluronic acid to cleanse and hydrate normal to dry skin without disrupting the protective barrier.',
    price: 15.99,
    category: 'Cleansers',
    image: '/uploads/hydrating-cleanser.jpg',
    stock: 45,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Foaming Facial Cleanser',
    description: 'Refreshing gel cleanser that removes excess oil, dirt, and makeup while calming skin with ceramides, niacinamide, and hyaluronic acid. Ideal for normal to oily skin.',
    price: 16.49,
    category: 'Cleansers',
    image: '/uploads/foaming-cleanser.jpg',
    stock: 38,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Salicylic Acid Blemish Cleanser',
    description: 'Formulated with Salicylic Acid to exfoliate dead cells, clear pores, and smooth rough and bumpy skin while preserving skin barrier moisture.',
    price: 17.99,
    category: 'Cleansers',
    image: '/uploads/salicylic-cleanser.jpg',
    stock: 25,
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Daily Moisturizing Lotion',
    description: 'Lightweight, oil-free daily moisturizer providing 24-hour hydration with MVE Delivery Technology, ceramides, and hyaluronic acid for all-day comfort.',
    price: 14.99,
    category: 'Moisturizers',
    image: '/uploads/daily-lotion.jpg',
    stock: 50,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Moisturizing Cream in Jar',
    description: 'Rich, non-greasy moisturizing cream for dry to very dry skin. Formulated with 3 essential ceramides to lock in moisture and restore protective skin barrier.',
    price: 18.99,
    category: 'Moisturizers',
    image: '/uploads/moisturizing-cream.jpg',
    stock: 30,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Skin Renewing Night Cream',
    description: 'Nourishing night cream with biomimetic peptides, hyaluronic acid, and ceramides to refresh and renew the appearance of tired skin overnight.',
    price: 21.99,
    category: 'Moisturizers',
    image: '/uploads/renewing-night-cream.jpg',
    stock: 22,
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Hyaluronic Acid Serum',
    description: 'Replenishing serum providing instant and sustained hydration with vitamin B5 and hyaluronic acid to bind moisture to the skin surface.',
    price: 22.99,
    category: 'Serums',
    image: '/uploads/hyaluronic-serum.jpg',
    stock: 35,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Skin Renewing Vitamin C Serum',
    description: '10% pure vitamin C (L-ascorbic acid) antioxidant serum that brightens skin tone, visibly improves texture, and protects against environmental free radicals.',
    price: 24.99,
    category: 'Serums',
    image: '/uploads/vitamin-c-serum.jpg',
    stock: 28,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'AM Facial Moisturizing Lotion with SPF 30',
    description: 'Broad-spectrum SPF 30 daily sunscreen and moisturizer that shields skin from damaging UV rays while hydrating with ceramides and niacinamide.',
    price: 19.49,
    category: 'Sunscreens',
    image: '/uploads/am-facial-lotion-spf30.jpg',
    stock: 40,
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Hydrating Mineral Sunscreen SPF 50',
    description: '100% mineral sunscreen with zinc oxide and titanium dioxide providing physical UV barrier protection with a weightless, non-greasy feel.',
    price: 20.99,
    category: 'Sunscreens',
    image: '/uploads/mineral-sunscreen-spf50.jpg',
    stock: 32,
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Eye Repair Cream',
    description: 'Visibly reduces dark circles and puffiness around delicate eye contours. Enriched with marine botanical complex, ceramides, and hyaluronic acid.',
    price: 16.99,
    category: 'Eye Care',
    image: '/uploads/eye-repair-cream.jpg',
    stock: 26,
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'Advanced Healing Protective Ointment',
    description: 'Multi-purpose soothing ointment formulated with petrolatum and ceramides to temporarily protect, soothe, and hydrate chafed, chapped, or cracked skin.',
    price: 13.99,
    category: 'Body Care',
    image: '/uploads/healing-ointment.jpg',
    stock: 42,
    isFeatured: false,
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skincare_store';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await ActivityLog.deleteMany();
    console.log('Cleared existing database collections');

    // Create Admin User
    const adminUser = await User.create({
      name: 'Shreya',
      email: 'shreyakhadka66@gmail.com',
      password: 'adminpassword123',
      phone: '+1 (555) 234-5678',
      address: '100 Medical Plaza, New York, NY 10001',
      role: 'admin',
      isActive: true,
    });
    console.log(`Admin account created: ${adminUser.email}`);

    // Create Customer User
    const customerUser = await User.create({
      name: 'Emma Watson',
      email: 'customer@example.com',
      password: 'customerpassword123',
      phone: '+1 (555) 987-6543',
      address: '742 Evergreen Terrace, Springfield, OR 97477',
      role: 'user',
      isActive: true,
    });
    console.log(`Demo customer account created: ${customerUser.email}`);

    // Insert Products
    const createdProducts = await Product.insertMany(seedProducts);
    console.log(`Seeded ${createdProducts.length} skincare products`);

    // Create demo order for customer
    const demoItems = [
      {
        product: createdProducts[0]._id,
        productName: createdProducts[0].name,
        price: createdProducts[0].price,
        quantity: 2,
        image: createdProducts[0].image,
      },
      {
        product: createdProducts[3]._id,
        productName: createdProducts[3].name,
        price: createdProducts[3].price,
        quantity: 1,
        image: createdProducts[3].image,
      },
    ];

    const subtotal = Math.round((createdProducts[0].price * 2 + createdProducts[3].price * 1) * 100) / 100;
    const demoOrder = await Order.create({
      user: customerUser._id,
      items: demoItems,
      customerName: customerUser.name,
      email: customerUser.email,
      phone: customerUser.phone,
      deliveryAddress: customerUser.address,
      note: 'Please leave package by the front door',
      paymentMethod: 'COD',
      subtotal,
      total: subtotal,
      status: 'Delivered',
      stockRestored: false,
      statusHistory: [
        {
          status: 'Pending',
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedBy: customerUser.name,
          note: 'Order placed by customer via Cash on Delivery',
        },
        {
          status: 'Confirmed',
          updatedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
          updatedBy: adminUser.name,
          note: 'Order accepted by store administrator',
        },
        {
          status: 'Packed',
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedBy: adminUser.name,
          note: 'Package prepared and boxed',
        },
        {
          status: 'Shipped',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedBy: adminUser.name,
          note: 'Dispatched with courier tracking',
        },
        {
          status: 'Delivered',
          updatedAt: new Date(),
          updatedBy: adminUser.name,
          note: 'Order successfully delivered to customer',
        },
      ],
    });
    console.log(`Created sample delivered order: #${demoOrder._id.toString().slice(-6)}`);

    // Create Initial Activity Logs
    await ActivityLog.insertMany([
      {
        user: adminUser._id,
        userName: adminUser.name,
        role: 'admin',
        action: 'SYSTEM_INITIALIZED',
        description: 'Database initialized with initial catalogue, administrator, and demo order.',
        relatedId: adminUser._id.toString(),
      },
      {
        user: customerUser._id,
        userName: customerUser.name,
        role: 'user',
        action: 'ORDER_DELIVERED',
        description: `Order #${demoOrder._id.toString().slice(-6)} was marked Delivered.`,
        relatedId: demoOrder._id.toString(),
      },
    ]);
    console.log('Activity logs recorded.');

    console.log('\n--- SEED COMPLETED SUCCESSFULLY ---');
    console.log('Admin Login:    admin@cerave-store.com  /  adminpassword123');
    console.log('Customer Login: customer@example.com    /  customerpassword123');
    console.log('------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
