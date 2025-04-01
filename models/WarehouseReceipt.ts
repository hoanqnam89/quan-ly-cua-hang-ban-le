import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const WarehouseReceiptSchema = new Schema({
  id: { type: ObjectId, }, 
  supplier_receipt_id: { type: ObjectId, }, 
  created_at: { 
    type: Date, 
    default: () => Date.now(),
    immutable: true,
  }, 
  updated_at: { 
    default: () => Date.now(),
    type: Date, 
  }, 

  product_details: [
    {
      id: { type: ObjectId, }, 
      unit_id: { type: ObjectId, }, 
      note: { type: String }, 
      quantity: {
        type: Number, 
        require: [true, `Product quantity is required!`], 
      }, 
    }
  ], 
});

export const WarehouseReceiptModel = 
  models.WarehouseReceipt|| model(`WarehouseReceipt`, WarehouseReceiptSchema);
