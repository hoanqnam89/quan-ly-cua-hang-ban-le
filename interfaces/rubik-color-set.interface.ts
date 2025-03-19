export interface IRubikColor {
  _id?: string
  key: string
  hex: string
}

export interface IRubikColorSet {
  _id: string
  created_at: Date
  updated_at: Date

  name: string
  colors: IRubikColor[]
}
