import { GameState, Suit, Tile, Yaku, YakuResult, ParsedHand, Meld } from '../types/mahjong';

export const SUITS: Suit[] = ['m', 'p', 's', 'z'];
export const TILE_IMAGE_BASE_URL = 'https://raw.githubusercontent.com/FluffyStuff/riichi-mahjong-tiles/master/Regular/';
export const TILE_IMAGE_MAP: { [key: string]: string } = {
    m1: 'Man1.svg', m2: 'Man2.svg', m3: 'Man3.svg', m4: 'Man4.svg', m5: 'Man5.svg', m6: 'Man6.svg', m7: 'Man7.svg', m8: 'Man8.svg', m9: 'Man9.svg',
    p1: 'Pin1.svg', p2: 'Pin2.svg', p3: 'Pin3.svg', p4: 'Pin4.svg', p5: 'Pin5.svg', p6: 'Pin6.svg', p7: 'Pin7.svg', p8: 'Pin8.svg', p9: 'Pin9.svg',
    s1: 'Sou1.svg', s2: 'Sou2.svg', s3: 'Sou3.svg', s4: 'Sou4.svg', s5: 'Sou5.svg', s6: 'Sou6.svg', s7: 'Sou7.svg', s8: 'Sou8.svg', s9: 'Sou9.svg',
    z1: 'Ton.svg', z2: 'Nan.svg', z3: 'Shaa.svg', z4: 'Pei.svg', z5: 'Haku.svg', z6: 'Hatsu.svg', z7: 'Chun.svg',
    back: 'Back.svg'
};

export const YAKU_DEFS: { [key: string]: Yaku } = {
    'Riichi': { name: '立直', han: 1 }, 'Ippatsu': { name: '一発', han: 1 }, 'Tsumo': { name: '門前清自摸和', han: 1 },
    'Tanyao': { name: '断么九', han: 1 }, 'Pinfu': { name: '平和', han: 1 }, 'Iipeikou': { name: '一盃口', han: 1 },
    'YakuhaiWhite': { name: '役牌：白', han: 1 }, 'YakuhaiGreen': { name: '役牌：發', han: 1 }, 'YakuhaiRed': { name: '役牌：中', han: 1 },
    'Haitei': { name: '海底摸月', han: 1 }, 'Rinshan': { name: '嶺上開花', han: 1 },
    'Toitoi': { name: '対々和', han: 2 }, 'Sanankou': { name: '三暗刻', han: 2 }, 'SanshokuDoukou': { name: '三色同刻', han: 2 },
    'Shousangen': { name: '小三元', han: 2 }, 'Honroutou': { name: '混老頭', han: 2 }, 'Chiitoitsu': { name: '七対子', han: 2 },
    'Ikkitsuukan': { name: '一気通貫', han: 2 }, 'SanshokuDoujun': { name: '三色同順', han: 2 }, 'Honchantaiyao': { name: '混全帯幺九', han: 2 },
    'Ryanpeikou': { name: '二盃口', han: 3 }, 'Junchan': { name: '純全帯幺九', han: 3 }, 'Honitsu': { name: '混一色', han: 3 },
    'Chinitsu': { name: '清一色', han: 6 },
    'Kokushi': { name: '国士無双', han: 13, yakuman: true }, 'Kokushi13': { name: '国士無双十三面待ち', han: 26, yakuman: true },
    'Suuankou': { name: '四暗刻', han: 13, yakuman: true }, 'SuuankouTanki': { name: '四暗刻単騎待ち', han: 26, yakuman: true },
    'Daisangen': { name: '大三元', han: 13, yakuman: true }, 'Tsuuiisou': { name: '字一色', han: 13, yakuman: true },
    'Ryuuiisou': { name: '緑一色', han: 13, yakuman: true }, 'Chinroutou': { name: '清老頭', han: 13, yakuman: true },
    'Chuuren': { name: '九蓮宝燈', han: 13, yakuman: true }, 'JunseiChuuren': { name: '純正九蓮宝燈', han: 26, yakuman: true },
};

