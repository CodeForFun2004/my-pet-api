// scripts/seedShoppingData.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const BlogArticle = require('../models/blogArticle.model');

// Sample categories data
const categoriesData = [
  {
    name: 'Thức Ăn',
    slug: 'thuc-an',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop&crop=center',
    description: 'Thức ăn dinh dưỡng cho thú cưng',
    isActive: true,
  },
  {
    name: 'Đồ Chơi',
    slug: 'do-choi',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=center',
    description: 'Đồ chơi vui nhộn cho boss',
    isActive: true,
  },
  {
    name: 'Trang Phục',
    slug: 'trang-phuc',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop&crop=center',
    description: 'Quần áo thời trang cho thú cưng',
    isActive: true,
  },
  {
    name: 'Cát Vệ Sinh',
    slug: 'cat-ve-sinh',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&h=300&fit=crop&crop=center',
    description: 'Cát vệ sinh và phụ kiện',
    isActive: true,
  },
];

// Sample products data
const productsData = [
  {
    name: 'Thức Ăn Cho Chó Con Royal Canin Mini Puppy',
    brand: 'Royal Canin',
    price: 450000,
    originalPrice: 520000,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop&crop=center',
    description: 'ROYAL CANIN INTENSE HAIRBALL được thiết kế đặc biệt để hỗ trợ tiêu hóa đường ruột và kiểm soát lông tụ. Lợi ích: Ngăn ngừa sỏi thận, Sức khỏe răng miệng. Thành phần: Thịt gà, gạo, chất béo động vật, chất xơ, vitamin và khoáng chất.',
    weight: '500g',
    color: 'Vàng',
    size: 'M',
    inStock: true,
    stockQuantity: 100,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    name: 'Thức Ăn Cho Mèo Trưởng Thành Whiskas Premium',
    brand: 'Whiskas Premium',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=500&fit=crop&crop=center',
    description: 'WHISKAS PREMIUM được chế biến đặc biệt để đáp ứng nhu cầu dinh dưỡng của mèo trưởng thành. Lợi ích: Protein cao, Omega-3 & Omega-6, Prebiotics. Thành phần: Cá hồi, thịt gà, ngô, gạo, dầu cá, vitamin và khoáng chất.',
    weight: '300g',
    color: 'Đỏ',
    size: 'S',
    inStock: true,
    stockQuantity: 80,
    rating: 4.5,
    reviewCount: 89,
  },
  {
    name: 'Bóng Tennis Cho Chó',
    brand: 'PetSafe',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&crop=center',
    description: 'BÓNG TENNIS CHO CHÓ - Đồ chơi vận động an toàn và bền bỉ. Chất liệu cao su tự nhiên, an toàn cho răng chó.',
    weight: '600g',
    color: 'Xanh',
    size: 'M',
    inStock: true,
    stockQuantity: 50,
    rating: 4.6,
    reviewCount: 78,
  },
  {
    name: 'Áo Len Cho Chó Mùa Đông',
    brand: 'PetFashion',
    price: 180000,
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&h=500&fit=crop&crop=center',
    description: 'ÁO LEN CHO CHÓ MÙA ĐÔNG - Giữ ấm cho thú cưng trong mùa lạnh. Chất liệu len mềm mại, giữ ấm tốt.',
    weight: 'Size S',
    color: 'Xanh dương',
    size: 'S',
    inStock: true,
    stockQuantity: 30,
    rating: 4.5,
    reviewCount: 56,
  },
  {
    name: 'Cát Vệ Sinh Ever Clean',
    brand: 'Ever Clean',
    price: 220000,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=500&h=500&fit=crop&crop=center',
    description: 'CÁT VỆ SINH EVER CLEAN - Cát vệ sinh cao cấp cho mèo. Khử mùi tốt, hút ẩm nhanh, không bụi.',
    weight: '3.6 kg',
    color: 'Trắng',
    size: 'Lớn',
    inStock: true,
    stockQuantity: 40,
    rating: 4.6,
    reviewCount: 89,
  },
];

// Sample blog articles data
const blogArticlesData = [
  {
    title: 'Cách Chăm Sóc Mèo Con',
    description: 'Tìm hiểu về cách chăm sóc giúp bạn nuôi dưỡng những chú mèo con khỏe mạnh và hạnh phúc.',
    content: 'Mèo con cần được chăm sóc đặc biệt trong những tháng đầu đời. Hãy đảm bảo chúng có đủ thức ăn, nước uống và môi trường sống an toàn.',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=250&fit=crop&crop=center',
    author: 'Admin',
    tags: ['mèo', 'chăm sóc', 'thú cưng'],
    readTime: 5,
    isPublished: true,
  },
  {
    title: 'Huấn Luyện Chó Cưng',
    description: 'Những bí quyết vàng để huấn luyện chó cưng của bạn trở nên ngoan ngoãn và thông minh.',
    content: 'Huấn luyện chó là một quá trình cần sự kiên nhẫn và nhất quán. Bắt đầu với các lệnh cơ bản và thưởng cho hành vi tốt.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=250&fit=crop&crop=center',
    author: 'Admin',
    tags: ['chó', 'huấn luyện', 'thú cưng'],
    readTime: 7,
    isPublished: true,
  },
  {
    title: 'Dinh Dưỡng Cho Thú Cưng',
    description: 'Chế độ dinh dưỡng phù hợp giúp thú cưng của bạn luôn khỏe mạnh và tràn đầy năng lượng.',
    content: 'Dinh dưỡng đúng cách là nền tảng cho sức khỏe của thú cưng. Hãy chọn thức ăn phù hợp với độ tuổi và giống loài của chúng.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=250&fit=crop&crop=center',
    author: 'Admin',
    tags: ['dinh dưỡng', 'sức khỏe', 'thú cưng'],
    readTime: 6,
    isPublished: true,
  },
];

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Category.deleteMany({});
    // await Product.deleteMany({});
    // await BlogArticle.deleteMany({});
    // console.log('✅ Cleared existing data');

    // Seed Categories
    console.log('📦 Seeding categories...');
    const createdCategories = [];
    for (const categoryData of categoriesData) {
      // Check if category already exists
      let category = await Category.findOne({ slug: categoryData.slug });
      if (!category) {
        category = await Category.create(categoryData);
        console.log(`  ✅ Created category: ${category.name}`);
      } else {
        console.log(`  ⏭️  Category already exists: ${category.name}`);
      }
      createdCategories.push(category);
    }

    // Seed Products
    console.log('📦 Seeding products...');
    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i];
      // Assign category (cycle through categories)
      const category = createdCategories[i % createdCategories.length];
      
      // Check if product already exists
      const existingProduct = await Product.findOne({ 
        name: productData.name,
        brand: productData.brand 
      });
      
      if (!existingProduct) {
        const product = await Product.create({
          ...productData,
          category: category._id,
        });
        console.log(`  ✅ Created product: ${product.name}`);
      } else {
        console.log(`  ⏭️  Product already exists: ${productData.name}`);
      }
    }

    // Seed Blog Articles
    console.log('📦 Seeding blog articles...');
    for (const articleData of blogArticlesData) {
      // Check if article already exists
      const existingArticle = await BlogArticle.findOne({ title: articleData.title });
      
      if (!existingArticle) {
        const article = await BlogArticle.create(articleData);
        console.log(`  ✅ Created blog article: ${article.title}`);
      } else {
        console.log(`  ⏭️  Blog article already exists: ${articleData.title}`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length}`);
    console.log(`   - Products: ${productsData.length}`);
    console.log(`   - Blog Articles: ${blogArticlesData.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;

