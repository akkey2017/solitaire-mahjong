import React from 'react';
import MahjongTile from './MahjongTile';
import { Tile } from '../types/mahjong';

interface WangpaiDisplayProps {
    doraIndicators: Tile[];
}

const WangpaiDisplay: React.FC<WangpaiDisplayProps> = ({ doraIndicators }) => (
    <div className="flex justify-center items-center gap-2 mb-2 p-2 bg-emerald-900/50 rounded-lg min-h-[60px]">
        {doraIndicators.map((tile, index) => (
            <MahjongTile key={`${tile}-${index}`} tile={tile} isDiscarded />
        ))}
        <div className="w-4"></div>
        {Array.from({ length: 5 - doraIndicators.length }).map((_, i) => (
            <MahjongTile key={`back-${i}`} tile="back" isDiscarded />
        ))}
    </div>
);

export default WangpaiDisplay;
