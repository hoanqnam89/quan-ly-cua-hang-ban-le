/**
 * Chuyển đổi chuỗi thành dạng lowercase và thay thế khoảng trắng bằng dấu gạch ngang
 * @param name Chuỗi cần chuyển đổi
 * @returns Chuỗi đã được chuyển đổi
 */
export const nameToHyphenAndLowercase = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, '-');
