require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Item = require('../models/Item');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Subscription.deleteMany({});
        await Order.deleteMany({});
        await Item.deleteMany({});
        console.log('Cleared existing data');

        const today = new Date();
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        let startOfWeek = new Date(today);
        while (startOfWeek.getDay() !== 1) {
            startOfWeek.setDate(startOfWeek.getDate() + 1);
        }
        startOfWeek.setHours(0, 0, 0, 0);

        const planDurationWeeks = 6;
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + (planDurationWeeks * 7) - 1);
        endOfWeek.setHours(23, 59, 59, 999);

        const subscription = await Subscription.create({
            userId: new mongoose.Types.ObjectId(),
            planName: 'Healthy Lab',
            mealsPerWeek: 5,
            planDurationWeeks: planDurationWeeks,
            scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            status: 'active',
            startDate: new Date(startOfWeek),
            endDate: new Date(endOfWeek)
        });
        console.log('Created subscription:', subscription._id);
        console.log('  startDate:', subscription.startDate.toISOString().split('T')[0]);
        console.log('  endDate:  ', subscription.endDate.toISOString().split('T')[0]);

        const items = await Item.insertMany([
            {
                name: 'Pumpkin Feta Quinoa Salad',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
                description: '354 Calories, 12g fat, 11g protein, 50g carbohydrates'
            },
            {
                name: 'Mediterranean Chickpea Bowl',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
                description: '380 Calories, 14g fat, 15g protein, 52g carbohydrates'
            },
            {
                name: 'Avocado Garden Salad',
                image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
                description: '298 Calories, 9g fat, 8g protein, 24g carbohydrates'
            },
            {
                name: 'Grilled Chicken Caesar Salad',
                image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200',
                description: '420 Calories, 18g fat, 32g protein, 28g carbohydrates'
            },
            {
                name: 'Thai Peanut Noodle Salad',
                image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=200',
                description: '445 Calories, 20g fat, 14g protein, 55g carbohydrates'
            },
            {
                name: 'Teriyaki Chicken Bowl',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                description: '512 Calories, 14g fat, 38g protein, 52g carbohydrates'
            },
            {
                name: 'Grilled Salmon & Greens',
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200',
                description: '467 Calories, 22g fat, 41g protein, 18g carbohydrates'
            },
            {
                name: 'Buddha Bowl',
                image: 'https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=200',
                description: '410 Calories, 16g fat, 18g protein, 48g carbohydrates'
            },
            {
                name: 'Korean Bibimbap Bowl',
                image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=200',
                description: '520 Calories, 18g fat, 28g protein, 62g carbohydrates'
            },
            {
                name: 'Spicy Tuna Poke Bowl',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                description: '385 Calories, 12g fat, 32g protein, 42g carbohydrates'
            },
            {
                name: 'Grilled Chicken Caesar Wrap',
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200',
                description: '420 Calories, 18g fat, 32g protein, 38g carbohydrates'
            },
            {
                name: 'Avocado Toast with Poached Egg',
                image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200',
                description: '310 Calories, 16g fat, 12g protein, 32g carbohydrates'
            },
            {
                name: 'Turkey & Hummus Wrap',
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200',
                description: '380 Calories, 14g fat, 24g protein, 42g carbohydrates'
            },
            {
                name: 'Veggie Mediterranean Wrap',
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200',
                description: '340 Calories, 12g fat, 10g protein, 48g carbohydrates'
            },
            {
                name: 'Spiced Lentil Soup',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200',
                description: '356 Calories, 7g fat, 21g protein, 47g carbohydrates'
            },
            {
                name: 'Tomato Basil Soup',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200',
                description: '220 Calories, 8g fat, 6g protein, 32g carbohydrates'
            },
            {
                name: 'Thai Coconut Soup',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200',
                description: '280 Calories, 14g fat, 12g protein, 28g carbohydrates'
            },
            {
                name: 'Grilled Steak with Vegetables',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
                description: '580 Calories, 28g fat, 48g protein, 22g carbohydrates'
            },
            {
                name: 'Herb Crusted Lamb Chops',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
                description: '520 Calories, 24g fat, 42g protein, 18g carbohydrates'
            },
            {
                name: 'Pan Seared Cod with Lemon',
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200',
                description: '320 Calories, 10g fat, 38g protein, 8g carbohydrates'
            },
            {
                name: 'Stuffed Bell Peppers',
                image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200',
                description: '340 Calories, 12g fat, 16g protein, 42g carbohydrates'
            },
            {
                name: 'Eggplant Parmesan',
                image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200',
                description: '420 Calories, 18g fat, 22g protein, 48g carbohydrates'
            },
            {
                name: 'Mushroom Risotto',
                image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200',
                description: '450 Calories, 16g fat, 14g protein, 62g carbohydrates'
            },
            {
                name: 'Acai Berry Smoothie Bowl',
                image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200',
                description: '320 Calories, 10g fat, 8g protein, 52g carbohydrates'
            },
            {
                name: 'Green Detox Smoothie Bowl',
                image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200',
                description: '280 Calories, 6g fat, 10g protein, 48g carbohydrates'
            }
        ]);
        console.log('Created', items.length, 'items');

        const itemsPerOrder = 3;
        const orderStatuses = ['scheduled', 'scheduled', 'scheduled', 'scheduled', 'skipped', 'swapped', 'moved'];
        const allOrders = [];

        for (let week = 0; week < planDurationWeeks; week++) {
            for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
                const orderDate = new Date(startOfWeek);
                orderDate.setDate(startOfWeek.getDate() + (week * 7) + dayOffset);
                orderDate.setHours(8, 0, 0, 0);

                const globalIdx = week * 5 + dayOffset;
                const primaryItem = items[globalIdx % items.length];
                const orderItems = [];

                for (let j = 0; j < itemsPerOrder; j++) {
                    const itemIndex = (globalIdx * itemsPerOrder + j) % items.length;
                    const item = items[itemIndex];
                    orderItems.push({
                        ...item.toObject(),
                        _id: new mongoose.Types.ObjectId(),
                        quantity: 1,
                        itemStatus: 'scheduled'
                    });
                }

                const orderData = {
                    subscriptionId: subscription._id,
                    date: orderDate,
                    dayLabel: dayLabels[orderDate.getDay()],
                    dateNum: orderDate.getDate(),
                    status: orderStatuses[globalIdx % orderStatuses.length],
                    address: '123 Test Street, City',
                    deliverySlot: {
                        startTime: '8:17 am',
                        endTime: '9:17 am',
                        editableUntil: '7:17 am'
                    },
                    meal: primaryItem.toObject(),
                    items: orderItems
                };

                allOrders.push(orderData);
            }
        }

        const insertedOrders = await Order.insertMany(allOrders);
        console.log(`Created ${insertedOrders.length} orders for full ${planDurationWeeks}-week timeline`);
        console.log(`  Week 1: ${dayLabels[allOrders[0].date.getDay()]} ${allOrders[0].date.getDate()} — ${dayLabels[allOrders[4].date.getDay()]} ${allOrders[4].date.getDate()}`);
        console.log(`  Week 6: ${dayLabels[allOrders[25].date.getDay()]} ${allOrders[25].date.getDate()} — ${dayLabels[allOrders[29].date.getDay()]} ${allOrders[29].date.getDate()}`);

        console.log('\n=== Seed Complete ===');
        console.log('Subscription ID:', subscription._id);
        console.log('Subscription:', subscription.planName);
        console.log('  startDate:', subscription.startDate.toISOString().split('T')[0]);
        console.log('  endDate:  ', subscription.endDate.toISOString().split('T')[0]);
        console.log('  duration: ', subscription.planDurationWeeks, 'weeks');
        console.log('  scheduleDays:', subscription.scheduleDays.join(', '));
        console.log('Total Items:', items.length);
        console.log('Total Orders:', insertedOrders.length);
        console.log('\nAPI routes:');
        console.log('  GET /api/subscriptions/:id                — subscription + all orders in date range');
        console.log('  GET /api/subscriptions/:id/orders         — all orders within subscription date range');
        console.log('  GET /api/subscriptions/:id/orders?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD — custom range');
        console.log('  GET /api/subscriptions/:id/orders?date=YYYY-MM-DD — single day');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
