import { IWarehouseReceipt } from "@/app/interfaces/warehouse-receipt.interface";

export const DEFAULT_WAREHOUST_RECEIPT: IWarehouseReceipt = {
    _id: ``,
    supplier_id: ``,
    supplier_receipt_id: ``,
    created_at: new Date(),
    updated_at: new Date(),

    product_details: [],
} 