export const initializeGame = (): Omit<GameState, 'dora' | 'gameMessage' | 'winResult'> => {
    let wall: Tile[] = [];
    SUITS.forEach(suit => {
        const limit = (suit === 'z') ? 7 : 9;
        for (let i = 1; i <= limit; i++) {
            for (let j = 0; j < 4; j++) wall.push(`${suit}${i}`);
        }
    });

    for (let i = wall.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wall[i], wall[j]] = [wall[j], wall[i]];
    }

    const wangpai = wall.splice(-14);
    const rinshanTiles = wangpai.slice(0, 4);
    const doraIndicators = [wangpai[4]];
    const uraDoraIndicators = [wangpai[5]];

    const hand = wall.splice(0, 13);
    sortHand(hand);

    const { newWall, tile: drawnTile } = drawFromWall(wall);

    return {
        wall: newWall, hand, discards: [], wangpai, rinshanTiles,
        doraIndicators, uraDoraIndicators, kanMelds: [],
        drawnTile, isGameOver: false, isRiichi: false, isIppatsu: false,
        isRinshan: false, isRiichiDeclaration: false, validRiichiDiscards: new Set(),
    };
};


export const drawFromWall = (wall: Tile[]): { newWall: Tile[], tile: Tile | null } => {
    if (wall.length === 0) return { newWall: [], tile: null };
    const newWall = [...wall];
    const tile = newWall.shift()!;
    return { newWall, tile };
};

export const drawFromRinshan = (rinshanTiles: Tile[]): { newRinshan: Tile[], tile: Tile | null } => {
    if (rinshanTiles.length === 0) return { newRinshan: [], tile: null };
    const newRinshan = [...rinshanTiles];
    const tile = newRinshan.pop()!;
    return { newRinshan, tile };
};

export const sortHand = (handToSort: Tile[]): void => {
    handToSort.sort((a, b) => {
        const suitA = SUITS.indexOf(a[0] as Suit);
        const suitB = SUITS.indexOf(b[0] as Suit);
        if (suitA !== suitB) return suitA - suitB;
        return parseInt(a.substring(1)) - parseInt(b.substring(1));
    });
};

export const calculateDoraTiles = (doraIndicators: Tile[]): Tile[] => {
    const dora: Tile[] = [];
    doraIndicators.forEach(indicator => {
        if (!indicator) return;
        let suit = indicator[0] as Suit, num = parseInt(indicator.substring(1));
        if (suit === 'z') {
            if (num >= 1 && num <= 4) dora.push(`z${(num % 4) + 1}`);
            else if (num >= 5 && num <= 7) dora.push(`z${5 + ((num - 5 + 1) % 3)}`);
        } else {
            dora.push(`${suit}${(num % 9) + 1}`);
        }
    });
    return dora;
};

const findMelds = (counts: { [key: string]: number }): Meld[] | null => {
    if (Object.keys(counts).length === 0) return [];
    const remainingCounts = { ...counts };
    const firstTile = Object.keys(remainingCounts).sort(sortHand)[0];

    if (remainingCounts[firstTile] >= 3) {
        const newCounts = { ...remainingCounts };
        newCounts[firstTile] -= 3;
        if (newCounts[firstTile] === 0) delete newCounts[firstTile];
        const result = findMelds(newCounts);
        if (result !== null) return [[firstTile, firstTile, firstTile], ...result];
    }

    const suit = firstTile[0] as Suit, num = parseInt(firstTile.substring(1));
    if (suit !== 'z' && num <= 7) {
        const t2 = `${suit}${num + 1}`, t3 = `${suit}${num + 2}`;
        if (remainingCounts[t2] && remainingCounts[t3]) {
            const newCounts = { ...remainingCounts };
            [firstTile, t2, t3].forEach(t => {
                newCounts[t]--;
                if (newCounts[t] === 0) delete newCounts[t];
            });
            const result = findMelds(newCounts);
            if (result !== null) return [[firstTile, t2, t3], ...result];
        }
    }
    return null;
};

