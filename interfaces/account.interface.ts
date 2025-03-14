export interface IAccount {
  _id: string
  created_at: Date
  updated_at: Date

  username: string
  password: string
  role_group_ids: string[]
}
