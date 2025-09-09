import { isValidObjectId } from "mongoose";
import { orderValidationSchema } from "../middleware/orderValidation.js";
import orderModel from "../models/orderModel.js";
import axios from "axios";
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

export default {
    create,
    getOne,
    GetAll,
    update
}