import { EBusinessType } from '@/enums/business-type.enum';
import { enumToArray } from '@/utils/enum-to-array';
import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const CategorySchema = new Schema({
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
  code: {
    type: String, 
    required: [false], 
  }, 
  discount: { type: Number, },
  subcategories: {type: []},  
});

export const CategoryModel = 
  models.Category2 || model(`Category2`, CategorySchema);
