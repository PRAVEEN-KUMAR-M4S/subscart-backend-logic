const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subscription'
    },
    date: {
        type: Date,
        required: [true, 'Order date is required']
    },
    dayLabel: {
        type: String,
        required: [true, 'Day label is required'],
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    dateNum: {
        type: Number,
        required: [true, 'Date number is required']
    },
    status: {
        type: String,
        enum: ['scheduled', 'skipped', 'swapped', 'moved'],
        default: 'scheduled'
    },
    address: {
        type: String,
        default: ''
    },
    deliverySlot: {
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        editableUntil: {
            type: String,
            required: true
        }
    },
    // Primary meal (for backward compatibility)
    meal: {
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ''
        },
        calories: {
            type: Number,
            default: 0
        },
        fat: {
            type: Number,
            default: 0
        },
        protein: {
            type: Number,
            default: 0
        },
        carbs: {
            type: Number,
            default: 0
        }
    },
    // Multiple items in this order
    items: [{
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ''
        },
        calories: {
            type: Number,
            default: 0
        },
        fat: {
            type: Number,
            default: 0
        },
        protein: {
            type: Number,
            default: 0
        },
        carbs: {
            type: Number,
            default: 0
        },
        quantity: {
            type: Number,
            default: 1,
            min: [1, 'Quantity must be at least 1']
        },
        // Per-item status (independent of order status)
        itemStatus: {
            type: String,
            enum: ['scheduled', 'skipped', 'swapped', 'moved'],
            default: 'scheduled'
        },
        // If swapped, the new meal data
        swappedMeal: {
            name: String,
            image: String,
            calories: Number,
            fat: Number,
            protein: Number,
            carbs: Number
        },
        // If moved, the target date and destination order
        movedDate: Date,
        movedToOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        },
        // If received via a move, the source order it came from
        movedFromOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    }]
}, {
    timestamps: true
});

// Index for quick date queries
orderSchema.index({ subscriptionId: 1, date: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
