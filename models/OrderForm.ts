import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const OrderFormSchema = new Schema({
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

  products: [
    {
      id: { type: ObjectId, }, 
      quantity: {
        type: Number, 
        require: [true, `Product quantity is required!`], 
      }, 
    }
  ], 
});

export const OrderFormModel = 
  models.OrderForm || model(`OrderForm`, OrderFormSchema);
