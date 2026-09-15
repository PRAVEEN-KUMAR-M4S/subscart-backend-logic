const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Meal name is required'],
        trim: true
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
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Meal = mongoose.model('Meal', mealSchema);

module.exports = Meal;
