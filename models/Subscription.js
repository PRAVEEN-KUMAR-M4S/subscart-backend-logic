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
    },
    startDate: {
        type: Date,
        required: [true, 'Subscription start date is required'],
        default: function() {
            return this.createdAt || Date.now();
        }
    },
    endDate: {
        type: Date,
        required: [true, 'Subscription end date is required']
    }
}, {
    timestamps: true
});

subscriptionSchema.pre('save', async function() {
    if (!this.startDate) {
        this.startDate = this.createdAt || new Date();
    }
    if (!this.endDate && this.startDate && this.planDurationWeeks) {
        const end = new Date(this.startDate);
        end.setDate(end.getDate() + (this.planDurationWeeks * 7));
        this.endDate = end;
    }
});

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
