import { ObjectId } from 'mongodb';
import { models, model, Schema, } from 'mongoose';

const RubikCaseSchema = new Schema({
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

  rubik_algorithm_set_id: { type: ObjectId, }, 
  name: {
    type: String, 
    required: [true, `Name is required!`], 
  }, 
  state: {
    type: String, 
    required: [true, `State is required!`], 
  }, 
});

export const RubikCaseModel = models.RubikCase
  || model(`RubikCase`, RubikCaseSchema);
