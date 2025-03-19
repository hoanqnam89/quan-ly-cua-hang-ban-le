const alpha: number = .75;

const boundingBoxColor = [.55, .55, .55];

export const DEFAULT_BOX_VERTEXES = [ 
  // X, Y, Z           R, G, B, A
  // Top
  -1.0,  1.0, -1.0, ...boundingBoxColor, alpha, // 0
  -1.0,  1.0,  1.0, ...boundingBoxColor, alpha, // 1
   1.0,  1.0,  1.0, ...boundingBoxColor, alpha, // 2
   1.0,  1.0, -1.0, ...boundingBoxColor, alpha, // 3

  // // Middle Up
  // -1.0,  0.0, -1.0, 1.0, 1.0, 1.0, alpha, // 0
  // -1.0,  0.0,  1.0, 1.0, 1.0, 1.0, alpha, // 1
  //  1.0,  0.0,  1.0, 1.0, 1.0, 1.0, alpha, // 2
  //  1.0,  0.0, -1.0, 1.0, 1.0, 1.0, alpha, // 3

  // Left
  -1.0,  1.0,  1.0, ...boundingBoxColor, alpha, // 4
  -1.0, -1.0,  1.0, ...boundingBoxColor, alpha, // 5
  -1.0, -1.0, -1.0, ...boundingBoxColor, alpha, // 6
  -1.0,  1.0, -1.0, ...boundingBoxColor, alpha, // 7

  // Right
   1.0,  1.0,  1.0, ...boundingBoxColor, alpha, // 8
   1.0, -1.0,  1.0, ...boundingBoxColor, alpha, // 9
   1.0, -1.0, -1.0, ...boundingBoxColor, alpha, // 10
   1.0,  1.0, -1.0, ...boundingBoxColor, alpha, // 11

  // Front
   1.0,  1.0,  1.0, ...boundingBoxColor, alpha, // 12
   1.0, -1.0,  1.0, ...boundingBoxColor, alpha, // 13
  -1.0, -1.0,  1.0, ...boundingBoxColor, alpha, // 14
  -1.0,  1.0,  1.0, ...boundingBoxColor, alpha, // 15

  // Back
   1.0,  1.0, -1.0, ...boundingBoxColor, alpha, // 16
   1.0, -1.0, -1.0, ...boundingBoxColor, alpha, // 17
  -1.0, -1.0, -1.0, ...boundingBoxColor, alpha, // 18
  -1.0,  1.0, -1.0, ...boundingBoxColor, alpha, // 19

  // Bottom
  -1.0, -1.0, -1.0, ...boundingBoxColor, alpha, // 20
  -1.0, -1.0,  1.0, ...boundingBoxColor, alpha, // 21
   1.0, -1.0,  1.0, ...boundingBoxColor, alpha, // 22
   1.0, -1.0, -1.0, ...boundingBoxColor, alpha, // 23
];

export const DEFAULT_BOX_INDEXES = [
  // Top
  0, 1, 2,
  0, 3, 2,

  // Left
  4, 5, 6,
  4, 6, 7,

  // Right
  8, 9, 10,
  8, 10, 11,

  // Front
  13, 12, 14,
  15, 14, 12,

  // Back
  16, 17, 18,
  16, 18, 19,

  // Bottom
  21, 20, 22,
  22, 20, 23
];
