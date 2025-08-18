let seed = 1;

export function set_seed(new_seed: number) {
    seed = 198706 * new_seed;
}

export function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
}

export function integer(min = 0, max = 1) {
    return ~~(rand() * (max - min + 1) + min);
}

export function float(min = 0, max = 1) {
    return rand() * (max - min) + min;
}

export function element<T>(arr: Array<T>) {
    return arr[integer(0, arr.length - 1)];
}

export function shuffle<T>(arr: Array<T>): Array<T> {
    // Fisher-Yates shuffle algorithm
    let shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = integer(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
