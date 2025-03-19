import { ObjectId } from 'mongodb';
import { models, model, Schema, } from 'mongoose';

const RubikAlgorithmSetSchema = new Schema({
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

  rubik_id: { type: ObjectId, }, 
  name: {
    type: String, 
    required: [true, `Name is required!`], 
  }, 
  start_state: {
    type: String, 
    required: [true, `Start State is required!`], 
  }, 
  end_state: {
    type: String, 
    required: [true, `End State is required!`], 
  }, 
});

export const RubikAlgorithmSetModel = models.RubikAlgorithmSet 
  || model(`RubikAlgorithmSet`, RubikAlgorithmSetSchema);
