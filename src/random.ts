/**
 * Simple seeded random number generator using Linear Congruential Generator (LCG)
 * This ensures consistent random generation for opponent upgrades based on arena level
 */
export class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    /**
     * Generate next random float between 0 and 1
     */
    next(): number {
        // LCG formula: (a * seed + c) % m
        // Using parameters from Numerical Recipes
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }

    /**
     * Generate random integer between min (inclusive) and max (exclusive)
     */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min)) + min;
    }

    /**
     * Shuffle array in-place using Fisher-Yates algorithm with seeded random
     */
    shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            let j = this.nextInt(0, i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

/**
 * Create seeded random generator based on arena level
 * This ensures the same upgrades are generated for the same level regardless of when accessed
 */
export function createSeededRandom(arenaLevel: number): SeededRandom {
    // Use arena level as base seed, add some salt to avoid obvious patterns
    let seed = arenaLevel * 12345 + 67890;
    return new SeededRandom(seed);
}
