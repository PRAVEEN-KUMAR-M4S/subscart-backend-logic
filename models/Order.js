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
            default: 1
        }
    }]
}, {
    timestamps: true
});

// Index for quick date queries
orderSchema.index({ subscriptionId: 1, date: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
