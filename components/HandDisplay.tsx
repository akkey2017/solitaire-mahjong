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
            {/* Kan Melds */}
            <div className="flex justify-center items-end space-x-2 mr-4">
                {kanMelds.map((meld, meldIndex) => (
                    <div key={meldIndex} className="flex">
                        {/* Display Ankan with ends face down */}
                        <MahjongTile tile="back" isKan />
                        <MahjongTile tile={meld[1]} isKan /> {/* Show middle two tiles */}
                        <MahjongTile tile={meld[2]} isKan />
                        <MahjongTile tile="back" isKan />
                    </div>
                ))}
            </div>

            {/* Main Hand */}
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

            {/* Drawn Tile */}
            <div className="ml-4">
                {drawnTile && (
                    <MahjongTile
                        tile={drawnTile}
                        isGlow={dora.includes(drawnTile)}
                        isRiichiPossible={isRiichiDeclaration && validRiichiDiscards.has(hand.length)}
                        onClick={() => onTileClick(hand.length, true)} // Pass hand.length as index for drawn tile
                    />
                )}
            </div>
        </div>
    );
};

export default HandDisplay;

