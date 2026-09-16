const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const mongoose = require('mongoose');

const findOrderItemIndex = (order, itemId) => {
    const requestedId = String(itemId).trim();
    return order.items.findIndex((item) => {
        const ids = [item._id, item.id, item.mealId]
            .filter(Boolean)
            .map((value) => value.toString());
        return ids.includes(requestedId);
    });
};

// @desc    Get orders for subscription — supports single date or date range
// @route   GET /api/subscriptions/:id/orders?date=&startDate=&endDate=
//          If no query params: returns all orders within subscription startDate-endDate
exports.getOrdersForDate = async (req, res) => {
    console.log(`[Order] GET /api/subscriptions/${req.params.id}/orders`, req.query);
    try {
        const { date, startDate, endDate } = req.query;
        const subscriptionId = req.params.id;

        let filter = { subscriptionId };

        if (date) {
            const queryDate = new Date(date);
            const startOfDay = new Date(queryDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(queryDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        } else if (startDate || endDate) {
            let gte = null;
            let lte = null;

            if (startDate) {
                gte = new Date(startDate);
                gte.setHours(0, 0, 0, 0);
            }
            if (endDate) {
                lte = new Date(endDate);
                lte.setHours(23, 59, 59, 999);
            }

            filter.date = {};
            if (gte) filter.date.$gte = gte;
            if (lte) filter.date.$lte = lte;
        } else {
            const subscription = await Subscription.findById(subscriptionId);
            if (subscription && subscription.startDate && subscription.endDate) {
                const rangeStart = new Date(subscription.startDate);
                rangeStart.setHours(0, 0, 0, 0);

                const rangeEnd = new Date(subscription.endDate);
                rangeEnd.setHours(23, 59, 59, 999);

                filter.date = { $gte: rangeStart, $lte: rangeEnd };
            }
        }

        const orders = await Order.find(filter).sort({ date: 1 });
        console.log(`[Order] Found ${orders.length} orders for subscription ${subscriptionId}`);

        res.status(200).json({
            success: true,
            count: orders.length,
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
            description: newMeal.description || ''
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

// @desc    Move order to another date (with optional delivery time slot change)
// @route   PATCH /api/orders/:orderId/move
// @body    { newDate: ISO string, startTime?: string, endTime?: string }
exports.moveOrder = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/move`, req.body);
    try {
        const { newDate, startTime, endTime } = req.body;
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
        const now = new Date();

        // --- Validation 1: Cannot reschedule to past date ---
        const movedDateStart = new Date(movedDate);
        movedDateStart.setHours(0, 0, 0, 0);
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        if (movedDateStart < todayStart) {
            console.log(`[Order] Cannot reschedule to past date: ${newDate}`);
            return res.status(400).json({
                success: false,
                message: 'Cannot reschedule to a past date. Please choose a future date.'
            });
        }

        // --- Validation 2: Must be within subscription startDate and endDate ---
        const subscription = await Subscription.findById(order.subscriptionId);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }

        if (subscription.startDate && subscription.endDate) {
            const subStart = new Date(subscription.startDate);
            subStart.setHours(0, 0, 0, 0);
            const subEnd = new Date(subscription.endDate);
            subEnd.setHours(23, 59, 59, 999);

            if (movedDateStart < subStart || movedDateStart > subEnd) {
                const formatDate = (d) => d.toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });
                console.log(`[Order] Date ${newDate} outside subscription range [${formatDate(subStart)} - ${formatDate(subEnd)}]`);
                return res.status(400).json({
                    success: false,
                    message: `Rescheduled date must be within your subscription dates: ${formatDate(subStart)} to ${formatDate(subEnd)}.`
                });
            }
        }

        // --- Validation 3: If it's today, validate time slot is also in the future ---
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayLabel = days[movedDate.getDay()];

        if (movedDateStart.getTime() === todayStart.getTime()) {
            const effectiveStart = startTime || order.deliverySlot.startTime;
            const slotDateTime = _combineDateAndTime(movedDate, effectiveStart);
            if (slotDateTime <= now) {
                console.log(`[Order] Cannot reschedule to past time slot today: ${effectiveStart}`);
                return res.status(400).json({
                    success: false,
                    message: 'Cannot reschedule to a past time today. Please choose a future time slot.'
                });
            }
        }

        // --- Update order date ---
        order.date = new Date(newDate);
        order.dayLabel = dayLabel;
        order.dateNum = new Date(newDate).getDate();
        order.status = 'moved';

        // --- Optionally update delivery time slot ---
        if (startTime && endTime) {
            const editableUntil = calculateEditableUntil(startTime);
            order.deliverySlot = {
                startTime,
                endTime,
                editableUntil
            };
        }

        await order.save();

        console.log(`[Order] Moved order: ${req.params.orderId} to ${newDate}${startTime ? ` (slot: ${startTime}-${endTime})` : ''}`);

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

        const now = new Date();
        const orderDate = new Date(order.date);
        const orderDateStart = new Date(orderDate);
        orderDateStart.setHours(0, 0, 0, 0);
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // --- Validation 1: Cannot reschedule time if order date is in the past ---
        if (orderDateStart < todayStart) {
            console.log(`[Order] Cannot reschedule time for past date order: ${order.date}`);
            return res.status(400).json({
                success: false,
                message: 'Cannot reschedule time for a past order.'
            });
        }

        // --- Validation 2: If order is today, new time slot must be in the future ---
        if (orderDateStart.getTime() === todayStart.getTime()) {
            const slotDateTime = _combineDateAndTime(orderDate, startTime);
            if (slotDateTime <= now) {
                console.log(`[Order] Cannot reschedule to past time slot today: ${startTime}`);
                return res.status(400).json({
                    success: false,
                    message: 'Cannot reschedule to a past time today. Please choose a future time slot.'
                });
            }
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

// @desc    Skip a specific item in an order (removes it from the order)
// @route   PATCH /api/orders/:orderId/items/:itemId/skip
exports.skipItem = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/items/${req.params.itemId}/skip`);
    try {
        const { orderId, itemId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        console.log(`[skipItem] Looking for item ${itemId} in order ${orderId}`);
        console.log(`[skipItem] Order has ${order.items.length} items`);
        order.items.forEach((item, i) => {
            console.log(`[skipItem]   item[${i}]: _id=${item._id}`);
        });

        const itemIndex = findOrderItemIndex(order, itemId);
        console.log(`[skipItem] itemIndex result: ${itemIndex}`);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Editability is controlled by the Flutter client

        // Remove the item from the order completely
        const skippedItem = order.items[itemIndex];
        order.items.splice(itemIndex, 1);
        
        // If no items left, mark order as skipped
        if (order.items.length === 0) {
            order.status = 'skipped';
        }
        
        await order.save();

        console.log(`[Order] Skipped and removed item ${itemId} (index ${itemIndex}) from order ${orderId}`);

        res.status(200).json({
            success: true,
            message: 'Item skipped and removed',
            data: order,
            skippedItem: skippedItem
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Swap a specific item in an order
// @route   PATCH /api/orders/:orderId/items/:itemId/swap
exports.swapItem = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/items/${req.params.itemId}/swap`, req.body);
    try {
        const { orderId, itemId } = req.params;
        const { newMeal } = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        console.log(`[swapItem] Looking for item ${itemId} in order ${orderId}`);
        console.log(`[swapItem] Order has ${order.items.length} items`);
        order.items.forEach((item, i) => {
            console.log(`[swapItem]   item[${i}]: _id=${item._id}, id=${item.id}`);
        });

        const itemIndex = findOrderItemIndex(order, itemId);
        console.log(`[swapItem] itemIndex result: ${itemIndex}`);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Editability is controlled by the Flutter client — skip backend check for per-item ops

        if (!newMeal || !newMeal.name) {
            return res.status(400).json({
                success: false,
                message: 'New meal data is required'
            });
        }

        // Update the specific item with swapped item data
        const item = order.items[itemIndex];
        item.itemStatus = 'swapped';
        item.name = newMeal.name;
        item.image = newMeal.image || '';
        item.description = newMeal.description || '';
        item.swappedMeal = {
            name: newMeal.name,
            image: newMeal.image || '',
            description: newMeal.description || ''
        };
        await order.save();

        console.log(`[Order] Swapped item ${itemId} (index ${itemIndex}) in order ${orderId} to ${newMeal.name}`);

        res.status(200).json({
            success: true,
            message: 'Item swapped successfully',
            data: order
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a new item to an order
// @route   POST /api/orders/:orderId/items
exports.addItem = async (req, res) => {
    console.log(`[Order] POST /api/orders/${req.params.orderId}/items`, req.body);
    try {
        const { orderId } = req.params;
        const newItem = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Editability is controlled by the Flutter client

        // Validate new item data
        if (!newItem || !newItem.name) {
            return res.status(400).json({
                success: false,
                message: 'Item data is required'
            });
        }

        // Create new item with _id and default status
        const itemToAdd = {
            ...newItem,
            _id: new mongoose.Types.ObjectId(),
            itemStatus: 'scheduled',
            swappedMeal: null,
            movedDate: null
        };

        order.items.push(itemToAdd);
        await order.save();

        console.log(`[Order] Added item to order ${orderId}: ${newItem.name}`);

        res.status(200).json({
            success: true,
            message: 'Item added to order',
            data: order
        });
    } catch (error) {
        console.error(`[Order] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Move a specific item INTO AN EXISTING target order
//          Removes the item from the source order and appends it to targetOrderId.items
// @route   PATCH /api/orders/:orderId/items/:itemId/move
// @body    { targetOrderId: "..." }
exports.moveItem = async (req, res) => {
    console.log(`[Order] PATCH /api/orders/${req.params.orderId}/items/${req.params.itemId}/move`, req.body);
    try {
        const { orderId, itemId } = req.params;
        const { targetOrderId } = req.body;
        let sourceOrder = await Order.findById(orderId);

        if (!sourceOrder) {
            return res.status(404).json({
                success: false,
                message: 'Source order not found'
            });
        }

        if (!targetOrderId) {
            return res.status(400).json({
                success: false,
                message: 'targetOrderId is required'
            });
        }

        if (targetOrderId.toString() === orderId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot move an item into the same order'
            });
        }

        // Find the item by _id
        console.log(`[moveItem] Looking for item ${itemId} in order ${orderId}`);
        console.log(`[moveItem] Order has ${sourceOrder.items.length} items`);
        sourceOrder.items.forEach((item, i) => {
            console.log(`[moveItem]   item[${i}]: _id=${item._id}`);
        });

        const itemIndex = findOrderItemIndex(sourceOrder, itemId);
        console.log(`[moveItem] itemIndex result: ${itemIndex}`);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Editability is controlled by the Flutter client

        let targetOrder = await Order.findById(targetOrderId);
        if (!targetOrder) {
            return res.status(404).json({
                success: false,
                message: 'Target order not found'
            });
        }

        if (targetOrder.subscriptionId.toString() !== sourceOrder.subscriptionId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Target order must belong to the same subscription'
            });
        }

        // Extract + REMOVE the item from the source items array
        const [sourceItem] = sourceOrder.items.splice(itemIndex, 1);

        // Append the item (fresh subdocument, new _id) to the target order
        const newItem = {
            name: sourceItem.name,
            image: sourceItem.image,
            description: sourceItem.description || '',
            quantity: sourceItem.quantity || 1,
            itemStatus: 'scheduled',
            movedFromOrderId: sourceOrder._id
        };
        targetOrder.items.push(newItem);

        sourceOrder = await sourceOrder.save();
        targetOrder = await targetOrder.save();

        console.log(`[Order] Moved item ${itemId} REMOVED from order ${orderId} (items now: ${sourceOrder.items.length}) and ADDED to target order ${targetOrderId} (items now: ${targetOrder.items.length})`);

        res.status(200).json({
            success: true,
            message: 'Item moved successfully',
            data: {
                sourceOrder,
                targetOrder
            }
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

// Helper: Combine a Date object (date part) with a time string (e.g. "8:17 am")
// Returns a Date object with both date and time set
function _combineDateAndTime(date, timeStr) {
    const result = new Date(date);
    try {
        const parts = (timeStr || '').trim().split(/\s+/);
        if (parts.length < 2) return result;
        const [time, period] = parts;
        let [hours, minutes] = time.split(':').map(Number);
        hours = hours || 0;
        minutes = minutes || 0;
        if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
        if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
        result.setHours(hours, minutes, 0, 0);
    } catch (_) {
        // keep default if parse fails
    }
    return result;
}
