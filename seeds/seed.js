require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Meal = require('../models/Meal');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Subscription.deleteMany({});
        await Order.deleteMany({});
        await Meal.deleteMany({});
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

        const meals = await Meal.insertMany([
            {
                name: 'Pumpkin Feta Quinoa Salad',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
                calories: 354,
                fat: 12,
                protein: 11,
                carbs: 50
            },
            {
                name: 'Mediterranean Chickpea Bowl',
                image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
                calories: 380,
                fat: 14,
                protein: 15,
                carbs: 52
            },
            {
                name: 'Avocado Garden Salad',
                image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
                calories: 298,
                fat: 9,
                protein: 8,
                carbs: 24
            },
            {
                name: 'Grilled Chicken Caesar Salad',
                image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200',
                calories: 420,
                fat: 18,
                protein: 32,
                carbs: 28
            },
            {
                name: 'Thai Peanut Noodle Salad',
                image: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8e6?w=200',
                calories: 445,
                fat: 20,
                protein: 14,
                carbs: 55
            },
            {
                name: 'Teriyaki Chicken Bowl',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                calories: 512,
                fat: 14,
                protein: 38,
                carbs: 52
            },
            {
                name: 'Grilled Salmon & Greens',
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200',
                calories: 467,
                fat: 22,
                protein: 41,
                carbs: 18
            },
            {
                name: 'Buddha Bowl',
                image: 'https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=200',
                calories: 410,
                fat: 16,
                protein: 18,
                carbs: 48
            },
            {
                name: 'Korean Bibimbap Bowl',
                image: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=200',
                calories: 520,
                fat: 18,
                protein: 28,
                carbs: 62
            },
            {
                name: 'Spicy Tuna Poke Bowl',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
                calories: 385,
                fat: 12,
                protein: 32,
                carbs: 42
            },
            {
                name: 'Grilled Chicken Caesar Wrap',
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200',
                calories: 420,
                fat: 18,
                protein: 32,
                carbs: 38
            },
            {
                name: 'Avocado Toast with Poached Egg',
                image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200',
                calories: 310,
                fat: 16,
                protein: 12,
                carbs: 32
            },
            {
                name: 'Turkey & Hummus Wrap',
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200',
                calories: 380,
                fat: 14,
                protein: 24,
                carbs: 42
            },
            {
                name: 'Veggie Mediterranean Wrap',
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200',
                calories: 340,
                fat: 12,
                protein: 10,
                carbs: 48
            },
            {
                name: 'Spiced Lentil Soup',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200',
                calories: 356,
                fat: 7,
                protein: 21,
                carbs: 47
            },
            {
                name: 'Tomato Basil Soup',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200',
                calories: 220,
                fat: 8,
                protein: 6,
                carbs: 32
            },
            {
                name: 'Thai Coconut Soup',
                image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200',
                calories: 280,
                fat: 14,
                protein: 12,
                carbs: 28
            },
            {
                name: 'Grilled Steak with Vegetables',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
                calories: 580,
                fat: 28,
                protein: 48,
                carbs: 22
            },
            {
                name: 'Herb Crusted Lamb Chops',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
                calories: 520,
                fat: 24,
                protein: 42,
                carbs: 18
            },
            {
                name: 'Pan Seared Cod with Lemon',
                image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200',
                calories: 320,
                fat: 10,
                protein: 38,
                carbs: 8
            },
            {
                name: 'Stuffed Bell Peppers',
                image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200',
                calories: 340,
                fat: 12,
                protein: 16,
                carbs: 42
            },
            {
                name: 'Eggplant Parmesan',
                image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200',
                calories: 420,
                fat: 18,
                protein: 22,
                carbs: 48
            },
            {
                name: 'Mushroom Risotto',
                image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200',
                calories: 450,
                fat: 16,
                protein: 14,
                carbs: 62
            },
            {
                name: 'Acai Berry Smoothie Bowl',
                image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200',
                calories: 320,
                fat: 10,
                protein: 8,
                carbs: 52
            },
            {
                name: 'Green Detox Smoothie Bowl',
                image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200',
                calories: 280,
                fat: 6,
                protein: 10,
                carbs: 48
            }
        ]);
        console.log('Created', meals.length, 'meals');

        const mealsPerOrder = 3;
        const orderStatuses = ['scheduled', 'scheduled', 'scheduled', 'scheduled', 'skipped', 'swapped', 'moved'];
        const allOrders = [];

        for (let week = 0; week < planDurationWeeks; week++) {
            for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
                const orderDate = new Date(startOfWeek);
                orderDate.setDate(startOfWeek.getDate() + (week * 7) + dayOffset);
                orderDate.setHours(8, 0, 0, 0);

                const globalIdx = week * 5 + dayOffset;
                const primaryMeal = meals[globalIdx % meals.length];
                const orderMeals = [];

                for (let j = 0; j < mealsPerOrder; j++) {
                    const mealIndex = (globalIdx * mealsPerOrder + j) % meals.length;
                    const meal = meals[mealIndex];
                    orderMeals.push({
                        _id: new mongoose.Types.ObjectId(),
                        ...meal.toObject(),
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
                    meal: primaryMeal.toObject(),
                    items: orderMeals
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
        console.log('Total Meals:', meals.length);
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
