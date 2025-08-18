import {GameState} from "./state.js";

const enum Storage {
    CurrentRun = "com.piesku.blackcat.1",
}

export function save_game_state(state: GameState) {
    localStorage.setItem(Storage.CurrentRun, JSON.stringify(state));
    console.log("%cGame state saved", "color: red");
}

export function has_game_state() {
    return localStorage.getItem(Storage.CurrentRun) !== null;
}

export function get_game_state(): GameState | null {
    let state = localStorage.getItem(Storage.CurrentRun);
    if (state) {
        return JSON.parse(state) as GameState;
    }
    return null;
}

export function load_game_state(): GameState | null {
    let state = get_game_state();
    if (state) {
        console.log("%cGame state loaded", "color: red");
        return state;
    }
    return null;
}

export function clear_game_state() {
    localStorage.removeItem(Storage.CurrentRun);
    console.log("%cGame state cleared", "color: red");
}
