import { Types } from 'mongoose';

export interface IProduct {
    _id: string;
    supplier_id: string;
    name: string;
    description?: string;
    image_links?: string[];
    input_price: number;
    output_price: number;
    created_at: string;
    updated_at: string;
} 