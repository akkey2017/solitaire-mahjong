import React from 'react';
import * as logic from '../lib/mahjongLogic';
import { GameState, Tile } from '../types/mahjong';

interface ActionButtonsProps {
    onKan: () => void;
    onRiichi: () => void;
    onTsumo: () => void;
    onRestart: () => void;
    gameState: GameState;
    validRiichiKanTile?: Tile | null; // Receive validated Kan tile
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onKan, onRiichi, onTsumo, onRestart, gameState, validRiichiKanTile }) => {
    const { drawnTile, hand, kanMelds, isRiichi, isRiichiDeclaration, isGameOver } = gameState;

    // Can declare normal Kan (not Riichi)
    const canNormalKan = !isGameOver && !isRiichi && drawnTile && logic.findKanOptions(hand, drawnTile).length > 0;
    // Can declare Kan during Riichi (only if validated and it's the drawn tile)
    const canRiichiKan = isRiichi && drawnTile && validRiichiKanTile !== null && validRiichiKanTile === drawnTile;

    const canKan = canNormalKan || canRiichiKan;

    // Can declare Riichi (concealed hand, tenpai after discard)
    const canDeclareRiichiCheck = !isGameOver && !isRiichi && !isRiichiDeclaration && drawnTile && logic.checkRiichi(hand, drawnTile, kanMelds).canRiichi;
    const canRiichi = canDeclareRiichiCheck;

    // Can declare Tsumo (winning hand with drawn tile)
    const canTsumo = !isGameOver && drawnTile !== null && logic.isWinningHand([...hand, drawnTile], kanMelds);

    // Disable Kan during Riichi if the drawn tile is a winning tile (Tsumo takes priority)
    const disableKanDuringRiichiWin = isRiichi && drawnTile !== null && canTsumo;

    return (
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4">
            <button
                onClick={onKan}
                disabled={!canKan || disableKanDuringRiichiWin} // Disable Kan if Riichi win is possible
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
            >
                カン
            </button>
            <button
                onClick={onRiichi}
                disabled={!canRiichi}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
            >
                リーチ
            </button>
            <button
                onClick={onTsumo}
                disabled={!canTsumo}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
            >
                ツモ
            </button>
            <button
                onClick={onRestart}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 sm:px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
                新しく始める
            </button>
        </div>
    );
};

export default ActionButtons;

