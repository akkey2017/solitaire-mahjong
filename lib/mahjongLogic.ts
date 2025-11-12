import { GameState, Suit, Tile, Yaku, YakuResult, ParsedHand, Meld } from '../types/mahjong';

// Constants remain the same...
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
    'Toitoi': { name: '対々和', han: 2 }, 'Sanankou': { name: '三暗刻', han: 2 }, 'SanshokuDoukou': { name: '三色同刻', han: 2},
    'Shousangen': { name: '小三元', han: 2 }, 'Honroutou': { name: '混老頭', han: 2 }, 'Chiitoitsu': { name: '七対子', han: 2 },
    'Ikkitsuukan': { name: '一気通貫', han: 2 }, 'SanshokuDoujun': { name: '三色同順', han: 2 }, 'Honchantaiyao': { name: '混全帯幺九', han: 2 },
    'SanKantsu': { name: '三槓子', han: 2 },
    'Ryanpeikou': { name: '二盃口', han: 3 }, 'Junchan': { name: '純全帯幺九', han: 3 }, 'Honitsu': { name: '混一色', han: 3 },
    'Chinitsu': { name: '清一色', han: 6 },
    'Kokushi': { name: '国士無双', han: 13, yakuman: true }, 'Kokushi13': { name: '国士無双十三面待ち', han: 26, yakuman: true },
    'Suuankou': { name: '四暗刻', han: 13, yakuman: true }, 'SuuankouTanki': { name: '四暗刻単騎待ち', han: 26, yakuman: true },
    'Daisangen': { name: '大三元', han: 13, yakuman: true }, 'Tsuuiisou': { name: '字一色', han: 13, yakuman: true },
    'Ryuuiisou': { name: '緑一色', han: 13, yakuman: true }, 'Chinroutou': { name: '清老頭', han: 13, yakuman: true },
    'Chuuren': { name: '九蓮宝燈', han: 13, yakuman: true }, 'JunseiChuuren': { name: '純正九蓮宝燈', han: 26, yakuman: true },
    'SuuKantsu': { name: '四槓子', han: 13, yakuman: true },
};

// --- Tile Utilities ---
const tileComparator = (a: Tile, b: Tile): number => {
    const suitA = SUITS.indexOf(a[0] as Suit);
    const suitB = SUITS.indexOf(b[0] as Suit);
    if (suitA !== suitB) return suitA - suitB;
    return parseInt(a.substring(1)) - parseInt(b.substring(1));
};

export const sortHand = (handToSort: Tile[]): void => {
    if (Array.isArray(handToSort)) {
        handToSort.sort(tileComparator);
    } else {
        console.error("Attempted to sort a non-array:", handToSort);
    }
};

const countTiles = (tiles: Tile[]): { [key: string]: number } => {
    return tiles.reduce((acc, tile) => {
        acc[tile] = (acc[tile] || 0) + 1;
        return acc;
    }, {} as { [key: string]: number });
};

// --- Game Initialization and Drawing ---
export const initializeGame = (): Omit<GameState, 'dora' | 'gameMessage' | 'winResult' | 'currentScore' | 'targetScore'> => {
    const wall: Tile[] = [];
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
    // ... (same as before)
    if (wall.length === 0) return { newWall: [], tile: null };
    const newWall = [...wall];
    const tile = newWall.shift()!;
    return { newWall, tile };
};
export const drawFromRinshan = (rinshanTiles: Tile[]): { newRinshan: Tile[], tile: Tile | null } => {
    // ... (same as before)
    if (rinshanTiles.length === 0) return { newRinshan: [], tile: null };
    const newRinshan = [...rinshanTiles];
    const tile = newRinshan.pop()!;
    return { newRinshan, tile };
};
export const calculateDoraTiles = (doraIndicators: Tile[]): Tile[] => {
    // ... (same as before)
    const dora: Tile[] = [];
    (doraIndicators || []).forEach(indicator => {
        if (!indicator) return;
        const suit = indicator[0] as Suit, num = parseInt(indicator.substring(1));
        if (suit === 'z') {
            if (num >= 1 && num <= 4) dora.push(`z${(num % 4) + 1}`);
            else if (num >= 5 && num <= 7) dora.push(`z${5 + ((num - 5 + 1) % 3)}`);
        } else {
            dora.push(`${suit}${(num % 9) + 1}`);
        }
    });
    return dora;
};

