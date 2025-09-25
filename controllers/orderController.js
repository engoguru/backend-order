import { isValidObjectId } from "mongoose";
import { orderValidationSchema } from "../middleware/orderValidation.js";
import orderModel from "../models/orderModel.js";
import axios from "axios";
import mongoose from "mongoose";
const orderUpdateValidationSchema = orderValidationSchema.fork(
    Object.keys(orderValidationSchema.describe().keys),
    (schema) => schema.optional()
);

const updateStock_ProductService=async(items)=>{
    console.log("pro",items)
 await axios.post('http://localhost:5000/api/products/productList/updateStock', { items });

}
const sendNotification=async()=>{
    await axios.post()
}

const create = async (req, res) => {
    try {
        console.log("order",req.body)
        const { error } = orderValidationSchema.validate(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }
        const data = new orderModel({
            ...req.body
        })
        await data.save()
        console.log(req.body.items)
        await updateStock_ProductService(req.body.items)
        // await sendNotification(req.body.userId)
        res.status(200).json({
            message: "Order created successfully",
            data: data
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
const getOne = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json("Invalid id");
        }
        const data = await orderModel.findById(req.params.id)

        if (!data) {
            return res.status(404).json({
                message: "Not found !"
            })
        }
        return res.status(200).json({
            message: "Order found",
            data: data
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const GetAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
        const sortBy = req.query.sort || 'latest';
        const searchTerm = req.query.search || '';
        const skip = (page - 1) * itemsPerPage;

        const query = {};
        if (searchTerm) {
            query.$or = [
                { productOrderId: { $regex: searchTerm, $options: 'i' } },
                { paymentId: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Use an aggregation pipeline for consistent item-centric data
        const aggregation = [];

        // Stage 1: Initial match for search terms
        if (Object.keys(query).length > 0) {
            aggregation.push({ $match: query });
        }

        // Stage 2: Always unwind to create an item-centric view
        aggregation.push({ $unwind: '$items' });

        // Stage 3: Add a sort stage based on the sortBy parameter
        let sortStage = {};
        if (sortBy === 'price-asc') {
            sortStage = { 'items.price': 1 };
        } else if (sortBy === 'price-desc') {
            sortStage = { 'items.price': -1 };
        } else if (sortBy === 'oldest') {
            sortStage = { createdAt: 1 };
        } else { // 'latest' or default
            sortStage = { createdAt: -1 };
        }
        aggregation.push({ $sort: sortStage });

        // After sorting, add a field to make the item data consistent for the frontend
        // The frontend expects `items` to be an array.
        aggregation.push({
            $addFields: { "items": ["$items"] }
        });

        // Stage 4: Use $facet to get both paginated data and total count
        aggregation.push({
            $facet: {
                data: [{ $skip: skip }, { $limit: itemsPerPage }],
                totalCount: [{ $count: 'count' }]
            }
        });

        const result = await orderModel.aggregate(aggregation);

        // Extract data and totalCount from the aggregation result
        const data = result[0].data;
        const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        res.status(200).json({
            message: "Order found",
            data,
            totalCount,
            totalPages,
            itemsPerPage,
            page
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

const update = async (req, res) => {
    try {

        const { error } = orderUpdateValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json(error.details[0].message);
        }

        const id = req.params.id;
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid Id" })
        }

        const data = await orderModel.findByIdAndUpdate(id, req.body, { new: true })
        if (!data) {
            return res.status(404).json({ message: "Not found !" })
        }
        return res.status(200).json({ message: "Order updated", data: data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

// const getUserSpecific = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Validate MongoDB ObjectId
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "Invalid user ID" });
//         }

//         const data = await orderModel.find({ userId: id });

//         // If no data found, send empty array (not an error)
//         if (!data || data.length === 0) {
//             return res.status(200).json([]);
//         }

//         // Return the found data
//         return res.status(200).json({
//             message:"Data get successfully !",
//             data
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };








const getUserSpecific = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // Step 1: Fetch orders
        const orders = await orderModel.find({ userId: id });

        if (!orders || orders.length === 0) {
            return res.status(200).json({ message: "No orders found", data: [] });
        }

        // Step 2: Extract all unique productIds from items[]
        const productIdSet = new Set();

        orders.forEach(order => {
            order.items?.forEach(item => {
                if (item.productId) {
                    productIdSet.add(item.productId.toString());
                }
            });
        });

        const productIds = Array.from(productIdSet);

        // Step 3: Fetch product details from Product Microservice
        const productResponse = await axios.post('http://localhost:5000/api/products/productlist/getBulk_userSpecific', {
            ids: productIds
        });

        const products = productResponse.data.products || [];

        // Step 4: Map productId to product detail
        const productMap = {};
        products.forEach(prod => {
            productMap[prod._id] = prod;
        });

        // Step 5: Attach product details to each item in orders
        const enrichedOrders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.items = orderObj.items.map(item => {
                const pid = item.productId?.toString();
                return {
                    ...item,
                    productDetails: pid ? productMap[pid] || null : null
                };
            });
            return orderObj;
        });

        return res.status(200).json({
            message: "Data get successfully!",
            data: enrichedOrders
        });

    } catch (error) {
        console.error("getUserSpecific error:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export default {
    create,
    getOne,
    GetAll,
    update,
    getUserSpecific
}