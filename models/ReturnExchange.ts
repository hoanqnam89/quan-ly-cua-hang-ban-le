import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReturnExchange extends Document {
    receipt_id: string;
    product_details: any[];
    action: 'exchange' | 'return';
    created_at: Date;
    status: 'Đang chờ' | 'Đang đổi hàng' | 'Hoàn thành' | 'Đã trả hàng';
}

const ReturnExchangeSchema: Schema = new Schema({
    receipt_id: { type: String, required: true },
    product_details: { type: Array, required: true },
    action: { type: String, enum: ['exchange', 'return'], required: true },
    created_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['Đang chờ', 'Đang đổi hàng', 'Hoàn thành', 'Đã trả hàng'], default: 'Đang chờ' },
});

const ReturnExchangeModel: Model<IReturnExchange> =
    mongoose.models.ReturnExchange || mongoose.model<IReturnExchange>('ReturnExchange', ReturnExchangeSchema);

export default ReturnExchangeModel; 