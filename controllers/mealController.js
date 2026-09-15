const Meal = require('../models/Meal');

// @desc    Get all available meals for swap
// @route   GET /api/meals
exports.getMeals = async (req, res) => {
    console.log(`[Meal] GET /api/meals`);
    try {
        const meals = await Meal.find({ isAvailable: true });
        console.log(`[Meal] Found ${meals.length} available meals`);

        res.status(200).json({
            success: true,
            count: meals.length,
            data: meals
        });
    } catch (error) {
        console.error(`[Meal] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
