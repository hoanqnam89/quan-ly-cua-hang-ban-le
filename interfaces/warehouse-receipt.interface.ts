import { IOrderFormProductDetail } from "./order-form.interface"

export interface IReceiptProduct {
  _id: string
  quantity: number
}

export interface IWarehouseReceipt {
  _id: string
  supplier_id: string
  supplier_receipt_id: string
  created_at: Date
  updated_at: Date

  product_details: IOrderFormProductDetail[], 
}
