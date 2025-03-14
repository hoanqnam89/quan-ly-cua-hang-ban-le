export const nameToHyphenAndLowercase = (name: string): string => 
  name.toLowerCase().replace(/\s/g, `-`);
