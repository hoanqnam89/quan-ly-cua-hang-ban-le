export interface IOrderFormProduct {
  _id: string
  quantity: number
} 

export interface IOrderForm {
  _id: string
  created_at: Date
  updated_at: Date

  products: IOrderFormProduct[]
}
