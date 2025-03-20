import { EUserGender } from '@/enums/user-gender.enum';
import { enumToArray } from '@/utils/enum-to-array';
import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const UserSchema = new Schema({
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

  account_id: { type: ObjectId, }, 
  name: {
    first: { 
      type: String, 
      required: [true, `First Name is required!`], 
    }, 
    middle: { type: String, }, 
    last: { 
      type: String, 
      required: [true, `Last Name is required!`], 
    }, 
  }, 
  address: {
    number: { type: String, }, 
    street: { type: String, }, 
    city: { type: String, }, 
    ward: { type: String, }, 
    district: { type: String, }, 
    country: { type: String, }
  }, 
  email: { type: String, }, 
  birthday: { type: Date, }, 
  gender: {
    type: String, 
    enum: enumToArray(EUserGender), 
  }, 
  avatar: { type: String }, 
});

export const UserModel = models.User || model(`User`, UserSchema);
