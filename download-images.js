const fs = require('fs');
const path = require('path');
const https = require('https');

const images = [
  {
    name: 'hero-banner.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80',
    targets: ['frontend/public/images/hero-banner.jpg', 'backend/uploads/hero-banner.jpg']
  },
  {
    name: 'about-banner.jpg',
    url: 'https://images.unsplash.com/photo-1608248597359-5613531b26a6?auto=format&fit=crop&w=1200&q=80',
    targets: ['frontend/public/images/about-banner.jpg', 'backend/uploads/about-banner.jpg']
  },
  // Categories
  {
    name: 'cat-cleansers.jpg',
    url: 'https://images.unsplash.com/photo-1556228722-d0b777a83d29?auto=format&fit=crop&w=600&q=80',
    targets: ['frontend/public/images/cat-cleansers.jpg', 'backend/uploads/cat-cleansers.jpg']
  },
  {
    name: 'cat-moisturizers.jpg',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    targets: ['frontend/public/images/cat-moisturizers.jpg', 'backend/uploads/cat-moisturizers.jpg']
  },
  {
    name: 'cat-serums.jpg',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    targets: ['frontend/public/images/cat-serums.jpg', 'backend/uploads/cat-serums.jpg']
  },
  {
    name: 'cat-sunscreens.jpg',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    targets: ['frontend/public/images/cat-sunscreens.jpg', 'backend/uploads/cat-sunscreens.jpg']
  },
  // Products
  {
    name: 'hydrating-cleanser.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/hydrating-cleanser.jpg']
  },
  {
    name: 'foaming-cleanser.jpg',
    url: 'https://images.unsplash.com/photo-1556228722-d0b777a83d29?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/foaming-cleanser.jpg']
  },
  {
    name: 'daily-lotion.jpg',
    url: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/daily-lotion.jpg']
  },
  {
    name: 'moisturizing-cream.jpg',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/moisturizing-cream.jpg']
  },
  {
    name: 'hyaluronic-serum.jpg',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/hyaluronic-serum.jpg']
  },
  {
    name: 'vitamin-c-serum.jpg',
    url: 'https://images.unsplash.com/photo-1608248597359-5613531b26a6?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/vitamin-c-serum.jpg']
  },
  {
    name: 'am-facial-lotion-spf30.jpg',
    url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/am-facial-lotion-spf30.jpg']
  },
  {
    name: 'mineral-sunscreen-spf50.jpg',
    url: 'https://images.unsplash.com/photo-1567928815116-24e537ba395f?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/mineral-sunscreen-spf50.jpg']
  },
  {
    name: 'eye-repair-cream.jpg',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/eye-repair-cream.jpg']
  },
  {
    name: 'renewing-night-cream.jpg',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/renewing-night-cream.jpg']
  },
  {
    name: 'salicylic-cleanser.jpg',
    url: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/salicylic-cleanser.jpg']
  },
  {
    name: 'healing-ointment.jpg',
    url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80',
    targets: ['backend/uploads/healing-ointment.jpg']
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const rootDir = process.cwd();
  
  // Ensure directories exist
  const dirs = [
    path.join(rootDir, 'backend', 'uploads'),
    path.join(rootDir, 'frontend', 'public', 'images')
  ];
  for (const d of dirs) {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  }

  for (const item of images) {
    const tempFile = path.join(rootDir, 'backend', 'uploads', `tmp_${item.name}`);
    try {
      console.log(`Downloading ${item.name}...`);
      await download(item.url, tempFile);
      for (const targetRel of item.targets) {
        const targetPath = path.join(rootDir, targetRel);
        fs.copyFileSync(tempFile, targetPath);
        console.log(`  -> Saved to ${targetRel}`);
      }
      fs.unlinkSync(tempFile);
    } catch (e) {
      console.error(`Error downloading ${item.name}: ${e.message}`);
    }
  }
  console.log('Image download completed.');
}

run();
