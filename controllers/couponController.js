import Coupon from '../models/couponModel.js';

// Create Coupon (Admin only)
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minCartValue, expiryDate, allowedUsers } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minCartValue,
      expiryDate,
      allowedUsers: allowedUsers || [],
    });

    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get All Coupons (Admin)
export const getAllCoupons = async (req, res) => {
  try {
    // Get query params, with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Get total count
    const totalCoupons = await Coupon.countDocuments();

    // Fetch paginated coupons
    const coupons = await Coupon.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Optional: sort by most recent

    res.status(200).json({
      success: true,
      data: coupons,
      pagination: {
        total: totalCoupons,
        page,
        limit,
        totalPages: Math.ceil(totalCoupons / limit),
        hasNextPage: page * limit < totalCoupons,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get Single Coupon
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Coupon
export const updateCoupon = async (req, res) => {
  try {



    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.couponId,
      {
        $pull: { allowedUsers: req.user.id },
        $push: { usedBy: req.user.id }
      },
      { new: true }
    );
    console.log('Updated coupon:', updatedCoupon);
    return res.status(200).json({
      message: "update Coupon Successfully !"
    })

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Coupon
export const deleteCoupon = async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Coupon not found" });

    res.status(200).json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