// --- Hand Parsing Logic (Corrected) ---
const findExactMelds = (counts: { [key: string]: number }, numMelds: number): Meld[] | null => {
    // ... (same as before)
    if (numMelds === 0) return Object.keys(counts).length === 0 ? [] : null;
    if (Object.keys(counts).length === 0) return null;
    const remainingCounts = { ...counts };
    const firstTile = Object.keys(remainingCounts).sort(tileComparator)[0];
    if (!firstTile) return null;
    if (remainingCounts[firstTile] >= 3) {
        const newCounts = { ...remainingCounts };
        newCounts[firstTile] -= 3;
        if (newCounts[firstTile] === 0) delete newCounts[firstTile];
        const result = findExactMelds(newCounts, numMelds - 1);
        if (result !== null) return [[firstTile, firstTile, firstTile], ...result];
    }
    const suit = firstTile[0] as Suit, num = parseInt(firstTile.substring(1));
    if (suit !== 'z' && num <= 7) {
        const t2 = `${suit}${num + 1}`, t3 = `${suit}${num + 2}`;
        if (remainingCounts[t2] >= 1 && remainingCounts[t3] >= 1) {
            const newCounts = { ...remainingCounts };
            [firstTile, t2, t3].forEach(t => {
                newCounts[t]--;
                if (newCounts[t] === 0) delete newCounts[t];
            });
            const result = findExactMelds(newCounts, numMelds - 1);
            if (result !== null) return [[firstTile, t2, t3], ...result];
        }
    }
    return null;
};
export const parseHand = (looseHand: Tile[], requiredMelds: number): ParsedHand | null => {
    // ... (same as before)
    if (!looseHand || looseHand.length !== (requiredMelds * 3 + 2)) return null;
    const counts = countTiles(looseHand);
    const uniqueTiles = Object.keys(counts).sort(tileComparator);
    for (const tile of uniqueTiles) {
        if (counts[tile] >= 2) {
            const tempCounts = { ...counts };
            tempCounts[tile] -= 2;
            if (tempCounts[tile] === 0) delete tempCounts[tile];
            const melds = findExactMelds(tempCounts, requiredMelds);
            if (melds !== null) return { pair: [tile, tile], melds };
        }
    }
    return null;
};

