const Subscription = require('../models/Subscription');
const Order = require('../models/Order');

// @desc    Get all subscriptions for the user
// @route   GET /api/subscriptions
exports.getAllSubscriptions = async (req, res) => {
    console.log(`[Subscription] GET /api/subscriptions`);
    try {
        const subscriptions = await Subscription.find().sort({ createdAt: -1 });
        console.log(`[Subscription] Found ${subscriptions.length} subscriptions`);

        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } catch (error) {
        console.error(`[Subscription] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get subscription with schedule
// @route   GET /api/subscriptions/:id
exports.getSubscription = async (req, res) => {
    console.log(`[Subscription] GET /api/subscriptions/${req.params.id}`);
    try {
        const subscription = await Subscription.findById(req.params.id);
        console.log(`[Subscription] Found subscription:`, subscription ? subscription._id : 'NOT FOUND');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Get upcoming orders for this subscription
        const orders = await Order.find({
            subscriptionId: subscription._id,
            date: { $gte: new Date() }
        }).sort({ date: 1 });

        console.log(`[Subscription] Found ${orders.length} orders`);
        console.log(`[Subscription] Response data:`, JSON.stringify({ subscription, ordersCount: orders.length }, null, 2));

        res.status(200).json({
            success: true,
            data: {
                subscription,
                orders
            }
        });
    } catch (error) {
        console.error(`[Subscription] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle pause/resume subscription
// @route   POST /api/subscriptions/:id/pause
exports.togglePause = async (req, res) => {
    console.log(`[Subscription] POST /api/subscriptions/${req.params.id}/pause`);
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            console.log(`[Subscription] Not found for pause toggle`);
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Toggle status
        subscription.status = subscription.status === 'active' ? 'paused' : 'active';
        await subscription.save();

        console.log(`[Subscription] Toggled pause: now ${subscription.status}`);

        res.status(200).json({
            success: true,
            message: `Subscription ${subscription.status === 'paused' ? 'paused' : 'resumed'}`,
            data: subscription
        });
    } catch (error) {
        console.error(`[Subscription] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add new delivery slot/date to subscription
// @route   POST /api/subscriptions/:id/slots
exports.addSlot = async (req, res) => {
    console.log(`[Subscription] POST /api/subscriptions/${req.params.id}/slots`, req.body);
    try {
        const { day, startTime, endTime, editableUntil } = req.body;

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        // Validate day is one of valid days
        const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        if (!validDays.includes(day)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid day. Must be Mon-Sun'
            });
        }

        // Add day to schedule if not already there
        if (!subscription.scheduleDays.includes(day)) {
            subscription.scheduleDays.push(day);
            await subscription.save();
        }

        // Calculate the next occurrence of this day
        const nextDate = getNextDayOfWeek(new Date(), day);

        // Create order for this slot
        const order = await Order.create({
            subscriptionId: subscription._id,
            date: nextDate,
            dayLabel: day,
            dateNum: nextDate.getDate(),
            status: 'scheduled',
            deliverySlot: {
                startTime: startTime || '8:00 am',
                endTime: endTime || '9:00 am',
                editableUntil: editableUntil || '7:00 am'
            },
            meal: {
                name: 'Default Meal',
                calories: 0,
                fat: 0,
                protein: 0,
                carbs: 0
            }
        });

        console.log(`[Subscription] Added slot for ${day}, order created:`, order._id);

        res.status(201).json({
            success: true,
            message: 'Slot added successfully',
            data: {
                subscription,
                order
            }
        });
    } catch (error) {
        console.error(`[Subscription] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper: Get next occurrence of a specific day of week
function getNextDayOfWeek(date, dayOfWeek) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayIndex = days.indexOf(dayOfWeek);
    const resultDate = new Date(date);

    while (resultDate.getDay() !== dayIndex) {
        resultDate.setDate(resultDate.getDate() + 1);
    }

    return resultDate;
}
