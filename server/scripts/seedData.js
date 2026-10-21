const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Stamp = require('../models/Stamp');
const ForumPost = require('../models/ForumPost');
const Trade = require('../models/Trade');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas for seeding...');

    // Hash password for demo users
    const salt = await bcrypt.genSalt(10);
    const demoPassword = await bcrypt.hash('Password123!', salt);

    // 1. Ensure collectors exist
    const collectorsData = [
      {
        name: 'Rajesh Sharma',
        username: 'rajesh_stamps',
        email: 'rajesh@example.com',
        password: demoPassword,
        bio: 'Philatelist for 25+ years focusing on Indian Independence, Mahatma Gandhi issues, and British Raj postal history.',
        location: 'Mumbai, Maharashtra',
        role: 'user',
        isPublic: true,
        collectingInterests: ['Independence Issues', 'Mahatma Gandhi', 'British Raj', 'First Day Covers']
      },
      {
        name: 'Dr. Ananya Sen',
        username: 'ananya_sen',
        email: 'ananya@example.com',
        password: demoPassword,
        bio: 'Senior researcher and avid philatelist. Passionate about flora & fauna stamps, airmail history, and miniature sheets.',
        location: 'Kolkata, West Bengal',
        role: 'user',
        isPublic: true,
        collectingInterests: ['Flora & Fauna', 'Airmail', 'Miniature Sheets', 'Asian Wildlife']
      },
      {
        name: 'Vikramaditya Rao',
        username: 'vikram_rao',
        email: 'vikram@example.com',
        password: demoPassword,
        bio: 'Collector of Princely States (Feudatory States) stamps, postal stationery, and rare printing watermarks.',
        location: 'Bangalore, Karnataka',
        role: 'user',
        isPublic: true,
        collectingInterests: ['Princely States', 'Postal Stationery', 'Watermark Varieties', 'Travancore & Hyderabad']
      },
      {
        name: 'Emily Watson',
        username: 'emily_watson',
        email: 'emily@example.com',
        password: demoPassword,
        bio: 'Commonwealth and international classics enthusiast based in London. Always looking for rare British Commonwealth exchanges.',
        location: 'London, United Kingdom',
        role: 'user',
        isPublic: true,
        collectingInterests: ['Commonwealth', 'Early Classics', 'Penny Black', 'Postal History']
      }
    ];

    const collectorDocs = [];
    for (const c of collectorsData) {
      let doc = await User.findOne({ email: c.email });
      if (!doc) {
        doc = await User.create(c);
        console.log(`Created collector: ${doc.name}`);
      }
      collectorDocs.push(doc);
    }

    // Also get Bishwanth
    const bishwanth = await User.findOne({ email: 'bishwanthkumar1295@gmail.com' });
    const rajesh = collectorDocs[0];
    const ananya = collectorDocs[1];
    const vikram = collectorDocs[2];
    const emily = collectorDocs[3];

    // 2. High-quality Philately Stamps
    const stampsData = [
      {
        title: 'Mahatma Gandhi Memorial Issue (10 Rupees)',
        description: 'Issued on 15 August 1948 to commemorate the first anniversary of Indian Independence and honour Mahatma Gandhi following his martyrdom in January 1948. Printed by Courvoisier S.A. in Switzerland via photogravure on granite paper with "India Postage" watermark.',
        country: 'India',
        year: 1948,
        issueDate: '15 August 1948',
        denomination: '10 Rupees',
        theme: 'National Leaders & Freedom',
        category: 'Commemorative',
        condition: 'Mint',
        rarity: 'Rare',
        quantity: 2,
        estimatedValue: 45000,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/India_1948_Gandhi_10R_stamp.jpg/480px-India_1948_Gandhi_10R_stamp.jpg',
        isForTrade: true,
        isWanted: false,
        tags: ['gandhi', 'memorial', '1948', 'rare', 'switzerland', 'independence'],
        owner: bishwanth?._id || rajesh._id
      },
      {
        title: 'First Indian Airmail (Allahabad to Naini)',
        description: 'World\'s first official airmail flight conducted by French aviator Henri Pequet on 18 February 1911 from Allahabad to Naini Junction across the Yamuna River during the United Provinces Exhibition.',
        country: 'India',
        year: 1911,
        issueDate: '18 February 1911',
        denomination: 'Special Cachet',
        theme: 'Aviation History',
        category: 'Airmail',
        condition: 'First Day Cover',
        rarity: 'Very Rare',
        quantity: 1,
        estimatedValue: 125000,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/1911_Allahabad_Airmail_envelope.jpg/480px-1911_Allahabad_Airmail_envelope.jpg',
        isForTrade: false,
        isWanted: false,
        tags: ['airmail', 'allahabad', 'naini', '1911', 'first-flight', 'historic'],
        owner: rajesh._id
      },
      {
        title: 'Penny Black (1840 Great Britain)',
        description: 'The world\'s first adhesive postage stamp used in a public postal system. Features profile of young Queen Victoria. Engraved by Charles Heath and his son Frederick from a sketch provided by Henry Corbould.',
        country: 'Great Britain',
        year: 1840,
        issueDate: '1 May 1840',
        denomination: 'One Penny (1d)',
        theme: 'Royal Portraits & Classics',
        category: 'Definitive',
        condition: 'Used',
        rarity: 'Rare',
        quantity: 1,
        estimatedValue: 85000,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Penny_black.jpg/480px-Penny_black.jpg',
        isForTrade: true,
        isWanted: false,
        tags: ['penny-black', '1840', 'great-britain', 'victoria', 'first-stamp'],
        owner: emily._id
      },
      {
        title: 'Konark Sun Temple Wheel (Archaeological Series)',
        description: 'Famous definitive series stamp portraying the celestial stone chariot wheel of Konark Sun Temple in Odisha. High denomination issued in the post-independence definitive archaeological series.',
        country: 'India',
        year: 1949,
        issueDate: '15 August 1949',
        denomination: '3 Annas',
        theme: 'Architecture & Heritage',
        category: 'Definitive',
        condition: 'Mint',
        rarity: 'Uncommon',
        quantity: 4,
        estimatedValue: 4200,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/India_1949_stamp_Konark_Sun_Temple.jpg/480px-India_1949_stamp_Konark_Sun_Temple.jpg',
        isForTrade: true,
        isWanted: false,
        tags: ['konark', 'odisha', 'temple', 'archaeology', '1949'],
        owner: ananya._id
      },
      {
        title: 'Asiatic Lion (Indian Wildlife Protection Series)',
        description: 'Commemorative stamp dedicated to the preservation of the majestic Asiatic Lion of Gir Forest, Gujarat. Rich emerald green shade with detailed engraving.',
        country: 'India',
        year: 1963,
        issueDate: '7 October 1963',
        denomination: '15 Naya Paise',
        theme: 'Flora & Fauna',
        category: 'Commemorative',
        condition: 'Mint',
        rarity: 'Common',
        quantity: 6,
        estimatedValue: 850,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Asiatic_Lion_1963_India_Stamp.jpg/480px-Asiatic_Lion_1963_India_Stamp.jpg',
        isForTrade: true,
        isWanted: false,
        tags: ['wildlife', 'lion', 'gir', 'fauna', 'conservation'],
        owner: ananya._id
      },
      {
        title: 'Aryabhata Space Satellite First Launch',
        description: 'Commemorating India\'s entry into the space age with the launch of its first unmanned Earth satellite Aryabhata, launched by the Soviet Union on 19 April 1975 under ISRO.',
        country: 'India',
        year: 1975,
        issueDate: '19 April 1975',
        denomination: '25 Paise',
        theme: 'Space Science & ISRO',
        category: 'Commemorative',
        condition: 'Mint',
        rarity: 'Common',
        quantity: 5,
        estimatedValue: 600,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Aryabhata_satellite_stamp_1975.jpg/480px-Aryabhata_satellite_stamp_1975.jpg',
        isForTrade: true,
        isWanted: false,
        tags: ['space', 'aryabhata', 'isro', 'satellite', '1975'],
        owner: vikram._id
      },
      {
        title: 'Inverted Head 4 Annas (1854 Classic Variety)',
        description: 'One of the world\'s first multicolor stamps and among the most famous printing error varieties in classic philately. The blue frame was printed upright while the red Queen Victoria vignette was inverted.',
        country: 'India',
        year: 1854,
        issueDate: 'October 1854',
        denomination: '4 Annas',
        theme: 'Errors & Varieties',
        category: 'Special',
        condition: 'Cancelled',
        rarity: 'Unique',
        quantity: 1,
        estimatedValue: 850000,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/India_1854_inverted_head_4a.jpg/480px-India_1854_inverted_head_4a.jpg',
        isForTrade: false,
        isWanted: true,
        tags: ['error', 'inverted-head', '1854', 'queen-victoria', 'masterpiece'],
        owner: vikram._id
      }
    ];

    // Insert stamps if not present
    for (const s of stampsData) {
      const exists = await Stamp.findOne({ title: s.title });
      if (!exists) {
        await Stamp.create(s);
        console.log(`Created stamp: ${s.title}`);
      }
    }

    // 3. Forum Discussions with replies & stamp identification
    const forumPostsData = [
      {
        title: '🔍 Need identification help: 1930s Indian Princely State stamp with violet overprint',
        content: `Greetings fellow philatelists!\n\nI acquired an album page of classic Indian Princely States and found this stamp with an intriguing violet circular handstamp overprint. It appears to be from either Travancore or Cochin, but the script is partially obscured.\n\nCould any specialist in Feudatory States verify the denomination, year of issue, and whether this overprint indicates official state government service (Anchel)? Any help with catalog reference (Stanley Gibbons or Phila India) would be greatly appreciated!`,
        category: 'Identification',
        author: ananya._id,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/India_1949_stamp_Konark_Sun_Temple.jpg/480px-India_1949_stamp_Konark_Sun_Temple.jpg',
        views: 142,
        likes: [rajesh._id, vikram._id, emily._id],
        comments: [
          {
            author: vikram._id,
            content: 'Hello Ananya! Looking at the perforation and paper type, this is indeed Travancore State, issued circa 1939 during the reign of Maharaja Chithira Thirunal Balarama Varma. The violet overprint is the "SERVICE" handstamp.',
            createdAt: new Date(Date.now() - 3600 * 1000 * 24),
            replies: [
              {
                author: ananya._id,
                content: 'Thank you so much Vikram! Does the SG catalog list any watermark inverted varieties for this issue?',
                createdAt: new Date(Date.now() - 3600 * 1000 * 12)
              },
              {
                author: vikram._id,
                content: 'Yes! Check for the Conch Shell (Shankha) watermark. If inverted, it carries a significant premium.',
                createdAt: new Date(Date.now() - 3600 * 1000 * 6)
              }
            ]
          },
          {
            author: rajesh._id,
            content: 'Wonderful piece. Travancore Anchel stamps are becoming increasingly sought after by serious postal historians.',
            createdAt: new Date(Date.now() - 3600 * 1000 * 18),
            replies: []
          }
        ]
      },
      {
        title: 'Guide to preserving Mint Never-Hinged (MNH) stamps in tropical monsoon humidity',
        content: `As monsoon approaches across the Indian subcontinent, gum degradation and humidity spots (foxing) pose the greatest threat to our collections.\n\nHere are the top preservation techniques I have refined over three decades:\n1. Never store albums flat — keep stockbooks vertically like books on a bookshelf.\n2. Use archival Lighthouse or Prinz mounts made of acid-free, non-plasticized Polystyrene.\n3. Keep reusable silica gel canisters inside your collection cabinets.\n4. Maintain relative humidity between 45% and 55% at all costs.\n\nWhat are your tips for keeping gum intact during high humidity?`,
        category: 'General',
        author: rajesh._id,
        views: 285,
        likes: [ananya._id, vikram._id, emily._id, bishwanth?._id].filter(Boolean),
        comments: [
          {
            author: emily._id,
            content: 'Great advice Rajesh! Also remember to air out stockbooks once every 6 months to prevent micro-moisture buildup.',
            createdAt: new Date(Date.now() - 3600 * 1000 * 30),
            replies: []
          }
        ]
      },
      {
        title: 'The historic backstory of the 1948 Gandhi Memorial 10-Rupee Stamp',
        content: `On 15 August 1948, exactly one year after India became free, India Post issued a set of 4 commemorative stamps in honour of Mahatma Gandhi.\n\nDue to the nascent state of the Nasik Security Press at the time, the government contracted Courvoisier in La Chaux-de-Fonds, Switzerland. They produced what many consider the finest photogravure portraits in philatelic history.\n\nOnly 250,000 copies of the 10-Rupee denomination were printed, and 100 copies were overprinted with "SERVICE" for the Governor-General\'s secretariat, making the "Gandhi Service" stamp one of the rarest modern stamps in the world!`,
        category: 'Showcase',
        author: bishwanth?._id || rajesh._id,
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/India_1948_Gandhi_10R_stamp.jpg/480px-India_1948_Gandhi_10R_stamp.jpg',
        views: 410,
        likes: [rajesh._id, ananya._id, vikram._id],
        comments: []
      }
    ];

    for (const p of forumPostsData) {
      const exists = await ForumPost.findOne({ title: p.title });
      if (!exists) {
        await ForumPost.create(p);
        console.log(`Created forum post: ${p.title.slice(0, 40)}...`);
      }
    }

    // 4. Sample Trade Offer between collectors
    const gandhiStamp = await Stamp.findOne({ title: /Gandhi/ });
    const pennyStamp = await Stamp.findOne({ title: /Penny Black/ });
    const lionStamp = await Stamp.findOne({ title: /Lion/ });

    const existingTrades = await Trade.countDocuments();
    if (existingTrades === 0 && gandhiStamp && pennyStamp) {
      await Trade.create({
        initiator: rajesh._id,
        receiver: emily._id,
        offeredStamps: [gandhiStamp._id],
        requestedStamps: [pennyStamp._id],
        status: 'pending',
        message: 'Hello Emily! I would love to propose exchanging a pristine 1948 Gandhi Memorial 10R for your Penny Black 1840. Both are in exceptional condition.',
        messages: [
          {
            sender: rajesh._id,
            text: 'Hello Emily! I would love to propose exchanging a pristine 1948 Gandhi Memorial 10R for your Penny Black 1840. Both are in exceptional condition.'
          },
          {
            sender: emily._id,
            text: 'Hello Rajesh! That is very tempting. Could you share details regarding the gum condition on the Gandhi 10R?'
          }
        ]
      });
      console.log('Created sample trade offer between Rajesh and Emily');
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
