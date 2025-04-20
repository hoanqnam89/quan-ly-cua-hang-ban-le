import { IOrderFormProductDetail } from "@/interfaces/order-form.interface";

export interface IReceiptProduct {
    _id: string;
    unit_id: string;
    quantity: number;
    note?: string;
}

export interface IWarehouseReceipt {
    _id: string;
    supplier_id: string;
    supplier_receipt_id: string;
    created_at: Date;
    updated_at: Date;

    product_details: IOrderFormProductDetail[];
} 