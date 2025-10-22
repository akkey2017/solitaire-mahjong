import React from 'react';
import MahjongTile from './MahjongTile';
import { Tile, Meld } from '../types/mahjong';

interface HandDisplayProps {
    hand: Tile[];
    drawnTile: Tile | null;
    kanMelds: Meld[];
    dora: Tile[];
    isRiichiDeclaration: boolean;
    validRiichiDiscards: Set<number>;
    onTileClick: (index: number, isDrawnClick: boolean) => void;
}

const HandDisplay: React.FC<HandDisplayProps> = ({ hand, drawnTile, kanMelds, dora, isRiichiDeclaration, validRiichiDiscards, onTileClick }) => {
    return (
        <div className="flex justify-center items-end">
            <div className="flex justify-center items-end space-x-2 mr-4">
                {kanMelds.map((meld, meldIndex) => (
                    <div key={meldIndex} className="flex">
                        {meld.map((tile, tileIndex) => (
                            <MahjongTile key={`${tile}-${tileIndex}`} tile={tile} isKan />
                        ))}
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-end space-x-1">
                {hand.map((tile, index) => (
                    <MahjongTile
                        key={`${tile}-${index}`}
                        tile={tile}
                        isGlow={dora.includes(tile)}
                        isRiichiPossible={isRiichiDeclaration && validRiichiDiscards.has(index)}
                        onClick={() => onTileClick(index, false)}
                    />
                ))}
            </div>

            <div className="ml-4">
                {drawnTile && (
                    <MahjongTile
                        tile={drawnTile}
                        isGlow={dora.includes(drawnTile)}
                        isRiichiPossible={isRiichiDeclaration && validRiichiDiscards.has(hand.length)}
                        onClick={() => onTileClick(hand.length, true)}
                    />
                )}
            </div>
        </div>
    );
};

export default HandDisplay;
