import express from 'express';
import orderController from '../controllers/orderController.js';
const orderRoutes = express.Router();


orderRoutes.post('/create',orderController.create);
orderRoutes.get('/getOne/:id',orderController.getOne);
orderRoutes.get('/getAll',orderController.GetAll);

orderRoutes.put('/update/:id',orderController.update);



export default orderRoutes;