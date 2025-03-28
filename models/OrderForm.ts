import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const OrderFormSchema = new Schema({
  id: { type: ObjectId, }, 
  supplier_id: { type: ObjectId, }, 
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
      quantity: {
        type: Number, 
        require: [true, `Product quantity is required!`], 
      }, 
    }
  ], 
});

export const OrderFormModel = 
  models.OrderForm || model(`OrderForm`, OrderFormSchema);
