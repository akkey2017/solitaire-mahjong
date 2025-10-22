import React from 'react';
import * as logic from '../lib/mahjongLogic';
import { GameState } from '../types/mahjong';

interface ActionButtonsProps {
    onKan: () => void;
    onRiichi: () => void;
    onTsumo: () => void;
    onRestart: () => void;
    gameState: GameState;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onKan, onRiichi, onTsumo, onRestart, gameState }) => {
    const { drawnTile, hand, kanMelds, isRiichi, isRiichiDeclaration, isGameOver } = gameState;

    const canKan = !isGameOver && !isRiichi && drawnTile && logic.findKanOptions(hand, drawnTile).length > 0;
    // 暗カンは門前を崩さないため、リーチ可能条件から kanMelds.length === 0 を削除
    const canRiichi = !isGameOver && !isRiichi && !isRiichiDeclaration && drawnTile && logic.checkRiichi(hand, drawnTile, kanMelds).canRiichi;
    const canTsumo = !isGameOver && drawnTile && logic.isWinningHand([...hand, drawnTile], kanMelds);

    return (
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-4">
            <button
                onClick={onKan}
                disabled={!canKan}
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

