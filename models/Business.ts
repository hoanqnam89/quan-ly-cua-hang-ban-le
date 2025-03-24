import { EBusinessType } from '@/enums/business-type.enum';
import { enumToArray } from '@/utils/enum-to-array';
import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const BusinessSchema = new Schema({
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
  logo: {
    type: String, 
    required: [false], 
  }, 
  address: {
    number: { type: String, }, 
    street: { type: String, }, 
    city: { type: String, }, 
    ward: { type: String, }, 
    district: { type: String, }, 
    country: { type: String, }
  }, 
  email: { type: String, }, 
  type: {
    type: String, 
    enum: enumToArray(EBusinessType), 
  }, 
});

export const BusinessModel = 
  models.Business || model(`Business`, BusinessSchema);
