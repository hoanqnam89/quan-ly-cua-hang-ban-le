import { Code, ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';
import { nameToHyphenAndLowercase } from '@/utils/name-to-hyphen-and-lowercase';

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
  category_id: {
    type: ObjectId,
    required: [true, `Category is required!`],
  },
  code: {
    type: String,
    required: [true, `Name is required!`],
  },
  name: {
    type: String,
    required: [true, `Name is required!`],
  },
  description: {
    type: String,
    required: [true, `Description is required!`],
  },
  image_links: {
    type: [String],
    required: [true, `Image Links is required!`],
  },
  input_price: {
    type: Number,
    required: [true, `Input Price is required!`],
  },
  output_price: {
    type: Number,
    required: [true, `Output Price is required!`],
  },
});


export const ProductModel = models.Product || model(`Product`, ProductSchema);
