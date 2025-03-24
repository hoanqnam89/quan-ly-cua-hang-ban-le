export interface IProduct {
  _id: string
  created_at: Date
  updated_at: Date

  supplier_id: string
  name: string
  description: string
  image_links: string[]
  input_price: number
  output_price: number
}
