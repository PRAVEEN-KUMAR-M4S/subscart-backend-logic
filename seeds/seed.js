require('dotenv').config();
const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Meal = require('../models/Meal');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Subscription.deleteMany({});
        await Order.deleteMany({});
        await Meal.deleteMany({});
        console.log('Cleared existing data');

        // Create subscription matching screenshot
        const subscription = await Subscription.create({
            userId: new mongoose.Types.ObjectId(),
            planName: 'Healthy Lab',
            mealsPerWeek: 5,
            planDurationWeeks: 6,
            scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            status: 'active'
        });
        console.log('Created subscription:', subscription._id);

        // Create 25 diverse meals for swap functionality
        const meals = await Meal.insertMany([
            // Salads
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

            // Bowls
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

            // Wraps & Sandwiches
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

            // Soups
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

            // Proteins
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

            // Vegetarian
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

            // Smoothie Bowls
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

        // Get current week's dates
        const today = new Date();
        
        // Calculate dates for this week
        const dates = [];
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Find this week's Monday
        let monday = new Date(today);
        while (monday.getDay() !== 1) {
            monday.setDate(monday.getDate() + 1);
        }
        monday.setHours(8, 0, 0, 0);

        // Create 5 orders for Mon-Fri with multiple meals each
        const mealsPerOrder = 3; // Number of meals per order
        for (let i = 0; i < 5; i++) {
            const orderDate = new Date(monday);
            orderDate.setDate(monday.getDate() + i);
            
            // Select multiple meals for this order (rotate through meal list)
            const orderMeals = [];
            const primaryMeal = meals[i % meals.length]; // Primary meal for the order
            
            for (let j = 0; j < mealsPerOrder; j++) {
                const mealIndex = (i * mealsPerOrder + j) % meals.length;
                const meal = meals[mealIndex];
                orderMeals.push({
                    _id: new mongoose.Types.ObjectId(), // Unique ID for each item
                    ...meal.toObject(),
                    quantity: 1,
                    itemStatus: 'scheduled' // Per-item status
                });
            }
            
            await Order.create({
                subscriptionId: subscription._id,
                date: orderDate,
                dayLabel: dayLabels[orderDate.getDay()],
                dateNum: orderDate.getDate(),
                status: 'scheduled',
                address: '123 Test Street, City',
                deliverySlot: {
                    startTime: '8:17 am',
                    endTime: '9:17 am',
                    editableUntil: '7:17 am'
                },
                meal: primaryMeal.toObject(), // Primary meal for backward compatibility
                items: orderMeals // Multiple items per order
            });
        }

        console.log('Created 5 orders for Mon-Fri');
        console.log('\n=== Seed Complete ===');
        console.log('Subscription ID:', subscription._id);
        console.log('Total Meals:', meals.length);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
