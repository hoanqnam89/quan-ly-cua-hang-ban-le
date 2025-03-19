import { ObjectId } from 'mongodb';
import { models, model, Schema, } from 'mongoose';

const RubikColorSetSchema = new Schema({
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
  colors: [
    {
      key: {
        type: String, 
        require: [true, `Key is required!`], 
        match: [/^[a-zA-Z0-9]$/, `Key is invalid!`], 
      }, 
      hex: {
        type: String, 
        require: [true, `Hex is required!`], 
        match: [/^#[a-fA-F0-9]{6}$/, `Hex color is invalid!`], 
      }, 
    }
  ], 
});

export const RubikColorSetModel = models.RubikColorSet 
  || model(`RubikColorSet`, RubikColorSetSchema);
