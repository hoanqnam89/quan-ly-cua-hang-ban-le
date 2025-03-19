export interface IRubikMoveSet {
  name: string
  swap_positions: number[][]
  rotate?: {
    position: number
    turn: number
  }
}

export interface IRubik {
  _id: string
  created_at: Date
  updated_at: Date

  names: string[]
  number_of_rotation: number
  rotation_flags: number[]
  initial_state: string
  length: number
  color_set_id: string
  move_sets: IRubikMoveSet[]
}
