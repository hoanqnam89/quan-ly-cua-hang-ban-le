import { ObjectId } from 'mongodb';
import { models, model, Schema, } from 'mongoose';

const RubikAlgorithmSchema = new Schema({
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

  rubik_case_id: { type: ObjectId, }, 
  user_add_id: { type: ObjectId, }, 
  algorithm: {
    type: String, 
    required: [true, `End State is required!`], 
  }, 
});

export const RubikAlgorithmModel = models.RubikAlgorithm 
  || model(`RubikAlgorithm`, RubikAlgorithmSchema);
