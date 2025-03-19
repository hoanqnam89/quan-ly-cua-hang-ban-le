import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const WarehouseReceiptSchema = new Schema({
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

  product_ids: {
    type: [String], 
    required: [true, `Products is required!`], 
  }
});

export const WarehouseReceiptModel = 
  models.WarehouseReceipt|| model(`WarehouseReceipt`, WarehouseReceiptSchema);
