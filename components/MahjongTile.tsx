import React from 'react';
import { TILE_IMAGE_BASE_URL, TILE_IMAGE_MAP } from '../lib/mahjongLogic';
import { Tile } from '../types/mahjong';

interface MahjongTileProps {
    tile: Tile;
    onClick?: () => void;
    isDiscarded?: boolean;
    isGlow?: boolean;
    isRiichiPossible?: boolean;
    isKan?: boolean;
}

const MahjongTile: React.FC<MahjongTileProps> = ({ tile, onClick, isDiscarded, isGlow, isRiichiPossible, isKan }) => {
    const tileImageSrc = TILE_IMAGE_MAP[tile];
    const frontImageSrc = TILE_IMAGE_BASE_URL + 'Front.svg';

    const tileClasses = [
        "relative", "inline-flex", "items-center", "justify-center",
        "bg-transparent", "select-none", "transition-transform", "duration-100",
        isDiscarded ? "w-8 h-12" : (isKan ? "w-9 h-14" : "w-12 h-[72px]"),
        onClick ? "cursor-pointer hover:-translate-y-1" : "cursor-default",
    ].join(' ');

    const overlayClasses = [
        "absolute", "top-0", "left-0", "w-full", "h-full", "p-1",
        isGlow ? "shadow-[0_0_12px_3px_#fbbf24] rounded-md" : "",
        isRiichiPossible ? "shadow-[0_0_14px_4px_#6366f1] rounded-md border-2 border-indigo-400" : ""
    ].join(' ');

    return (
        <div className={tileClasses} onClick={onClick}>
            <img
                src={frontImageSrc}
                alt="牌の背景"
                className="w-full h-full"
                draggable={false}
            />
            {tile !== 'back' && tileImageSrc && (
                <div className={overlayClasses}>
                    <img
                        src={TILE_IMAGE_BASE_URL + tileImageSrc}
                        alt={tile}
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                </div>
            )}
            {tile === 'back' && (
                <div className="absolute top-0 left-0 w-full h-full">
                    <img
                        src={TILE_IMAGE_BASE_URL + TILE_IMAGE_MAP.back}
                        alt="裏の牌"
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                </div>
            )}
        </div>
    );
};

export default MahjongTile;
