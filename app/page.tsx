'use client';

import { useState, useEffect, useCallback } from 'react';
import * as logic from '../lib/mahjongLogic';
import ActionButtons from '../components/ActionButtons';
import DiscardPile from '../components/DiscardPile';
import HandDisplay from '../components/HandDisplay';
import WangpaiDisplay from '../components/WangpaiDisplay';
import WinModal from '../components/WinModal';
import { GameState, Tile } from '../types/mahjong';

const initialGameState: GameState = {
  wall: [], hand: [], discards: [], wangpai: [], rinshanTiles: [],
  doraIndicators: [], uraDoraIndicators: [], dora: [], kanMelds: [],
  drawnTile: null, isGameOver: true, isRiichi: false, isIppatsu: false,
  isRinshan: false, isRiichiDeclaration: false, validRiichiDiscards: new Set(),
  gameMessage: 'ボタンを押してゲームを開始してください。', winResult: null,
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [validRiichiKanTile, setValidRiichiKanTile] = useState<Tile | null>(null); // State for valid Kan during Riichi

  const startGame = useCallback(() => {
    const initialState = logic.initializeGame();
    setGameState({
      ...initialState,
      dora: logic.calculateDoraTiles(initialState.doraIndicators),
      gameMessage: 'ゲーム開始！',
      winResult: null,
    });
    setValidRiichiKanTile(null); // Reset on new game
  }, []);


  const drawTile = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || prev.drawnTile) return prev;
      if (prev.wall.length === 0) {
        return { ...prev, isGameOver: true, gameMessage: '流局です。' };
      }
      const { newWall, tile } = logic.drawFromWall(prev.wall);
      return { ...prev, wall: newWall, drawnTile: tile, isRinshan: false };
    });
  }, []);

  const discardTile = useCallback((tileIndex: number | null, isDrawnTile = false) => {
    setGameState(prev => {
      if (isDrawnTile && !prev.drawnTile) return prev;
      if (!isDrawnTile && (tileIndex === null || !prev.drawnTile)) return prev;

      let tileToDiscard: Tile;
      const newHand = [...prev.hand];

      if (isDrawnTile) {
        tileToDiscard = prev.drawnTile!;
      } else {
        tileToDiscard = newHand.splice(tileIndex!, 1)[0];
        newHand.push(prev.drawnTile!);
        logic.sortHand(newHand);
      }
      const newDiscards = [...prev.discards, tileToDiscard];

      const nextState: GameState = {
        ...prev,
        hand: newHand,
        discards: newDiscards,
        drawnTile: null,
        isIppatsu: false // Reset Ippatsu on any discard after Riichi declaration turn
      };

      // Finalize Riichi declaration AFTER discard
      if (nextState.isRiichiDeclaration) {
        nextState.isRiichi = true;
        nextState.isIppatsu = true; // Set Ippatsu chance
        nextState.isRiichiDeclaration = false;
        nextState.validRiichiDiscards = new Set();
        nextState.gameMessage = "リーチ！"; // Update message after discard
      }

      return nextState;
    });
    setValidRiichiKanTile(null); // Reset possible Kan after discard
  }, []);

  // Effect to automatically draw tile after a discard (if not game over)
  useEffect(() => {
    if (!gameState.drawnTile && !gameState.isGameOver && !gameState.isRiichiDeclaration && !gameState.winResult) {
      // Only draw automatically if not in Riichi declaration phase or game ended
      const timer = setTimeout(drawTile, 100);
      return () => clearTimeout(timer);
    }
  }, [gameState.drawnTile, gameState.isGameOver, gameState.isRiichiDeclaration, gameState.winResult, drawTile]);

  // Effect for automatic play during Riichi
  useEffect(() => {
    // Run only when Riichi is active, a tile is drawn, game is not over, and not currently showing win result
    if (gameState.isRiichi && gameState.drawnTile && !gameState.isGameOver && !gameState.winResult) {
      const fullHand = [...gameState.hand, gameState.drawnTile];

      // 1. Check for Tsumo (Win)
      if (logic.isWinningHand(fullHand, gameState.kanMelds)) {
        // Stop automatic play, let user press Tsumo button
        setTimeout(() => setValidRiichiKanTile(null), 0); // No Kan possible if winning
        return;
      }

      // 2. Check for valid Kan (wait doesn't change)
      const possibleKan = logic.canDeclareKanAfterRiichi(gameState.hand, gameState.drawnTile, gameState.kanMelds);
      if (possibleKan) {
        setTimeout(() => setValidRiichiKanTile(possibleKan), 0); // Allow Kan button
        // Stop automatic play, let user press Kan button
        return;
      }

      // 3. If neither win nor valid Kan, automatically discard
      setTimeout(() => setValidRiichiKanTile(null), 0); // Ensure Kan is not possible
      const timer = setTimeout(() => {
        discardTile(null, true);
      }, 500); // Discard after 0.5 sec delay
      return () => clearTimeout(timer); // Cleanup timer on re-render
    } else {
      // Reset validRiichiKanTile if not in Riichi or no drawn tile etc.
      setTimeout(() => setValidRiichiKanTile(null), 0);
    }
    // Add dependencies: isRiichi, drawnTile, hand, kanMelds, isGameOver, winResult, discardTile
  }, [gameState.isRiichi, gameState.drawnTile, gameState.hand, gameState.kanMelds, gameState.isGameOver, gameState.winResult, discardTile]);


  const handleRiichi = useCallback(() => {
    // ... (logic remains the same)
    if (!gameState.drawnTile) return;
    const { possibleDiscards } = logic.checkRiichi(gameState.hand, gameState.drawnTile, gameState.kanMelds);
    if (possibleDiscards.size > 0) {
      setGameState(prev => ({
        ...prev,
        isRiichiDeclaration: true,
        validRiichiDiscards: possibleDiscards,
        gameMessage: 'リーチ！捨てる牌を選択してください。'
      }));
    }
  }, [gameState.hand, gameState.drawnTile, gameState.kanMelds]);

  const handleKan = useCallback(() => {
    // Handle both normal Kan and Kan during Riichi
    if (!gameState.drawnTile) return;

    let tileToKan: Tile | null = null;
    if (gameState.isRiichi) {
      tileToKan = validRiichiKanTile; // Use the validated tile during Riichi
    } else {
      const kanOptions = logic.findKanOptions(gameState.hand, gameState.drawnTile);
      if (kanOptions.length > 0) {
        tileToKan = kanOptions[0];
      }
    }

    if (!tileToKan) return; // No valid Kan found

    setGameState(prev => {
      // Perform Kan logic needs the hand *before* drawing the Rinshan tile
      const { newHand, newKanMelds } = logic.performKan(prev.hand, prev.drawnTile!, tileToKan!, prev.kanMelds);
      const { newRinshan, tile: rinshanTile } = logic.drawFromRinshan(prev.rinshanTiles);

      // Add new Dora indicator *after* drawing Rinshan
      const newDoraIndicator = prev.wangpai.length >= (5 + newKanMelds.length) ? prev.wangpai[4 + newKanMelds.length - 1] : null;
      const newUraDoraIndicator = prev.wangpai.length >= (6 + newKanMelds.length) ? prev.wangpai[5 + newKanMelds.length - 1] : null;

      const newDoraIndicators = newDoraIndicator ? [...prev.doraIndicators, newDoraIndicator] : prev.doraIndicators;
      const newUraDoraIndicators = newUraDoraIndicator ? [...prev.uraDoraIndicators, newUraDoraIndicator] : prev.uraDoraIndicators;

      return {
        ...prev,
        hand: newHand,
        drawnTile: rinshanTile, // Draw the Rinshan tile
        kanMelds: newKanMelds,
        rinshanTiles: newRinshan,
        doraIndicators: newDoraIndicators,
        uraDoraIndicators: newUraDoraIndicators,
        dora: logic.calculateDoraTiles(newDoraIndicators),
        isRinshan: true,
        isIppatsu: false, // Kan breaks Ippatsu
      };
    });
    setValidRiichiKanTile(null); // Reset after Kan
  }, [gameState.drawnTile, gameState.hand, gameState.isRiichi, validRiichiKanTile]); // Include validRiichiKanTile in dependencies


  const handleTsumo = useCallback(() => {
    // ... (logic remains the same)
    if (!gameState.drawnTile) return;
    const fullHand = [...gameState.hand, gameState.drawnTile];
    if (logic.isWinningHand(fullHand, gameState.kanMelds)) {
      const result = logic.checkYaku(fullHand, gameState.drawnTile, gameState);
      if (result && result.yaku.length > 0) {
        setGameState(prev => ({ ...prev, isGameOver: true, winResult: result, gameMessage: 'ツモ！' }));
      } else {
        setGameState(prev => ({ ...prev, gameMessage: 'アガリ形ですが、役がありません。', winResult: null }));
      }
    } else {
      setGameState(prev => ({ ...prev, gameMessage: 'まだアガれません。' }))
    }
  }, [gameState]);

  const handleTileClick = useCallback((index: number, isDrawnClick = false) => {
    // --- Riichi Specific Logic ---
    if (gameState.isRiichi && gameState.drawnTile) {
      // If clicking the drawn tile during Riichi (and it's a winning tile) -> Discard (Skip Win)
      if (isDrawnClick) {
        const fullHand = [...gameState.hand, gameState.drawnTile];
        // Only allow discarding drawn tile if it *is* a winning tile (to skip)
        // Or if auto-discard failed for some reason
        if (logic.isWinningHand(fullHand, gameState.kanMelds)) {
          discardTile(null, true);
        } else if (!validRiichiKanTile) {
          // Allow discarding if not a win and not a valid Kan (user override auto-discard)
          discardTile(null, true);
        }
        // Do nothing if it's a valid Kan tile - user must press Kan button
        return;
      }
      // Clicking hand tiles during Riichi does nothing
      return;
    }

    // --- Riichi Declaration Logic ---
    if (gameState.isRiichiDeclaration && gameState.drawnTile) {
      const discardIdentifier = isDrawnClick ? gameState.hand.length : index;
      if (gameState.validRiichiDiscards.has(discardIdentifier)) {
        // Set Riichi state *before* discard to trigger correct useEffect behavior
        setGameState(prev => ({ ...prev, isRiichiDeclaration: true })); // Mark intent to Riichi
        discardTile(index, isDrawnClick); // Discard will finalize Riichi state
      } else {
        // Cancel Riichi declaration if invalid tile clicked
        setGameState(prev => ({ ...prev, isRiichiDeclaration: false, validRiichiDiscards: new Set(), gameMessage: '' }));
      }
      return;
    }

    // --- Normal Discard Logic ---
    if (!gameState.drawnTile) return; // Cannot discard if no tile drawn
    discardTile(index, isDrawnClick);

  }, [gameState, discardTile, validRiichiKanTile]);
  const { hand, drawnTile, discards, wall, dora, kanMelds, gameMessage, winResult, doraIndicators, uraDoraIndicators, isRiichiDeclaration, validRiichiDiscards } = gameState;

  return (
    <main className="mahjong-table text-white container mx-auto p-4 flex flex-col min-h-screen">
      <header className="text-center mb-2">
        <h1 className="text-3xl font-bold">一人麻雀</h1>
        <p id="wall-count" className="text-lg mt-1">山の残り牌: {wall.length}</p>
        <p id="game-message" className="text-amber-300 font-bold h-6">{gameMessage}</p>
      </header>

      <ActionButtons
        onKan={handleKan}
        onRiichi={handleRiichi}
        onTsumo={handleTsumo}
        onRestart={startGame}
        gameState={gameState}
        validRiichiKanTile={validRiichiKanTile} // Pass down the valid Kan tile
      />

      <WangpaiDisplay doraIndicators={doraIndicators} />

      <DiscardPile discards={discards} />

      <div className="bg-emerald-900/50 p-4 rounded-lg shadow-inner mt-auto">
        <h2 className="text-center text-sm mb-3 text-gray-300">手牌</h2>
        <HandDisplay
          hand={hand}
          drawnTile={drawnTile}
          kanMelds={kanMelds}
          dora={dora}
          isRiichiDeclaration={isRiichiDeclaration}
          validRiichiDiscards={validRiichiDiscards}
          onTileClick={handleTileClick}
        />
      </div>

      {winResult && (
        <WinModal
          result={winResult}
          hand={drawnTile ? [...hand, drawnTile] : hand} // Show winning tile in modal hand
          doraIndicators={doraIndicators}
          uraDoraIndicators={uraDoraIndicators}
          isRiichi={gameState.isRiichi}
          onClose={() => setGameState(prev => ({ ...prev, winResult: null }))}
          onRestart={startGame}
        />
      )}
    </main>
  );
}

