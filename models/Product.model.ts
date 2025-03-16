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

  name: {
    type: String, 
    required: [true, `Name is required!`], 
  }, 
  description: {
    type: String, 
    required: [true, `Description is required!`], 
  }, 
  price: {
    type: Number, 
    required: [true, `Price is required!`], 
  }, 
  images: {
    type: [String], 
  }
});

export const ProductModel = models.Product|| model(`Product`, ProductSchema);
