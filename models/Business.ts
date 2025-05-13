import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';

const BusinessSchema = new Schema({
  id: { type: ObjectId },
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
    required: [true, 'Name is required!'],
  },
  logo: {
    type: String,
    required: [false],
  },
  logo_links: {
    type: [String],
    default: [],
  },
  address: {
    type: String,
    required: [true, 'Address is required!'],
  },
  email: { type: String },
});

export const BusinessModel =
  models.Business || model('Business', BusinessSchema);
