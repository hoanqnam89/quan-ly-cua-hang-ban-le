export const nameToHyphenAndLowercase = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, '-');
}; 