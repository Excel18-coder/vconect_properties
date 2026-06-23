/*
# Seed Demo Data for VConnect Properties

1. Purpose
- Populate the database with sample properties, images, and data
- Enable immediate testing and demonstration of the platform

2. Data Added
- Sample property listings across different types and locations
- Property images
- Sample reviews
*/

-- Seed sample properties
INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Luxury 4 Bedroom Villa in Karen',
  'Stunning modern villa featuring spacious living areas, a private swimming pool, manicured gardens, and premium finishes throughout. Perfect for families seeking luxury and comfort in one of Nairobi most prestigious neighborhoods.',
  45000000,
  'villa',
  'sale',
  4,
  4,
  2,
  450,
  1200,
  'Kenya',
  'Nairobi',
  'Karen',
  'Karen Road, Near The Hub',
  ARRAY['Swimming Pool', 'Garden', 'Security', 'Parking', 'Air Conditioning'],
  ARRAY['Gated Community', 'Pet Friendly', 'Furnished'],
  'active',
  true,
  342,
  28
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Modern 3 Bedroom Apartment in Kilimani',
  'Contemporary apartment in the heart of Kilimani with open-plan living, modern kitchen, balcony with city views, and access to gym and swimming pool. Close to shopping centers and restaurants.',
  18500000,
  'apartment',
  'sale',
  3,
  2,
  1,
  145,
  null,
  'Kenya',
  'Nairobi',
  'Kilimani',
  'Kirichwa Road, Kilimani',
  ARRAY['Gym', 'Swimming Pool', 'Elevator', 'Parking', 'Security'],
  ARRAY['Balcony', 'City View'],
  'active',
  true,
  567,
  45
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Cozy 2 Bedroom House in Lavington',
  'Charming 2 bedroom house in a quiet Lavington neighborhood. Features a lovely garden, parking space, and is close to schools and shopping areas. Ideal for young professionals or small families.',
  12000000,
  'house',
  'sale',
  2,
  2,
  1,
  95,
  300,
  'Kenya',
  'Nairobi',
  'Lavington',
  'James Gichuru Road, Lavington',
  ARRAY['Garden', 'Parking', 'Security'],
  ARRAY['Quiet Neighborhood', 'Near Schools'],
  'active',
  false,
  234,
  19
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Executive Office Space in Westlands',
  'Premium office space in Westlands business district. Open-plan layout with meeting rooms, reception area, and modern fittings. Building features 24/7 security, backup generator, and ample parking.',
  85000,
  'office',
  'rent',
  0,
  2,
  5,
  250,
  null,
  'Kenya',
  'Nairobi',
  'Westlands',
  'Waiyaki Way, Westlands',
  ARRAY['Security', 'Generator', 'Parking', 'Elevator'],
  ARRAY['Business District', 'Near Transport'],
  'active',
  true,
  189,
  12
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Spacious Townhouse in Kileleshwa',
  'Beautiful 3 bedroom townhouse in a secure compound. Features a private garden, spacious living room, modern kitchen, and master ensuite. Located in a serene neighborhood with easy access to the CBD.',
  22000000,
  'townhouse',
  'sale',
  3,
  3,
  2,
  180,
  350,
  'Kenya',
  'Nairobi',
  'Kileleshwa',
  'Othaya Road, Kileleshwa',
  ARRAY['Garden', 'Parking', 'Security'],
  ARRAY['Gated Community', 'Near CBD'],
  'active',
  false,
  312,
  23
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  '1 Bedroom Apartment for Rent in Westlands',
  'Stylish 1 bedroom apartment perfect for young professionals. Features modern finishes, balcony, and access to shared gym. Located near Sarit Centre and public transport.',
  65000,
  'apartment',
  'rent',
  1,
  1,
  1,
  55,
  null,
  'Kenya',
  'Nairobi',
  'Westlands',
  'Sarit Centre Road, Westlands',
  ARRAY['Gym', 'Security', 'Parking'],
  ARRAY['Near Shopping', 'Public Transport'],
  'active',
  false,
  445,
  34
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Commercial Shop in Mombasa Road',
  'Prime commercial shop space on Mombasa Road with high foot traffic. Suitable for retail, restaurant, or showroom. Ample parking and good visibility from the main road.',
  150000,
  'commercial',
  'rent',
  0,
  2,
  10,
  300,
  500,
  'Kenya',
  'Nairobi',
  'Mombasa Road',
  'Mombasa Road, Near Nextgen Mall',
  ARRAY['Parking', 'Security'],
  ARRAY['High Traffic', 'Main Road'],
  'active',
  false,
  156,
  8
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  '5 Bedroom Mansion in Runda',
  'Magnificent 5 bedroom mansion in the exclusive Runda neighborhood. Features a swimming pool, expansive gardens, guest house, and state-of-the-art security system. The epitome of luxury living.',
  120000000,
  'villa',
  'sale',
  5,
  5,
  4,
  650,
  2500,
  'Kenya',
  'Nairobi',
  'Runda',
  'Runda Estate, Kiambu Road',
  ARRAY['Swimming Pool', 'Garden', 'Security', 'Parking', 'Air Conditioning', 'Generator'],
  ARRAY['Guest House', 'Gated Estate', 'Premium Location'],
  'active',
  true,
  678,
  56
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO properties (seller_id, title, description, price, property_type, listing_type, bedrooms, bathrooms, parking_spaces, property_size, land_size, country, county, city, full_address, amenities, features, status, is_featured, views_count, favorites_count)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  'Prime Land for Sale in Kitengela',
  'Excellent 1-acre plot in fast-growing Kitengela area. Ideal for residential development or investment. Good road access and near amenities. Title deed ready.',
  8500000,
  'land',
  'sale',
  0,
  0,
  0,
  null,
  4047,
  'Kenya',
  'Kajiado',
  'Kitengela',
  'Namanga Road, Kitengela',
  ARRAY[]::text[],
  ARRAY['Good Access', 'Near Amenities', 'Ready Title'],
  'active',
  false,
  289,
  15
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1)
ON CONFLICT DO NOTHING;

-- Add property images for the seeded properties
INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', true, 0
FROM properties p WHERE p.title = 'Luxury 4 Bedroom Villa in Karen'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', true, 0
FROM properties p WHERE p.title = 'Modern 3 Bedroom Apartment in Kilimani'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', true, 0
FROM properties p WHERE p.title = 'Cozy 2 Bedroom House in Lavington'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', true, 0
FROM properties p WHERE p.title = 'Executive Office Space in Westlands'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', true, 0
FROM properties p WHERE p.title = 'Spacious Townhouse in Kileleshwa'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', true, 0
FROM properties p WHERE p.title = '1 Bedroom Apartment for Rent in Westlands'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', true, 0
FROM properties p WHERE p.title = 'Commercial Shop in Mombasa Road'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', true, 0
FROM properties p WHERE p.title = '5 Bedroom Mansion in Runda'
ON CONFLICT DO NOTHING;

INSERT INTO property_images (property_id, image_url, is_primary, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', true, 0
FROM properties p WHERE p.title = 'Prime Land for Sale in Kitengela'
ON CONFLICT DO NOTHING;
