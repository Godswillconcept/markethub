'use strict';
const { faker } = require('@faker-js/faker/locale/en_US');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');
const VariantService = require('../services/variant.service');

// Products folder path for local images
const PRODUCTS_FOLDER = path.join(__dirname, '../products');

// Function to read local images from products folder
const getLocalImages = () => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  try {
    if (!fs.existsSync(PRODUCTS_FOLDER)) {
      console.warn(`Products folder not found at ${PRODUCTS_FOLDER}`);
      return [];
    }
    const files = fs.readdirSync(PRODUCTS_FOLDER);
    return files.filter(file => 
      validExtensions.includes(path.extname(file).toLowerCase())
    );
  } catch (error) {
    console.error('Error reading products folder:', error);
    return [];
  }
};

// Configure faker
const {
  number: { int: randomNumber },
  helpers: { arrayElement },
  commerce: { productDescription, productMaterial, productAdjective },
  image: { fashion },
  datatype: { boolean, float },
  lorem: { sentence, sentences, paragraph, paragraphs },
  date: { past, between },
  person: { firstName, lastName }
} = faker;

// Helper function to generate a slug from a string
const generateSlug = (name) => {
  return slugify(name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

// Real brand names for different categories
const BRANDS = {
  't-shirts': ['Nike', 'Adidas', 'Puma', 'H&M', 'Zara', 'Uniqlo', 'Levis', 'Tommy Hilfiger'],
  'shorts': ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok', 'Champion', 'Fila'],
  'skirts': ['Zara', 'H&M', 'Mango', 'Forever 21', 'ASOS', 'Topshop', 'Bershka'],
  'hoodies': ['Champion', 'Nike', 'Adidas', 'The North Face', 'Puma', 'Calvin Klein', 'Tommy Hilfiger'],
  'shirts': ['Ralph Lauren', 'Tommy Hilfiger', 'Brooks Brothers', 'Uniqlo', 'H&M', 'Zara', 'Gap'],
  'jeans': ['Levis', 'Wrangler', 'Diesel', 'Calvin Klein', 'Lee', 'Guess', 'True Religion']
};

const COLOR_HEX_MAP = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Navy': '#000080',
  'Gray': '#808080',
  'Red': '#FF0000',
  'Royal Blue': '#4169E1',
  'Forest Green': '#228B22',
  'Mustard': '#FFDB58',
  'Khaki': '#F0E68C',
  'Olive': '#808000',
  'Charcoal': '#36454F',
  'Light Blue': '#ADD8E6',
  'Beige': '#F5F5DC',
  'Pink': '#FFC0CB',
  'Floral Print': null, 
  'Striped': null,
  'Burgundy': '#800020',
  'Heather Gray': '#9AA297',
  'Light Wash': '#ADD8E6',
  'Medium Wash': '#7895CB',
  'Dark Wash': '#2F4562'
};

const getColorHex = (colorName) => {
  return COLOR_HEX_MAP[colorName] || null;
};

// Real product data for different categories
const CATEGORY_PRODUCTS = {
  't-shirts': [
    'Classic Fit T-Shirt', 'Slim Fit T-Shirt', 'V-Neck T-Shirt', 'Polo Shirt', 'Graphic T-Shirt',
    'Long Sleeve T-Shirt', 'Pocket T-Shirt', 'Henley T-Shirt', 'Ringer T-Shirt', 'Muscle Fit T-Shirt'
  ],
  'shorts': [
    'Athletic Shorts', 'Cargo Shorts', 'Chino Shorts', 'Denim Shorts', 'Linen Shorts',
    'Running Shorts', 'Swim Trunks', 'Basketball Shorts', 'Cargo Jogger Shorts', 'Tailored Shorts'
  ],
  'skirts': [
    'Midi Skirt', 'Mini Skirt', 'Maxi Skirt', 'Pleated Skirt', 'Denim Skirt',
    'Pencil Skirt', 'A-line Skirt', 'Wrap Skirt', 'Skater Skirt', 'Tulle Skirt'
  ],
  'hoodies': [
    'Pullover Hoodie', 'Zip-Up Hoodie', 'Oversized Hoodie', 'Fleece Hoodie', 'Athletic Hoodie',
    'Graphic Hoodie', 'Sweatshirt Hoodie', 'Cropped Hoodie', 'Sherpa Hoodie', 'Hooded Jacket'
  ],
  'shirts': [
    'Oxford Button-Down Shirt', 'Dress Shirt', 'Flannel Shirt', 'Linen Shirt', 'Chambray Shirt',
    'Denim Shirt', 'Short Sleeve Shirt', 'Corduroy Shirt', 'Cuban Collar Shirt', 'Striped Shirt'
  ],
  'jeans': [
    'Slim Fit Jeans', 'Skinny Jeans', 'Straight Leg Jeans', 'Bootcut Jeans', 'Relaxed Fit Jeans',
    'Tapered Jeans', 'High Waist Jeans', 'Mom Jeans', 'Boyfriend Jeans', 'Flared Jeans'
  ]
};

// Real product descriptions for different categories
const PRODUCT_DESCRIPTIONS = {
  't-shirts': [
    'Made from 100% premium cotton for ultimate comfort and breathability.',
    'Soft and lightweight fabric that keeps you cool all day long.',
    'Classic fit that never goes out of style, perfect for any casual occasion.',
    'Reinforced stitching for enhanced durability and long-lasting wear.',
    'Eco-friendly materials that are gentle on your skin and the environment.'
  ],
  'shorts': [
    'Ideal for both workouts and casual wear with moisture-wicking technology.',
    'Designed for maximum comfort and flexibility during any activity.',
    'Lightweight and breathable fabric that keeps you cool in warm weather.',
    'Multiple pockets provide ample storage for your essentials on the go.',
    'Elastic waistband with drawstring for a customizable, secure fit.'
  ],
  'skirts': [
    'Flattering silhouette that complements any body type beautifully.',
    'Versatile design that transitions seamlessly from day to night.',
    'Flowy fabric that moves with you for ultimate comfort and style.',
    'Classic design with modern details for a timeless look.',
    'Perfect length for both casual outings and special occasions.'
  ],
  'hoodies': [
    'Plush fleece interior for exceptional warmth and comfort.',
    'Adjustable drawstring hood for a customized fit and extra coziness.',
    'Kangaroo pocket provides storage and keeps hands warm.',
    'Ribbed cuffs and hem for a snug, comfortable fit that locks in heat.',
    'Durable construction designed to maintain shape and softness wash after wash.'
  ],
  'shirts': [
    'Classic button-down design made from high-quality fabric for a crisp look.',
    'Versatile shirt that easily transitions from office to after-hours.',
    'Breathable material keeps you comfortable throughout the day.',
    'Tailored fit for a modern, polished silhouette.',
    'Easy-iron finish for effortless maintenance and a sharp appearance.'
  ],
  'jeans': [
    'Premium denim with just the right amount of stretch for all-day comfort.',
    'Classic five-pocket design with reinforced stitching for durability.',
    'Mid-rise waist with a flattering fit that looks great on everyone.',
    'Distressed details for a trendy, lived-in look that never goes out of style.',
    'Designed to maintain color and shape even after multiple washes.'
  ]
};

// Generate realistic product variants based on category (new system)
const generateVariants = async (productId, category, variantTypeMap) => {
  const variants = [];

  // Define variant types based on category
  const variantTypes = {
    't-shirts': {
      'size': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      'color': ['Black', 'White', 'Navy', 'Gray', 'Red', 'Royal Blue', 'Forest Green', 'Mustard'],
      'fit': ['Slim', 'Regular', 'Oversized', 'Relaxed']
    },
    'shorts': {
      'size': ['28', '30', '32', '34', '36', '38'],
      'color': ['Black', 'Navy', 'Khaki', 'Olive', 'Charcoal', 'Light Blue'],
      'length': ['5" Inseam', '7" Inseam', '9" Inseam', '11" Inseam']
    },
    'skirts': {
      'size': ['XS', 'S', 'M', 'L', 'XL'],
      'color': ['Black', 'Navy', 'Beige', 'Pink', 'Red', 'Floral Print', 'Striped'],
      'pattern': ['Solid', 'Striped', 'Floral', 'Plaid', 'Polka Dot']
    },
    'hoodies': {
      'size': ['S', 'M', 'L', 'XL', 'XXL'],
      'color': ['Black', 'Charcoal', 'Navy', 'Burgundy', 'Olive', 'Heather Gray'],
      'style': ['Pullover', 'Zip-Up']
    },
    'shirts': {
      'size': ['S', 'M', 'L', 'XL', 'XXL'],
      'color': ['White', 'Light Blue', 'Navy', 'Gray', 'Black', 'Striped'],
      'fit': ['Slim', 'Regular', 'Modern']
    },
    'jeans': {
      'waist': ['28', '30', '32', '34', '36', '38'],
      'length': ['30"', '32"', '34"', '36"'],
      'wash': ['Light Wash', 'Medium Wash', 'Dark Wash', 'Black', 'White']
    }
  };

  // Get the appropriate variant types for this category
  const categoryVariants = variantTypes[category] || variantTypes['t-shirts'];

  // Only generate variants for valid product IDs (positive numbers)
  if (productId <= 0) {
    return variants;
  }

  // Generate variants for each type
  for (const [typeName, values] of Object.entries(categoryVariants)) {
    const variantTypeId = variantTypeMap[typeName];
    if (!variantTypeId) continue; // Skip if variant type doesn't exist

    // Randomly select 3-6 values for this type to keep combinations manageable
    const selectedValues = values
      .sort(() => 0.5 - Math.random())
      .slice(0, randomNumber({ min: 3, max: 6 }));

    for (const value of selectedValues) {
      variants.push({
        product_id: productId,
        variant_type_id: variantTypeId,
        name: typeName,
        value: value,
        hex_code: typeName.toLowerCase() === 'color' ? getColorHex(value) : null,
        created_at: new Date()
      });
    }
  }

  return variants;
};

// Generate product images from local products folder
const generateImages = (productId, productName, category, isFeatured = false, localImages) => {
  const images = [];
  
  if (!localImages || localImages.length === 0) {
    return images;
  }
  
  // Generate 3-5 images per product
  const imageCount = randomNumber({ min: 3, max: 5 });
  
  // Shuffle and select unique images for this product
  const shuffled = [...localImages].sort(() => 0.5 - Math.random());
  const selectedImages = shuffled.slice(0, Math.min(imageCount, localImages.length));
  
  for (let i = 0; i < selectedImages.length; i++) {
    images.push({
      product_id: productId,
      image_url: `/products/${selectedImages[i]}`,
      is_featured: i === 0 ? 1 : 0, // First image is featured
      created_at: new Date()
    });
  }
  
  return images;
};

// Generate a realistic product based on category
const generateProduct = (vendorIds, categoryInfo, index) => {
  const vendorId = arrayElement(vendorIds);
  const { id: categoryId, name: categoryName, slug: categorySlug } = categoryInfo;
  
  // Extract subcategory from slug (e.g., 'men-t-shirts' -> 't-shirts')
  const subcategory = categorySlug.split('-').slice(1).join('-');
  
  // Generate product name and details based on category
  const brand = arrayElement(BRANDS[subcategory] || ['Generic']);
  const productType = arrayElement(CATEGORY_PRODUCTS[subcategory] || ['Product']);
  const productName = `${brand} ${productType}`;
  
  // Generate realistic pricing based on category
  const basePrice = getBasePrice(subcategory);
  const price = parseFloat((basePrice * (0.8 + Math.random() * 0.6)).toFixed(2)); 
  const hasDiscount = Math.random() > 0.7; 
  const discountPercentage = hasDiscount ? randomNumber({ min: 10, max: 40 }) : 0;
  const salePrice = hasDiscount ? parseFloat((price * (1 - discountPercentage / 100)).toFixed(2)) : null;
  
  const description = generateProductDescription(productName, brand, subcategory);
  
  return {
    name: productName,
    slug: generateSlug(productName) + '-' + randomNumber({ min: 1000, max: 9999 }),
    description: description,
    thumbnail: null, 
    price: price,
    discounted_price: salePrice,
    sku: `${brand.substring(0, 3).toUpperCase()}${subcategory.substring(0, 3).toUpperCase()}${randomNumber({ min: 1000, max: 9999 })}`,
    status: 'active',
    vendor_id: vendorId,
    category_id: categoryId,
    created_at: past(365),
    updated_at: new Date()
  };
};

function getBasePrice(subcategory) {
  const priceRanges = {
    't-shirts': { min: 15, max: 50 },
    'shorts': { min: 20, max: 70 },
    'skirts': { min: 25, max: 90 },
    'hoodies': { min: 30, max: 120 },
    'shirts': { min: 25, max: 80 },
    'jeans': { min: 40, max: 150 }
  };
  
  const range = priceRanges[subcategory] || { min: 10, max: 100 };
  return randomNumber(range);
}

function generateProductDescription(name, brand, subcategory) {
  const descriptions = PRODUCT_DESCRIPTIONS[subcategory] || [
    'High-quality product designed for comfort and style.',
    'Versatile piece that can be dressed up or down for any occasion.',
    'Made with premium materials for lasting durability.',
    'Perfect addition to your wardrobe for year-round wear.',
    'Designed with attention to detail and modern aesthetics.'
  ];
  
  const features = [
    'Breathable fabric for all-day comfort',
    'Easy care and machine washable',
    'Reinforced stitching for durability',
    'Classic design that never goes out of style',
    'Perfect fit for any body type'
  ];
  
  const selectedFeatures = features
    .sort(() => 0.5 - Math.random())
    .slice(0, randomNumber({ min: 2, max: 4 }));
  
  const description = arrayElement(descriptions);
  const featureList = selectedFeatures.map(f => `• ${f}`).join('\n');
  
  return `${name} by ${brand}. ${description}\n\nFeatures:\n${featureList}\n\nAvailable in multiple sizes and colors.`;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const localImages = getLocalImages();
    console.log(`Found ${localImages.length} local images in products folder`);
    
    // Pre-fetch variant types once
    const variantTypeMap = {};
    const variantTypesFromDB = await queryInterface.sequelize.query(
      'SELECT id, name FROM variant_types',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    variantTypesFromDB.forEach(vt => { variantTypeMap[vt.name] = vt.id; });

    const vendors = await queryInterface.sequelize.query(
      'SELECT id FROM vendors WHERE status = "approved"',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (vendors.length === 0) {
      console.log('No approved vendors found. Please seed vendors first.');
      return;
    }

    const allCategories = await queryInterface.sequelize.query(
      `SELECT id, name, slug, parent_id FROM categories`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!allCategories || allCategories.length === 0) {
      throw new Error('No categories found in the database. Please ensure the category seeder has been run.');
    }

    const subCategories = allCategories.filter(cat => cat.parent_id !== null);
    const vendorIds = vendors.map(v => v.id);

    const existingSlugs = await queryInterface.sequelize.query(
      'SELECT slug FROM products',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingSlugSet = new Set(existingSlugs.map(row => row.slug));

    const existingSKUs = await queryInterface.sequelize.query(
      'SELECT sku FROM products WHERE sku IS NOT NULL',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingSKUsSet = new Set(existingSKUs.map(row => row.sku));

    /**
     * Environment-based data volume control:
     * - Production: 1 product per vendor × 10 vendors = 10 total products
     * - Staging: 7 products per vendor × 30 vendors = 210 total products  
     * - Development: 10 products per vendor × 50 vendors = 500 total products
     */
    const productsPerVendor = process.env.NODE_ENV === 'production' ? 1 :
                              process.env.NODE_ENV === 'staging' ? 7 : 10;
    console.log(`Seeding ${productsPerVendor} products per vendor in ${process.env.NODE_ENV} environment`);
    
    const usedSlugs = new Set([...existingSlugSet]);
    const usedSKUs = new Set([...existingSKUsSet]);
    let successCount = 0;
    let failureCount = 0;

    for (const vendor of vendors) {
      for (let i = 0; i < productsPerVendor; i++) {
        const randomCategory = arrayElement(subCategories);
        const simpleSubCategorySlug = randomCategory.slug.split('-').pop();

        let product = generateProduct([vendor.id], randomCategory, successCount + 1);
        
        // Ensure slug uniqueness
        let slugCounter = 1;
        let originalSlug = product.slug;
        while (usedSlugs.has(product.slug)) {
          product.slug = originalSlug.replace(/-\d+$/, '') + '-' + randomNumber({ min: 1000, max: 9999 }) + '-' + slugCounter;
          slugCounter++;
        }
        usedSlugs.add(product.slug);

        // Ensure SKU uniqueness
        let skuCounter = 1;
        let originalSKU = product.sku;
        while (usedSKUs.has(product.sku)) {
          product.sku = originalSKU.replace(/\d+$/, '') + randomNumber({ min: 1000, max: 9999 }) + skuCounter;
          skuCounter++;
        }
        usedSKUs.add(product.sku);

        try {
          // Insert product
          await queryInterface.bulkInsert('products', [product]);

          // Get the actual product ID more robustly by slug
          const lastProduct = await queryInterface.sequelize.query(
            'SELECT id FROM products WHERE slug = ? LIMIT 1',
            { 
              replacements: [product.slug],
              type: queryInterface.sequelize.QueryTypes.SELECT 
            }
          );
          const actualProductId = lastProduct[0].id;

          let productVariants = await generateVariants(actualProductId, simpleSubCategorySlug, variantTypeMap);
          let productImages = generateImages(actualProductId, product.name, simpleSubCategorySlug, i === 0, localImages);

          // Update product with thumbnail if images exist
          if (productImages.length > 0) {
            await queryInterface.sequelize.query(
              `UPDATE products SET thumbnail = ? WHERE id = ?`,
              { replacements: [productImages[0].image_url, actualProductId], type: queryInterface.sequelize.QueryTypes.UPDATE }
            );
          }

          // Insert images
          if (productImages.length > 0) {
            await queryInterface.bulkInsert('product_images', productImages);
          }

          // Insert variants and combinations
          if (productVariants.length > 0) {
            await queryInterface.bulkInsert('product_variants', productVariants);

            // Fetch created variants to get their IDs (robustly by product_id)
            const createdVariants = await queryInterface.sequelize.query(
              `SELECT id, product_id, variant_type_id, name, value FROM product_variants WHERE product_id = ?`,
              { replacements: [actualProductId], type: queryInterface.sequelize.QueryTypes.SELECT }
            );

            if (createdVariants.length > 0) {
              console.log(`Found ${createdVariants.length} variants for product ${actualProductId}`);
              try {
                const combinations = await VariantService.createCombinationsForProduct(actualProductId, createdVariants);
                if (combinations && combinations.length > 0) {
                  console.log(`Successfully created ${combinations.length} combinations for product ${actualProductId}`);
                } else {
                  console.log(`No combinations created for product ${actualProductId}`);
                }
              } catch (comboError) {
                console.error(`Failed to create combinations for product ${actualProductId}:`, comboError.message);
                console.error(comboError.stack);
              }
            } else {
              console.log(`No variants found for product ${actualProductId}`);
            }
          }
          
          successCount++;
          if (successCount % 5 === 0) {
            console.log(`Progress: Successfully seeded ${successCount} products...`);
          }
        } catch (error) {
          failureCount++;
          console.error(`ERROR seeding product index ${i} for vendor ${vendor.id}:`, error.message);
          if (error.errors) {
            console.error('Validation Details:', JSON.stringify(error.errors, null, 2));
          }
        }
      }
    }

    console.log(`Seeding completed. Success: ${successCount}, Failures: ${failureCount}`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('product_variants', null, {});
    await queryInterface.bulkDelete('product_images', null, {});
    await queryInterface.bulkDelete('variant_combinations', null, {});
    await queryInterface.bulkDelete('variant_combination_variants', null, {});
  }
};
