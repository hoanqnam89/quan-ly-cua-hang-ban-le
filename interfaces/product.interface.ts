export interface IProduct {
  _id: string
  created_at: Date
  updated_at: Date

  name: string
  description: string
  price: number
  images?: string[]
}
