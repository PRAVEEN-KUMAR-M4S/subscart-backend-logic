const Order = require('../models/Order');

// @desc    Get order for specific date
// @route   GET /api/subscriptions/:id/orders?date=
exports.getOrdersForDate = async (req, res) => {
    console.log(`[Order] GET /api/subscriptions/${req.params.id}/orders`, req.query);
    try {
        const { date } = req.query;
        const subscriptionId = req.params.id;

        let filter = { subscriptionId };

        if (date) {
            const queryDate = new Date(date);
            const startOfDay = new Date(queryDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(queryDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const orders = await Order.find(filter).sort({ date: 1 });
        console.log(`[Order] Found ${orders.length} orders for subscription ${subscriptionId}`);

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Skip an order
// @route   PATCH /api/orders/:orderId/skip
exports.skipOrder = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/skip`);
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            console.log(`[Order] Order not found: ${req.params.orderId}`);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is editable
        if (!isEditable(order)) {
            console.log(`[Order] Order ${req.params.orderId} is not editable`);
            return res.status(400).json({
                success: false,
                message: 'Order is no longer editable. Edit window has passed.'
            });
        }

        order.status = 'skipped';
        await order.save();

        console.log(`[Order] Skipped order: ${req.params.orderId}`);

        res.status(200).json({
            success: true,
            message: 'Order skipped',
            data: order
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Swap meal in an order
// @route   PATCH /api/orders/:orderId/swap
exports.swapMeal = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/swap`, req.body);
    try {
        const { newMeal } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            console.log(`[Order] Order not found: ${req.params.orderId}`);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is editable
        if (!isEditable(order)) {
            console.log(`[Order] Order ${req.params.orderId} is not editable`);
            return res.status(400).json({
                success: false,
                message: 'Order is no longer editable. Edit window has passed.'
            });
        }

        // Validate new meal data
        if (!newMeal || !newMeal.name) {
            return res.status(400).json({
                success: false,
                message: 'New meal data is required'
            });
        }

        // Update meal
        order.meal = {
            name: newMeal.name,
            image: newMeal.image || '',
            calories: newMeal.calories || 0,
            fat: newMeal.fat || 0,
            protein: newMeal.protein || 0,
            carbs: newMeal.carbs || 0
        };
        order.status = 'swapped';
        await order.save();

        console.log(`[Order] Swapped meal in order: ${req.params.orderId} to ${newMeal.name}`);

        res.status(200).json({
            success: true,
            message: 'Meal swapped successfully',
            data: order
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Move order to another date
// @route   PATCH /api/orders/:orderId/move
exports.moveOrder = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/move`, req.body);
    try {
        const { newDate } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            console.log(`[Order] Order not found: ${req.params.orderId}`);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is editable
        if (!isEditable(order)) {
            console.log(`[Order] Order ${req.params.orderId} is not editable`);
            return res.status(400).json({
                success: false,
                message: 'Order is no longer editable. Edit window has passed.'
            });
        }

        if (!newDate) {
            return res.status(400).json({
                success: false,
                message: 'New date is required'
            });
        }

        const movedDate = new Date(newDate);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Check if a slot exists for this day
        const dayLabel = days[movedDate.getDay()];
        const existingOrder = await Order.findOne({
            subscriptionId: order.subscriptionId,
            date: {
                $gte: new Date(movedDate.setHours(0, 0, 0, 0)),
                $lte: new Date(movedDate.setHours(23, 59, 59, 999))
            },
            _id: { $ne: order._id }
        });

        if (existingOrder) {
            console.log(`[Order] An order already exists for date ${newDate}`);
            return res.status(400).json({
                success: false,
                message: 'An order already exists for this date'
            });
        }

        // Update order date
        order.date = new Date(newDate);
        order.dayLabel = dayLabel;
        order.dateNum = new Date(newDate).getDate();
        order.status = 'moved';
        await order.save();

        console.log(`[Order] Moved order: ${req.params.orderId} to ${newDate}`);

        res.status(200).json({
            success: true,
            message: 'Order moved successfully',
            data: order
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reschedule delivery slot time
// @route   PATCH /api/orders/:orderId/reschedule
exports.rescheduleOrder = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/reschedule`, req.body);
    try {
        const { startTime, endTime } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            console.log(`[Order] Order not found: ${req.params.orderId}`);
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is editable
        if (!isEditable(order)) {
            console.log(`[Order] Order ${req.params.orderId} is not editable`);
            return res.status(400).json({
                success: false,
                message: 'Order is no longer editable. Edit window has passed.'
            });
        }

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'Start time and end time are required'
            });
        }

        // Calculate editableUntil (typically 1 hour before start)
        const editableUntil = calculateEditableUntil(startTime);

        order.deliverySlot = {
            startTime,
            endTime,
            editableUntil
        };
        await order.save();

        console.log(`[Order] Rescheduled order: ${req.params.orderId} to ${startTime} - ${endTime}`);

        res.status(200).json({
            success: true,
            message: 'Order rescheduled successfully',
            data: order
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper: Check if order is within edit window
function isEditable(order) {
    const now = new Date();
    const orderDate = new Date(order.date);

    // Parse editableUntil time (e.g., "7:17 am")
    const editableTimeStr = order.deliverySlot.editableUntil;
    const [time, period] = editableTimeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    // Set editableUntil on order date
    const editableUntil = new Date(orderDate);
    editableUntil.setHours(hours, minutes, 0, 0);

    return now < editableUntil;
}

// Helper: Calculate editableUntil from start time
function calculateEditableUntil(startTime) {
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    // Set editableUntil to 1 hour before start
    hours -= 1;
    if (hours < 0) hours = 23;

    const newPeriod = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${newPeriod}`;
}
