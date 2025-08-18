import {GameState} from "./game.js";

/**
 * Game state persistence using IndexedDB with localStorage fallback
 */
export interface GameStore {
    saveGameState(state: GameState): Promise<void>;
    loadGameState(): Promise<GameState | null>;
    clearGameState(): Promise<void>;
}

/**
 * IndexedDB-based game store
 */
export class IndexedDBGameStore implements GameStore {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = "BlackCat";
    private readonly DB_VERSION = 1;

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = () => {
                let db = request.result;

                // Game state store
                if (!db.objectStoreNames.contains("gamestate")) {
                    db.createObjectStore("gamestate", {keyPath: "id"});
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    async saveGameState(state: GameState): Promise<void> {
        if (!this.db) throw new Error("Database not connected");

        let transaction = this.db.transaction(["gamestate"], "readwrite");
        let store = transaction.objectStore("gamestate");

        return new Promise((resolve, reject) => {
            let request = store.put({
                id: "current",
                timestamp: Date.now(),
                ...state,
            });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async loadGameState(): Promise<GameState | null> {
        if (!this.db) throw new Error("Database not connected");

        let transaction = this.db.transaction(["gamestate"], "readonly");
        let store = transaction.objectStore("gamestate");

        return new Promise((resolve, reject) => {
            let request = store.get("current");
            request.onsuccess = () => {
                let result = request.result;
                if (result) {
                    resolve({
                        currentLevel: result.currentLevel || 1,
                        playerUpgrades: result.playerUpgrades || [],
                        opponentUpgrades: result.opponentUpgrades || [],
                        population: result.population || 8_000_000_000,
                        isNewRun: result.isNewRun || false,
                    });
                } else {
                    resolve(null); // No saved state
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async clearGameState(): Promise<void> {
        if (!this.db) throw new Error("Database not connected");

        let transaction = this.db.transaction(["gamestate"], "readwrite");
        let store = transaction.objectStore("gamestate");

        return new Promise((resolve, reject) => {
            let request = store.delete("current");
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

/**
 * localStorage-based fallback store
 */
export class LocalStorageGameStore implements GameStore {
    private readonly STORAGE_KEY = "blackcat_state";

    async saveGameState(state: GameState): Promise<void> {
        try {
            let stateWithTimestamp = {
                ...state,
                timestamp: Date.now(),
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateWithTimestamp));
        } catch (e) {
            console.warn("Failed to save to localStorage:", e);
            throw e;
        }
    }

    async loadGameState(): Promise<GameState | null> {
        try {
            let stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;

            let parsed = JSON.parse(stored);
            return {
                currentLevel: parsed.currentLevel || 1,
                playerUpgrades: parsed.playerUpgrades || [],
                opponentUpgrades: parsed.opponentUpgrades || [],
                population: parsed.population || 8_000_000_000,
                isNewRun: parsed.isNewRun || false,
            };
        } catch (e) {
            console.warn("Failed to load from localStorage:", e);
            return null;
        }
    }

    async clearGameState(): Promise<void> {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {
            console.warn("Failed to clear localStorage:", e);
            throw e;
        }
    }
}

/**
 * Create appropriate game store with fallback support
 */
export async function createGameStore(): Promise<GameStore> {
    // Try IndexedDB first
    if ("indexedDB" in window) {
        try {
            let store = new IndexedDBGameStore();
            await store.connect();
            return store;
        } catch (e) {
            console.warn("IndexedDB failed, falling back to localStorage:", e);
        }
    }

    // Fallback to localStorage
    return new LocalStorageGameStore();
}
