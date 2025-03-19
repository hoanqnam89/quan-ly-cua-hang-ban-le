import { ObjectId } from 'mongodb';
import { models, model, Schema, } from 'mongoose';

const RubikSchema = new Schema({
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

  names: {
    type: [String], 
    required: [true, `Name is required!`], 
  }, 
  number_of_rotation: {
    type: Number, 
    required: [true, `Number of rotation is required!`], 
  }, 
  rotation_flags: { type: [Number], }, 
  initial_state: {
    type: String, 
    require: [true, `Initial State is required!`], 
    match: [/^\d+$/, `Initial State must only contain digits`], 
  }, 
  length: {
    type: Number, 
    require: [true, `Length is required!`], 
  }, 
  color_set_id: { type: ObjectId }, 
  move_sets: [
    {
      name: {
        type: String, 
        require: [true, `Move name is required`], 
      }, 
      swap_positions: {
        type: [[Number]]
      }, 
      rotate: {
        position: {
          type: Number, 
        }, 
        turn: {
          type: Number, 
        }
      }
    }
  ]
});

export const RubikModel = models.Rubik || model(`Rubik`, RubikSchema);