// --- Winning Hand, Tenpai, Waiting Tiles Logic (Corrected for Kans) ---
export const isWinningHand = (looseHand: Tile[], kanMelds: Meld[] = []): boolean => {
    // ... (same as before, relies on corrected parseHand)
    const requiredMelds = 4 - kanMelds.length;
    const requiredLooseTiles = requiredMelds * 3 + 2;
    if (looseHand.length !== requiredLooseTiles) return false;
    if (kanMelds.length === 0 && looseHand.length === 14) {
        const counts = countTiles(looseHand);
        if (Object.values(counts).filter(c => c === 2).length === 7) return true;
        const kokushiTiles = new Set(['m1', 'm9', 'p1', 'p9', 's1', 's9', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7']);
        const handSet = new Set(looseHand);
        if (handSet.size >= 13 && [...kokushiTiles].every(t => counts[t] >= 1) && looseHand.length === 14) return true;
    }
    return !!parseHand(looseHand, requiredMelds);
};
export const isTenpai = (looseHand: Tile[], kanMelds: Meld[]): boolean => {
    // ... (same as before, relies on corrected isWinningHand)
    const requiredMelds = 4 - kanMelds.length;
    const requiredLooseTilesForWin = requiredMelds * 3 + 2;
    if (looseHand.length !== requiredLooseTilesForWin - 1) return false;
    const allPossibleTiles = Object.keys(TILE_IMAGE_MAP).filter(k => k !== 'back');
    for (const tile of allPossibleTiles) {
        const tempHand = [...looseHand, tile];
        if (isWinningHand(tempHand, kanMelds)) return true;
    }
    return false;
};

// Function to get waiting tiles for a tenpai hand
export const getWaitingTiles = (looseHand: Tile[], kanMelds: Meld[]): Set<Tile> => {
    const waits = new Set<Tile>();
    if (!isTenpai(looseHand, kanMelds)) {
        return waits; // Return empty set if not tenpai
    }
    const allPossibleTiles = Object.keys(TILE_IMAGE_MAP).filter(k => k !== 'back');
    for (const tile of allPossibleTiles) {
        const tempHand = [...looseHand, tile];
        if (isWinningHand(tempHand, kanMelds)) {
            waits.add(tile);
        }
    }
    return waits;
};

// --- Riichi, Kan, Action Logic (Corrected for Kan after Riichi) ---
export const checkRiichi = (hand: Tile[], drawnTile: Tile, kanMelds: Meld[]): { canRiichi: boolean, possibleDiscards: Set<number> } => {
    // ... (same as before, relies on corrected isTenpai)
    const possibleDiscards = new Set<number>();
    let canRiichi = false;
    const fullLooseHand = [...hand, drawnTile];
    for (let i = 0; i < fullLooseHand.length; i++) {
        const tempHand = [...fullLooseHand];
        tempHand.splice(i, 1);
        if (isTenpai(tempHand, kanMelds)) {
            possibleDiscards.add(i);
            canRiichi = true;
        }
    }
    return { canRiichi, possibleDiscards };
};

export const findKanOptions = (hand: Tile[], drawnTile: Tile | null): Tile[] => {
    // ... (same as before)
    if (!drawnTile) return [];
    const fullHand = [...hand, drawnTile];
    const counts = countTiles(fullHand);
    return Object.keys(counts).filter(tile => counts[tile] === 4);
};

export const performKan = (hand: Tile[], drawnTile: Tile, tileToKan: Tile, currentKanMelds: Meld[]): { newHand: Tile[], newKanMelds: Meld[] } => {
    // ... (same as before)
    const fullHand = [...hand, drawnTile];
    const newHand: Tile[] = [];
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

// New function to check if Ankan is possible after Riichi without changing waits
export const canDeclareKanAfterRiichi = (hand: Tile[], drawnTile: Tile, kanMelds: Meld[]): Tile | null => {
    const kanOptions = findKanOptions(hand, drawnTile);
    if (kanOptions.length === 0) return null; // No Kan possible

    const kanTile = kanOptions[0]; // Assume only one possible Kan for simplicity now

    // 1. Get waits *before* the potential Kan
    // Need the hand state *before* drawing the Kan tile (i.e., the tenpai hand)
    const currentTenpaiHand = [...hand]; // Use the hand before drawing the tile
    const waitsBefore = getWaitingTiles(currentTenpaiHand, kanMelds);
    if (waitsBefore.size === 0) return null; // Should be tenpai if Riichi

    // 2. Simulate the Kan
    const { newHand: handAfterKan, newKanMelds: kanMeldsAfterKan } = performKan(hand, drawnTile, kanTile, kanMelds);

    // 3. Get waits *after* the potential Kan (using the hand *after* Kan)
    // The tenpai check needs the hand *before* drawing the Rinshan tile
    const waitsAfter = getWaitingTiles(handAfterKan, kanMeldsAfterKan);

    // 4. Compare waits
    if (waitsBefore.size === waitsAfter.size && [...waitsBefore].every(tile => waitsAfter.has(tile))) {
        return kanTile; // Waits are identical, Kan is allowed
    }

    return null; // Waits changed, Kan is not allowed
};


// --- Yaku Checking and Scoring Logic ---
// (Ensure checkYaku, checkYakuman, calculateDora, calculateFu use the corrected logic)
// checkYaku, checkYakuman, calculateDora, calculateFu, calculateScore remain the same as previous
export const checkYaku = (looseHand: Tile[], winningTile: Tile, gameState: GameState): YakuResult | null => {
    const { kanMelds, isRiichi, isIppatsu, isRinshan, wall, doraIndicators, uraDoraIndicators } = gameState;

    const yakumanResult = checkYakuman(looseHand, winningTile, gameState);
    if (yakumanResult) return yakumanResult;

    const yaku: Yaku[] = [];
    const counts = countTiles(looseHand);
    const requiredMelds = 4 - kanMelds.length;

    if (kanMelds.length === 0 && Object.values(counts).filter(c => c === 2).length === 7) {
        yaku.push(YAKU_DEFS.Chiitoitsu);
        if (looseHand.every(t => !['1', '9'].includes(t.substring(1)) && t[0] !== 'z')) yaku.push(YAKU_DEFS.Tanyao);
    } else {
        const parsed = parseHand(looseHand, requiredMelds);
        if (!parsed) return null;

        const allMelds = parsed.melds.concat(kanMelds);
        const handWithKans = looseHand.concat(kanMelds.flat());

        const isConcealed = true; // Assume Ankan only
        if (isConcealed) {
            yaku.push(YAKU_DEFS.Tsumo);
            const isPinfu = kanMelds.length === 0 &&
                parsed.melds.every(m => m.length === 3 && m[0] !== m[1]) &&
                !['z5', 'z6', 'z7'].includes(parsed.pair[0]) &&
                parsed.melds.some(m => {
                    if (m.length !== 3 || m[0] === m[1]) return false;
                    const sortedMeld = [...m]; sortHand(sortedMeld);
                    const n1 = parseInt(sortedMeld[0][1]);
                    return (winningTile === `${sortedMeld[0][0]}${n1 - 1}` && n1 > 1) ||
                        (winningTile === `${sortedMeld[2][0]}${parseInt(sortedMeld[2][1]) + 1}` && parseInt(sortedMeld[2][1]) < 9);
                });
            if (isPinfu) yaku.push(YAKU_DEFS.Pinfu);

            const sequences = parsed.melds.filter(m => m.length === 3 && m[0] !== m[1]).map(s => { const sorted = [...s]; sortHand(sorted); return sorted.join(','); });
            const sequenceCounts: { [key: string]: number } = {};
            sequences.forEach(s => sequenceCounts[s] = (sequenceCounts[s] || 0) + 1);
            const pairsOfSequences = Object.values(sequenceCounts).filter(c => c >= 2).length;
            if (pairsOfSequences === 2) yaku.push(YAKU_DEFS.Ryanpeikou);
            else if (pairsOfSequences === 1) yaku.push(YAKU_DEFS.Iipeikou);
        }

        const triplets = allMelds.filter(m => (m.length === 3 || m.length === 4) && m[0] === m[1]);
        const ankou = parsed.melds.filter(m => m.length === 3 && m[0] === m[1]).concat(kanMelds);

        if (triplets.length === 4) yaku.push(YAKU_DEFS.Toitoi);
        if (ankou.length === 3) yaku.push(YAKU_DEFS.Sanankou);
        if (kanMelds.length === 3) yaku.push(YAKU_DEFS.SanKantsu);

        const dragonTriplets = triplets.filter(t => ['z5', 'z6', 'z7'].includes(t[0]));
        if (dragonTriplets.length === 2 && ['z5', 'z6', 'z7'].includes(parsed.pair[0])) yaku.push(YAKU_DEFS.Shousangen);

        triplets.forEach(t => {
            if (t[0] === 'z5') yaku.push(YAKU_DEFS.YakuhaiWhite);
            if (t[0] === 'z6') yaku.push(YAKU_DEFS.YakuhaiGreen);
            if (t[0] === 'z7') yaku.push(YAKU_DEFS.YakuhaiRed);
        });

        if (handWithKans.every(t => t[0] !== 'z' && !['1', '9'].includes(t.substring(1)))) yaku.push(YAKU_DEFS.Tanyao);

        const hasTerminalsOrHonors = (m: Meld) => m.some(t => t[0] === 'z' || ['1', '9'].includes(t.substring(1)));
        if (allMelds.every(hasTerminalsOrHonors) && hasTerminalsOrHonors(parsed.pair)) {
            if (handWithKans.every(t => t[0] === 'z' || ['1', '9'].includes(t.substring(1)))) yaku.push(YAKU_DEFS.Honroutou);
            else yaku.push(YAKU_DEFS.Honchantaiyao);
        } else if (allMelds.every(m => m.length === 3 && !m.some(t => t[0] === 'z') && hasTerminalsOrHonors(m)) && ['1', '9'].includes(parsed.pair[0][1]) && handWithKans.every(t => t[0] !== 'z')) {
            yaku.push(YAKU_DEFS.Junchan);
        }

        const sequencesBySuit: { [key in Suit]?: Set<string> } = {};
        allMelds.filter(m => m.length === 3 && m[0] !== m[1]).forEach(m => {
            const suit = m[0][0] as Suit;
            if (!sequencesBySuit[suit]) sequencesBySuit[suit] = new Set();
            sequencesBySuit[suit]!.add(m[0][1]);
        });
        for (const suit in sequencesBySuit) {
            if (['1', '4', '7'].every(start => sequencesBySuit[suit as Suit]!.has(start))) { yaku.push(YAKU_DEFS.Ikkitsuukan); break; }
        }

        const sequencesByStartNum: { [key: string]: Set<Suit> } = {};
        allMelds.filter(m => m.length === 3 && m[0] !== m[1]).forEach(m => {
            const startNum = m[0][1];
            if (!sequencesByStartNum[startNum]) sequencesByStartNum[startNum] = new Set();
            sequencesByStartNum[startNum].add(m[0][0] as Suit);
        });
        for (const startNum in sequencesByStartNum) {
            if (sequencesByStartNum[startNum].size === 3 && ['m', 'p', 's'].every(s => sequencesByStartNum[startNum].has(s as Suit))) { yaku.push(YAKU_DEFS.SanshokuDoujun); break; }
        }

        const tripletsByNum: { [key: string]: Set<Suit> } = {};
        triplets.forEach(m => {
            const num = m[0].substring(1);
            if (!tripletsByNum[num]) tripletsByNum[num] = new Set();
            tripletsByNum[num].add(m[0][0] as Suit);
        });
        for (const num in tripletsByNum) {
            if (tripletsByNum[num].size === 3 && ['m', 'p', 's'].every(s => tripletsByNum[num].has(s as Suit))) { yaku.push(YAKU_DEFS.SanshokuDoukou); break; }
        }

        const allSuits = new Set(handWithKans.map(t => t[0]));
        if (allSuits.size === 1 && !allSuits.has('z')) yaku.push(YAKU_DEFS.Chinitsu);
        else if (allSuits.size === 2 && allSuits.has('z')) yaku.push(YAKU_DEFS.Honitsu);
    }

    if (isRiichi) yaku.push(YAKU_DEFS.Riichi);
    if (isRiichi && isIppatsu) yaku.push(YAKU_DEFS.Ippatsu);
    if (wall.length === 0) yaku.push(YAKU_DEFS.Haitei);
    if (isRinshan) yaku.push(YAKU_DEFS.Rinshan);

    if (yaku.length === 0) return null;

    let uniqueYaku = [...new Map(yaku.map(item => [item['name'], item])).values()];
    if (uniqueYaku.some(y => y.name === '二盃口')) uniqueYaku = uniqueYaku.filter(y => y.name !== '一盃口');
    if (uniqueYaku.some(y => y.name === '純全帯幺九')) uniqueYaku = uniqueYaku.filter(y => y.name !== '混全帯幺九');
    if (uniqueYaku.some(y => y.name === '清一色')) uniqueYaku = uniqueYaku.filter(y => y.name !== '混一色');

    const handWithKans = looseHand.concat(kanMelds.flat());
    const { doraCount, uraDoraCount } = calculateDora(handWithKans, isRiichi, doraIndicators, uraDoraIndicators);
    const han = uniqueYaku.reduce((sum, y) => sum + y.han, 0) + doraCount + uraDoraCount;

    let fu = 20;
    const parsed = parseHand(looseHand, requiredMelds);
    if (uniqueYaku.some(y => y.name === '七対子')) {
        fu = 25;
    } else if (parsed) {
        fu = calculateFu(parsed, winningTile, gameState, uniqueYaku);
    }

    if (doraCount > 0) uniqueYaku.push({ name: 'ドラ', han: doraCount });
    // 裏ドラはリーチ時のみ加算
    if (isRiichi) uniqueYaku.push({ name: '裏ドラ', han: uraDoraCount });

    return { yaku: uniqueYaku, han, fu, isYakuman: false };
};

const checkYakuman = (looseHand: Tile[], winningTile: Tile, gameState: GameState): YakuResult | null => {
    // ... (same as before)
    const { kanMelds } = gameState;
    const yaku: Yaku[] = [];
    const handWithKans = looseHand.concat(kanMelds.flat());
    const requiredMelds = 4 - kanMelds.length;

    const isWinShape = isWinningHand(looseHand, kanMelds);
    const isSpecialShapePossible = kanMelds.length === 0 && looseHand.length === 14;

    if (kanMelds.length === 4) {
        // Need to ensure the hand is actually complete with a pair
        if (looseHand.length === 2 && looseHand[0] === looseHand[1]) {
            yaku.push(YAKU_DEFS.SuuKantsu);
        }
    }

    if (!isWinShape && !isSpecialShapePossible && yaku.length === 0) return null;


    if (isWinShape && !isSpecialShapePossible) { // Check standard shape Yakuman
        const parsed = parseHand(looseHand, requiredMelds);
        if (parsed) {
            const ankouCount = parsed.melds.filter(m => m.length === 3 && m[0] === m[1]).length + kanMelds.length;
            if (ankouCount === 4) {
                if (parsed.pair[0] === winningTile) yaku.push(YAKU_DEFS.SuuankouTanki);
                else yaku.push(YAKU_DEFS.Suuankou);
            }
            const tripletsAndKans = parsed.melds.concat(kanMelds).filter(m => (m.length === 3 || m.length === 4) && m[0] === m[1]);
            const dragonTripletsCount = tripletsAndKans.filter(t => ['z5', 'z6', 'z7'].includes(t[0])).length;
            if (dragonTripletsCount === 3) yaku.push(YAKU_DEFS.Daisangen);
        }
    }

    if (isSpecialShapePossible) { // Check Kokushi / Chuuren
        const counts = countTiles(looseHand);
        const kokushiTiles = new Set(['m1', 'm9', 'p1', 'p9', 's1', 's9', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7']);
        const handSet = new Set(looseHand);
        if (handSet.size >= 13 && [...kokushiTiles].every(t => counts[t] >= 1) && looseHand.length === 14) {
            const pairTile = Object.keys(counts).find(tile => counts[tile] === 2);
            if (pairTile === winningTile) yaku.push(YAKU_DEFS.Kokushi13);
            else yaku.push(YAKU_DEFS.Kokushi);
        }
        const suits = new Set(looseHand.map(t => t[0]));
        if (suits.size === 1 && !suits.has('z')) {
            const suit = suits.values().next().value as Suit;
            const counts = countTiles(looseHand.filter(t => t[0] === suit));
            const required: { [key: string]: number } = { '1': 3, '2': 1, '3': 1, '4': 1, '5': 1, '6': 1, '7': 1, '8': 1, '9': 3 };
            let isChuurenShape = true;
            let totalTilesInSuit = 0;
            for (let i = 1; i <= 9; i++) {
                const tileNum = i.toString();
                const tile = `${suit}${tileNum}`;
                const count = counts[tile] || 0;
                totalTilesInSuit += count;
                if (count < required[tileNum]) { isChuurenShape = false; break; }
            }
            if (isChuurenShape && totalTilesInSuit === 14) {
                const winningNum = parseInt(winningTile.substring(1));
                if ((counts[winningTile] || 0) === required[winningNum.toString()] + 1) yaku.push(YAKU_DEFS.JunseiChuuren);
                else yaku.push(YAKU_DEFS.Chuuren);
            }
        }
    }

    if (handWithKans.every(t => t[0] === 'z')) yaku.push(YAKU_DEFS.Tsuuiisou);
    const greenTiles = new Set(['s2', 's3', 's4', 's6', 's8', 'z6']);
    if (handWithKans.every(t => greenTiles.has(t))) yaku.push(YAKU_DEFS.Ryuuiisou);
    if (handWithKans.every(t => t[0] !== 'z' && ['1', '9'].includes(t.substring(1)))) yaku.push(YAKU_DEFS.Chinroutou);

    if (yaku.length > 0) {
        const uniqueYakuman = [...new Map(yaku.map(item => [item['name'], item])).values()];
        const totalHan = uniqueYakuman.reduce((sum, y) => sum + y.han, 0);
        return { yaku: uniqueYakuman, han: totalHan, fu: 0, isYakuman: true };
    }
    return null;
};

const calculateDora = (handWithKans: Tile[], isRiichi: boolean, doraIndicators: Tile[], uraDoraIndicators: Tile[]): { doraCount: number, uraDoraCount: number } => {
    // ... (same as before)
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
    // ... (same as before)
    const { kanMelds } = gameState;
    const isConcealed = true; // Assume concealed
    const hasTsumo = yaku.some(y => y.name === '門前清自摸和');
    const isPinfu = yaku.some(y => y.name === '平和');
    if (isPinfu && hasTsumo) return 20;
    if (isPinfu && !hasTsumo) return 30;
    if (yaku.some(y => y.name === '七対子')) return 25;
    let fu = 20;
    if (hasTsumo) fu += 2;
    else if (isConcealed) fu += 10;
    parsed.melds.forEach(m => {
        if (m.length === 3 && m[0] === m[1]) {
            const isTerminalOrHonor = ['1', '9'].includes(m[0].substring(1)) || m[0][0] === 'z';
            fu += isTerminalOrHonor ? 8 : 4;
        }
    });
    kanMelds.forEach(m => {
        const isTerminalOrHonor = ['1', '9'].includes(m[0].substring(1)) || m[0][0] === 'z';
        fu += isTerminalOrHonor ? 32 : 16;
    });
    if (['z5', 'z6', 'z7'].includes(parsed.pair[0])) fu += 2;
    if (parsed.pair[0] === winningTile) {
        fu += 2;
    } else {
        const winningMeld = parsed.melds.find(m => m.includes(winningTile));
        if (winningMeld) {
            if (winningMeld.length === 3 && winningMeld[0] !== winningMeld[1]) {
                const sortedMeld = [...winningMeld]; sortHand(sortedMeld);
                if (sortedMeld[1] === winningTile) fu += 2;
                else if ((winningTile === `${sortedMeld[0][0]}3` && sortedMeld[0][1] === '1') ||
                    (winningTile === `${sortedMeld[2][0]}7` && sortedMeld[2][1] === '9')) {
                    fu += 2;
                }
            }
        }
    }
    if (fu === 20 && !isPinfu && !hasTsumo && kanMelds.length > 0) fu = 30;
    if (fu === 22 && hasTsumo && !isPinfu && kanMelds.length === 0) fu = 30;
    return Math.ceil(fu / 10) * 10;
}

export const calculateScore = (han: number, fu: number, isYakuman = false): { name: string, ko_ron: string, oya_ron: string, ko_tsumo: string, oya_tsumo: string } => {
    // ... (same as before)
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
    if (fu === 0 && han > 0) {
        console.error("Score calculation error: Fu is 0 for non-yakuman hand.");
        return { name: '満貫', ko_ron: '8000', oya_ron: '12000', ko_tsumo: '4000/2000', oya_tsumo: '4000 All' };
    }
    if (fu === 0) return { name: '', ko_ron: '0', oya_ron: '0', ko_tsumo: '0', oya_tsumo: '0' };
    const base = fu * Math.pow(2, han + 2);
    if (base >= 2000) {
        return { name: '満貫', ko_ron: '8000', oya_ron: '12000', ko_tsumo: '4000/2000', oya_tsumo: '4000 All' };
    }
    const ko_ron = ceil100(base * 4);
    const oya_ron = ceil100(base * 6);
    const ko_tsumo_oya = ceil100(base * 2);
    const ko_tsumo_ko = ceil100(base);
    const oya_tsumo = ceil100(base * 2);
    return { name: '', ko_ron: `${ko_ron}`, oya_ron: `${oya_ron}`, ko_tsumo: `${ko_tsumo_oya}/${ko_tsumo_ko}`, oya_tsumo: `${oya_tsumo} All` };
};

