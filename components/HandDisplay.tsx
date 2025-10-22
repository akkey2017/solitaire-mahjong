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
    // Calculate width for the wrapper of hand + drawn tile
    // 13 tiles * 48px + 12 spaces * 4px = 672px (hand)
    // 1 drawn tile * 48px = 48px
    // Margin ml-4 = 16px
    // Total = 672 + 16 + 48 = 736px
    const handAndDrawnWrapperWidth = 'w-[736px]';

    return (
        // Outer container centers Kan Melds + Hand/Drawn Wrapper
        <div className="flex justify-center items-end">
            {/* Kan Melds */}
            <div className="flex justify-center items-end space-x-2 mr-4">
                {kanMelds.map((meld, meldIndex) => (
                    <div key={meldIndex} className="flex">
                        <MahjongTile tile="back" isKan />
                        <MahjongTile tile={meld[1]} isKan />
                        <MahjongTile tile={meld[2]} isKan />
                        <MahjongTile tile="back" isKan />
                    </div>
                ))}
            </div>

            {/* Wrapper for Hand and Drawn Tile with Fixed Width */}
            <div className={`flex items-end ${handAndDrawnWrapperWidth}`}>
                {/* Main Hand Container (No fixed width needed here) */}
                <div className="flex items-end space-x-1">
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

                {/* Drawn Tile Container (No fixed width needed here) */}
                {/* Use ml-4 for spacing */}
                <div className="ml-4">
                    {drawnTile && (
                        <MahjongTile
                            tile={drawnTile}
                            isGlow={dora.includes(drawnTile)}
                            isRiichiPossible={isRiichiDeclaration && validRiichiDiscards.has(hand.length)}
                            onClick={() => onTileClick(hand.length, true)}
                        />
                    )}
                    {/* Placeholder takes up same space as a tile + margin */}
                    {!drawnTile && <div className="w-12 h-[72px]"></div>}
                </div>
            </div> {/* End of Hand+Drawn Wrapper */}

        </div> // End of Outer Container
    );
};

export default HandDisplay;

