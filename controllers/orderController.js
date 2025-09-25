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
   
 await axios.post('http://localhost:5000/api/products/productList/updateStock', { items });

}

const sendNotification = async (token) => {
  await axios.post(
    "http://localhost:5000/api/notifications/notification/Notify",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};




const create = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Missing token in cookie" });
    }

    const userId = req.user?.id;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json("Invalid userId in token");
    }

    const { error } = orderValidationSchema.validate(req.body);
    if (error) {
      console.log(error.details);
      return res.status(400).json(error.details);
    }

    const data = new orderModel({ ...req.body });
    await data.save();


    await sendNotification(token); // ✅ Pass the token manually
    await updateStock_ProductService(req.body.items);

    res.status(200).json({
      message: "Order created successfully",
      data: data
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
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
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 50;
        const skip = (page - 1) * itemsPerPage;
        const [data, totalCount] = Promise.all([
            orderModel.find().skip(skip).limit(itemsPerPage),
            orderModel.countDocuments()
        ]);
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        res.status(200).json({
            message: "Order found",
            data: data,
            totalCount,
            totalPages,
            itemsPerPage,
            page

        })
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