export const parseHand = (looseHand: Tile[]): ParsedHand | null => {
    const counts: { [key: string]: number } = looseHand.reduce((acc, tile) => {
        acc[tile] = (acc[tile] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });

    const uniqueTiles = Object.keys(counts).sort(sortHand);
    for (const tile of uniqueTiles) {
        if (counts[tile] >= 2) {
            const tempCounts = { ...counts };
            tempCounts[tile] -= 2;
            if (tempCounts[tile] === 0) delete tempCounts[tile];
            const melds = findMelds(tempCounts);
            if (melds !== null) return { pair: [tile, tile], melds };
        }
    }
    return null;
};

export const isWinningHand = (looseHand: Tile[], kanMelds: Meld[] = []): boolean => {
    const handWithKans = looseHand.concat(kanMelds.flat());
    if (handWithKans.length % 3 !== 2) return false;

    if (kanMelds.length === 0 && looseHand.length === 14) {
        const counts = looseHand.reduce((acc, tile) => { acc[tile] = (acc[tile] || 0) + 1; return acc; }, {} as { [key: string]: number });
        if (Object.values(counts).filter(c => c === 2).length === 7) return true;
        const kokushiTiles = new Set(['m1', 'm9', 'p1', 'p9', 's1', 's9', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7']);
        const handSet = new Set(looseHand);
        if (handSet.size >= 13 && [...handSet].every(t => kokushiTiles.has(t))) return true;
    }

    return !!parseHand(looseHand);
};


export const isTenpai = (looseHand: Tile[], kanMelds: Meld[]): boolean => {
    if ((looseHand.length + kanMelds.flat().length) % 3 !== 1) return false;
    const allTiles = Object.keys(TILE_IMAGE_MAP).filter(k => k !== 'back');
    for (const tile of allTiles) {
        const tempHand = [...looseHand, tile];
        if (isWinningHand(tempHand, kanMelds)) return true;
    }
    return false;
};

export const checkRiichi = (hand: Tile[], drawnTile: Tile, kanMelds: Meld[]): { canRiichi: boolean, possibleDiscards: Set<number> } => {
    const possibleDiscards = new Set<number>();
    let canRiichi = false;
    const fullHand = [...hand, drawnTile];
    for (let i = 0; i < fullHand.length; i++) {
        const tempHand = [...fullHand];
        tempHand.splice(i, 1);
        if (isTenpai(tempHand, kanMelds)) {
            possibleDiscards.add(i);
            canRiichi = true;
        }
    }
    return { canRiichi, possibleDiscards };
};

export const findKanOptions = (hand: Tile[], drawnTile: Tile | null): Tile[] => {
    if (!drawnTile) return [];
    const fullHand = [...hand, drawnTile];
    const counts = fullHand.reduce((acc, tile) => { acc[tile] = (acc[tile] || 0) + 1; return acc; }, {} as { [key: string]: number });
    return Object.keys(counts).filter(tile => counts[tile] === 4);
};

export const performKan = (hand: Tile[], drawnTile: Tile, tileToKan: Tile, currentKanMelds: Meld[]): { newHand: Tile[], newKanMelds: Meld[] } => {
    const fullHand = [...hand, drawnTile];
    const newHand = [];
    let removed = 0;
    for (const tile of fullHand) {
        if (tile === tileToKan && removed < 4) {
            removed++;
        } else {
            newHand.push(tile);
        }
    }
    const newKanMelds = [...currentKanMelds, [tileToKan, tileToKan, tileToKan, tileToKan]];
    sortHand(newHand);
    return { newHand, newKanMelds };
};

// ... (Full checkYaku, checkYakuman, calculateDora, calculateFu, calculateScore functions would go here, fully implemented as in the last HTML version)
export const checkYaku = (looseHand: Tile[], winningTile: Tile, gameState: GameState): YakuResult | null => {
    const { kanMelds, isRiichi, isIppatsu, isRinshan, wall, doraIndicators, uraDoraIndicators } = gameState;
    const handWithKans = looseHand.concat(kanMelds.flat());

    const yakumanResult = checkYakuman(looseHand, winningTile, gameState);
    if (yakumanResult) return yakumanResult;

    let yaku: Yaku[] = [];
    const counts = looseHand.reduce((acc, tile) => (acc[tile] = (acc[tile] || 0) + 1, acc), {} as Record<string, number>);

    if (kanMelds.length === 0 && Object.values(counts).filter(c => c === 2).length === 7) {
        yaku.push(YAKU_DEFS.Chiitoitsu);
        if (looseHand.every(t => t[0] !== 'z' && t[1] !== '1' && t[1] !== '9')) yaku.push(YAKU_DEFS.Tanyao);
        if (isRiichi) {
            yaku.push(YAKU_DEFS.Riichi);
            if (isIppatsu) yaku.push(YAKU_DEFS.Ippatsu);
        }

        const { doraCount, uraDoraCount } = calculateDora(handWithKans, isRiichi, doraIndicators, uraDoraIndicators);
        const totalHan = yaku.reduce((sum, y) => sum + y.han, 0) + doraCount + uraDoraCount;

        if (doraCount > 0) yaku.push({ name: 'ドラ', han: doraCount });
        if (isRiichi) yaku.push({ name: '裏ドラ', han: uraDoraCount });

        return { yaku, han: totalHan, fu: 25, isYakuman: false };
    }

    const parsed = parseHand(looseHand);
    if (!parsed) return null;

    if (kanMelds.length === 0) yaku.push(YAKU_DEFS.Tsumo);
    if (isRiichi) {
        yaku.push(YAKU_DEFS.Riichi);
        if (isIppatsu) yaku.push(YAKU_DEFS.Ippatsu);
    }
    if (wall.length === 0) yaku.push(YAKU_DEFS.Haitei);
    if (isRinshan) yaku.push(YAKU_DEFS.Rinshan);

    // ... (Continue adding all other yaku checks here from the final HTML version)

    if (yaku.length === 0) return null;

    let uniqueYaku = [...new Map(yaku.map(item => [item['name'], item])).values()];

    const { doraCount, uraDoraCount } = calculateDora(handWithKans, isRiichi, doraIndicators, uraDoraIndicators);
    const han = uniqueYaku.reduce((sum, y) => sum + y.han, 0) + doraCount + uraDoraCount;
    const fu = calculateFu(parsed, winningTile, gameState, uniqueYaku);

    if (doraCount > 0) uniqueYaku.push({ name: 'ドラ', han: doraCount });
    if (isRiichi) uniqueYaku.push({ name: '裏ドラ', han: uraDoraCount });

    return { yaku: uniqueYaku, han, fu, isYakuman: false };
};

const checkYakuman = (looseHand: Tile[], winningTile: Tile, gameState: GameState): YakuResult | null => {
    // Placeholder - port full logic here
    return null;
};

const calculateDora = (handWithKans: Tile[], isRiichi: boolean, doraIndicators: Tile[], uraDoraIndicators: Tile[]): { doraCount: number, uraDoraCount: number } => {
    let doraCount = 0, uraDoraCount = 0;
    const dora = calculateDoraTiles(doraIndicators);
    handWithKans.forEach(tile => {
        dora.forEach(d => { if (tile === d) doraCount++; });
    });
    if (isRiichi) {
        const uraDora = calculateDoraTiles(uraDoraIndicators.slice(0, doraIndicators.length));
        handWithKans.forEach(tile => {
            uraDora.forEach(ud => { if (tile === ud) uraDoraCount++; });
        });
    }
    return { doraCount, uraDoraCount };
};

const calculateFu = (parsed: ParsedHand, winningTile: Tile, gameState: GameState, yaku: Yaku[]): number => {
    // Placeholder - port full logic here
    return 20;
}

export const calculateScore = (han: number, fu: number, isYakuman = false): { name: string, ko_ron: string, oya_ron: string, ko_tsumo: string, oya_tsumo: string } => {
    const ceil100 = (num: number) => Math.ceil(num / 100) * 100;
    if (isYakuman) {
        const name = han >= 26 ? "ダブル役満" : "役満";
        const factor = han >= 26 ? 2 : 1;
        return { name, ko_ron: `${32000 * factor}`, oya_ron: `${48000 * factor}`, ko_tsumo: `${16000 * factor}/${8000 * factor}`, oya_tsumo: `${16000 * factor} All` };
    }
    if (han >= 13) return { name: '数え役満', ko_ron: '32000', oya_ron: '48000', ko_tsumo: '16000/8000', oya_tsumo: '16000 All' };
    if (han >= 11) return { name: '三倍満', ko_ron: '24000', oya_ron: '36000', ko_tsumo: '12000/6000', oya_tsumo: '12000 All' };
    if (han >= 8) return { name: '倍満', ko_ron: '16000', oya_ron: '24000', ko_tsumo: '8000/4000', oya_tsumo: '8000 All' };
    if (han >= 6) return { name: '跳満', ko_ron: '12000', oya_ron: '18000', ko_tsumo: '6000/3000', oya_tsumo: '6000 All' };
    if (han >= 5 || (han === 4 && fu >= 40) || (han === 3 && fu >= 70)) {
        return { name: '満貫', ko_ron: '8000', oya_ron: '12000', ko_tsumo: '4000/2000', oya_tsumo: '4000 All' };
    }
    const base = fu * Math.pow(2, han + 2);
    if (base > 2000) {
        return { name: '満貫', ko_ron: '8000', oya_ron: '12000', ko_tsumo: '4000/2000', oya_tsumo: '4000 All' };
    }
    const ko_ron = ceil100(base * 4);
    const oya_ron = ceil100(base * 6);
    const ko_tsumo_oya = ceil100(base * 2);
    const ko_tsumo_ko = ceil100(base);
    const oya_tsumo = ceil100(base * 2);
    return { name: '', ko_ron: `${ko_ron}`, oya_ron: `${oya_ron}`, ko_tsumo: `${ko_tsumo_oya}/${ko_tsumo_ko}`, oya_tsumo: `${oya_tsumo} All` };
};

