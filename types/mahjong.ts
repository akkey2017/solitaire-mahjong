export type Suit = 'm' | 'p' | 's' | 'z';
export type Tile = string; // 例: 'm1', 'p9', 'z3'
export type Meld = Tile[];

export interface Yaku {
    name: string;
    han: number;
    yakuman?: boolean;
}

export interface YakuResult {
    yaku: Yaku[];
    han: number;
    fu: number;
    isYakuman: boolean;
}

export interface ParsedHand {
    pair: Meld;
    melds: Meld[];
}

export interface GameState {
    wall: Tile[];
    hand: Tile[];
    discards: Tile[];
    wangpai: Tile[];
    rinshanTiles: Tile[];
    doraIndicators: Tile[];
    uraDoraIndicators: Tile[];
    dora: Tile[];
    kanMelds: Meld[];
    drawnTile: Tile | null;
    isGameOver: boolean;
    isRiichi: boolean;
    isIppatsu: boolean;
    isRinshan: boolean;
    isRiichiDeclaration: boolean;
    validRiichiDiscards: Set<number>;
    gameMessage: string;
    winResult: YakuResult | null;
}
