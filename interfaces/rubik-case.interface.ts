export interface IRubikCase {
  _id: string
  created_at: Date
  updated_at: Date

  rubik_algorithm_set_id: string
  name: string
  state: string
}
