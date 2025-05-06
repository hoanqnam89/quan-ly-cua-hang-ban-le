import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const WarehouseReceiptSchema = new Schema({
  id: { type: ObjectId, },
  supplier_id: { type: ObjectId, required: true },
  supplier_receipt_id: { type: ObjectId, required: true },
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
      _id: { type: ObjectId, required: true },
      unit_id: { type: ObjectId, required: true },
      note: { type: String },
      quantity: {
        type: Number,
        required: [true, `Product quantity is required!`],
      },
    }
  ],
});

export const WarehouseReceiptModel =
  models.WarehouseReceipt || model(`WarehouseReceipt`, WarehouseReceiptSchema);
