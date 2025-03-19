export const clamp = (n: number, min: number = 0, max: number = 1): number => 
    Math.max(min, Math.min(n, max));
