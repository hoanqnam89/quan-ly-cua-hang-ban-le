import { ObjectId } from 'mongodb';
import { models, model, Schema } from 'mongoose';
import { IOrder } from '@/interfaces/order.interface';

const OrderSchema = new Schema({
    order_code: {
        type: String,
        required: true,
        unique: true
    },
    employee_id: {
        type: String,
        required: true
    },
    items: [{
        product_id: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    payment_method: {
        type: String,
        required: true,
        enum: ['cash', 'transfer', 'card']
    },
    payment_status: {
        type: Boolean,
        required: true,
        default: false
    },
    note: {
        type: String
    },
    created_at: {
        type: Date,
        default: () => Date.now(),
        immutable: true
    },
    updated_at: {
        type: Date,
        default: () => Date.now()
    }
});

// Middleware để cập nhật updated_at trước khi lưu
OrderSchema.pre('save', function (next) {
    this.updated_at = new Date();
    next();
});

export const OrderModel = models.Order || model<IOrder>('Order', OrderSchema); 