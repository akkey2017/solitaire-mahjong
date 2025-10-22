import React from 'react';
import MahjongTile from './MahjongTile';
import { Tile } from '../types/mahjong';

interface DiscardPileProps {
    discards: Tile[];
}

const DiscardPile: React.FC<DiscardPileProps> = ({ discards }) => (
    <div className="bg-emerald-800 p-4 rounded-lg shadow-inner mb-4">
        <h2 className="text-center text-sm mb-2 text-gray-300">捨て牌</h2>
        <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 lg:grid-cols-18 gap-2 min-h-[50px] max-h-[160px] overflow-y-auto">
            {discards.map((tile, index) => (
                <MahjongTile key={`${tile}-${index}`} tile={tile} isDiscarded />
            ))}
        </div>
    </div>
);

export default DiscardPile;
