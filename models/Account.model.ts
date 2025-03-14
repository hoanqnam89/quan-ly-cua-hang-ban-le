import { ObjectId } from 'mongodb';
import { models, model, Schema, CallbackWithoutResultAndOptionalError, } from 'mongoose';
import bcrypt from 'bcrypt';

const AccountSchema = new Schema({
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

  username: {
    type: String, 
    required: [true, `Username is required!`], 
  }, 
  password: {
    type: String, 
    required: [true, `Password is required!`], 
  }, 
  isAdmin: {
    type: Boolean, 
    required: [true, `Is Admin is required!`], 
  }
});

AccountSchema.pre(`save`, 
  async function save(next: CallbackWithoutResultAndOptionalError) {
    if ( !this.isModified(`password`) )
      return next();

    try {
      const salt = await bcrypt.genSalt(
        process.env.HASH_ROUND ? +process.env.HASH_ROUND : 10
      );
      const hashedPassword = await bcrypt.hash(this.password, salt);

      this.password = hashedPassword;

      return next(); 
    } catch (error) {
      return next(error as Error);
    }
  }
);

AccountSchema.methods.comparePassword = async function (plainTextPassword: string) {
  const isPasswordMatch = 
    await bcrypt.compare(plainTextPassword, this.password);
  
  return isPasswordMatch;
}

export const AccountModel = models.Account || model(`Account`, AccountSchema);
