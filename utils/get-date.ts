import { pad } from "./pad";

  export const getDate = (value: Date): string => {
    const date: Date = new Date(value);
    
    return `${date.getFullYear()}-${
      pad(date.getMonth() + 1 + ``, 2)
    }-${
      pad(date.getDate() + ``, 2)
    }`
  }
