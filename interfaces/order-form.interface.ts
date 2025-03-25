export interface IOrderFormProductDetail {
  _id: string
  supplier_id: string
  quantity: number
} 

export interface IOrderForm {
  _id: string
  created_at: Date
  updated_at: Date

  product_details: IOrderFormProductDetail[]
}
