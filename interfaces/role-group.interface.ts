export interface IRoleGroup {
  _id: string
  created_at: Date
  updated_at: Date

  name: string
  role_ids: string[]
}
