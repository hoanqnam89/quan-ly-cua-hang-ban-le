import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const SupplierSchema = new Schema({
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
});

export const SupplierModel = models.Supplier || model(`Supplier`, SupplierSchema);
