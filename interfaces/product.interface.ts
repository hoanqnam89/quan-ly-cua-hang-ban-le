export interface IProduct {
  _id: string
  created_at: Date
  updated_at: Date

  code: string
  name: string
  description: string
  image_links: string[]
  input_price: number
  output_price: number
}
