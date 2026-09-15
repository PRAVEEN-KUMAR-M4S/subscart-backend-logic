const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    planName: {
        type: String,
        required: [true, 'Plan name is required'],
        trim: true
    },
    mealsPerWeek: {
        type: Number,
        required: [true, 'Meals per week is required'],
        min: [1, 'Must have at least 1 meal per week']
    },
    planDurationWeeks: {
        type: Number,
        required: [true, 'Plan duration is required'],
        min: [1, 'Duration must be at least 1 week']
    },
    scheduleDays: [{
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }],
    status: {
        type: String,
        enum: ['active', 'paused'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Virtual for subscription end date
subscriptionSchema.virtual('endDate').get(function() {
    const start = this.createdAt || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + (this.planDurationWeeks * 7));
    return end;
});

// Include virtuals in JSON
subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
