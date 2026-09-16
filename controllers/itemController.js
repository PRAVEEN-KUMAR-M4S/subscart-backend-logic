const Item = require('../models/Item');

// @desc    Get all available items for swap
// @route   GET /api/items
exports.getItems = async (req, res) => {
    console.log(`[Item] GET /api/items`);
    try {
        const items = await Item.find({ isAvailable: true });
        console.log(`[Item] Found ${items.length} available items`);

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        console.error(`[Item] Error:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
