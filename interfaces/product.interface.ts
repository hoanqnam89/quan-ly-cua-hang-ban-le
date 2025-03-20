export interface IProduct {
  _id: string
  created_at: Date
  updated_at: Date

  supplier_id: string
  name: string
  description: string
  price: number
  image_links: string[], 
}
