export interface IProductDetail {
  _id: string
  created_at: Date
  updated_at: Date

  product_id: string
  input_price: number
  output_price: number
  input_quantity: number
  output_quantity: number
  date_of_manufacture: Date
  expiry_date: Date
}
