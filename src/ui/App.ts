import {Game, GameView} from "../game.js";
import {ArenaIntroView} from "./ArenaIntroView.js";
import {ArenaView} from "./ArenaView.js";
import {DefeatView} from "./DefeatView.js";
import {UpgradeSelectionView} from "./UpgradeSelectionView.js";
import {VictoryView} from "./VictoryView.js";

export function App(game: Game) {
    switch (game.CurrentView) {
        case GameView.UpgradeSelection:
            return UpgradeSelectionView(game);
        case GameView.ArenaIntro:
            return ArenaIntroView(game);
        case GameView.Victory:
            return VictoryView(game);
        case GameView.Defeat:
            return DefeatView(game);
        case GameView.Arena:
            return ArenaView(game);
    }
}
