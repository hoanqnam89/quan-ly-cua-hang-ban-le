export interface IGoodReceiptProduct {
  _id: string
  quantity: number
} 

export interface IGoodReceipt {
  _id: string
  created_at: Date
  updated_at: Date

  products: IGoodReceiptProduct[]
}
