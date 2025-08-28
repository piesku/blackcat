import {Game, GameView} from "../game.js";
import {UpgradeSelectionView} from "./UpgradeSelectionView.js";
import {StanceSelectionView} from "./StanceSelectionView.js";
import {VictoryView} from "./VictoryView.js";
import {DefeatView} from "./DefeatView.js";
import {ArenaView} from "./ArenaView.js";

export function App(game: Game) {
    switch (game.CurrentView) {
        case GameView.UpgradeSelection:
            return UpgradeSelectionView(game);
        case GameView.StanceSelection:
            return StanceSelectionView(game);
        case GameView.Arena:
            return ArenaView(game);
        case GameView.Victory:
            return VictoryView(game);
        case GameView.Defeat:
            return DefeatView(game);
        default:
            return ArenaView(game);
    }
}
