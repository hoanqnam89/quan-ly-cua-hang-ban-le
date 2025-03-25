import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const ProductDetailSchema = new Schema({
  id: { type: ObjectId, }, 
  created_at: { 
    type: Date, 
    default: () => Date.now(),
    immutable: true,
  }, 
  updated_at: { 
    default: () => Date.now(),
    type: Date, 
  }, 

  product_id: { 
    type: ObjectId, 
    required: [true, `Supplier is required!`], 
  }, 
  input_quantity: {
    type: Number, 
    required: [true, `Input Quantity is required!`], 
  }, 
  output_quantity: {
    type: Number, 
    required: [true, `Output Quantity is required!`], 
  }, 
  date_of_manufacture: { 
    type: Date, 
    default: () => Date.now(),
  }, 
  expiry_date: { 
    default: () => Date.now(),
    type: Date, 
  }, 
});

export const ProductDetailModel = 
  models.ProductDetail || model(`ProductDetail`, ProductDetailSchema);
