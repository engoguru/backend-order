import express from 'express';
import { createCoupon, getAllCoupons, updateCoupon } from '../controllers/couponController.js';
import { authenticate, requireRole } from '../middleware/authentication.js';
const couponRoute=express.Router()

couponRoute.post('/createCoupon', authenticate, requireRole("Admin","User"), createCoupon);
couponRoute.get('/getCoupon', authenticate, requireRole("Admin","User"), getAllCoupons);

couponRoute.post('/updateCoupon/:couponId',authenticate,updateCoupon);

export default couponRoute  