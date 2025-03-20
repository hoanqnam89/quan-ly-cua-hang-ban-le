import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const ProductSchema = new Schema({
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

  supplier_id: { 
    type: ObjectId, 
    required: [true, `Supplier is required!`], 
  }, 
  name: {
    type: String, 
    required: [true, `Name is required!`], 
  }, 
  description: {
    type: String, 
    required: [true, `description is required!`], 
  }, 
  price: {
    type: String, 
    required: [true, `Price is required!`], 
  }, 
  image_links: {
    type: [String], 
    required: [true, `Image Links is required!`], 
  }
});

export const ProductModel = models.Product || model(`Product`, ProductSchema);
