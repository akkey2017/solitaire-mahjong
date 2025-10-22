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
  gameMessage: '新しいゲームを開始してください。', winResult: null,
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const startGame = useCallback(() => {
    const initialState = logic.initializeGame();
    setGameState({
      ...initialState,
      dora: logic.calculateDoraTiles(initialState.doraIndicators),
      gameMessage: 'ゲーム開始！',
      winResult: null,
    });
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

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
        isIppatsu: false
      };

      if (nextState.isRiichiDeclaration) {
        nextState.isRiichi = true;
        nextState.isIppatsu = true;
        nextState.isRiichiDeclaration = false;
        nextState.validRiichiDiscards = new Set();
      }

      return nextState;
    });
  }, []);

  // Effect to automatically draw tile after a discard
  useEffect(() => {
    if (!gameState.drawnTile && !gameState.isGameOver) {
      const timer = setTimeout(drawTile, 100);
      return () => clearTimeout(timer);
    }
  }, [gameState.drawnTile, gameState.isGameOver, drawTile]);

  // Effect for automatic play during Riichi
  useEffect(() => {
    if (gameState.isRiichi && gameState.drawnTile && !gameState.isGameOver && !gameState.winResult) {
      const fullHand = [...gameState.hand, gameState.drawnTile];
      if (!logic.isWinningHand(fullHand, gameState.kanMelds)) {
        const timer = setTimeout(() => discardTile(null, true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.isRiichi, gameState.drawnTile, gameState.hand, gameState.kanMelds, gameState.isGameOver, discardTile, gameState.winResult]);


  const handleRiichi = useCallback(() => {
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
    if (!gameState.drawnTile) return;
    const kanOptions = logic.findKanOptions(gameState.hand, gameState.drawnTile);
    if (kanOptions.length === 0) return;

    const tileToKan = kanOptions[0];

    setGameState(prev => {
      const { newHand, newKanMelds } = logic.performKan(prev.hand, prev.drawnTile!, tileToKan, prev.kanMelds);
      const { newRinshan, tile: rinshanTile } = logic.drawFromRinshan(prev.rinshanTiles);

      const newDoraIndicator = prev.wangpai[4 + newKanMelds.length - 1];
      const newUraDoraIndicator = prev.wangpai[5 + newKanMelds.length - 1];

      const newDoraIndicators = [...prev.doraIndicators, newDoraIndicator].filter(Boolean);

      return {
        ...prev,
        hand: newHand,
        drawnTile: rinshanTile,
        kanMelds: newKanMelds,
        rinshanTiles: newRinshan,
        doraIndicators: newDoraIndicators,
        uraDoraIndicators: [...prev.uraDoraIndicators, newUraDoraIndicator].filter(Boolean),
        dora: logic.calculateDoraTiles(newDoraIndicators),
        isRinshan: true,
      };
    });
  }, []);

  const handleTsumo = useCallback(() => {
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
    if (gameState.isRiichi || !gameState.drawnTile) return;

    if (gameState.isRiichiDeclaration) {
      const discardIdentifier = isDrawnClick ? gameState.hand.length : index;
      if (gameState.validRiichiDiscards.has(discardIdentifier)) {
        discardTile(index, isDrawnClick);
      } else {
        setGameState(prev => ({ ...prev, isRiichiDeclaration: false, validRiichiDiscards: new Set(), gameMessage: '' }));
      }
    } else {
      discardTile(index, isDrawnClick);
    }
  }, [gameState.isRiichi, gameState.drawnTile, gameState.isRiichiDeclaration, gameState.hand.length, gameState.validRiichiDiscards, discardTile]);

  const { hand, drawnTile, discards, wall, dora, kanMelds, gameMessage, winResult, doraIndicators, uraDoraIndicators, isRiichiDeclaration, validRiichiDiscards } = gameState;

  return (
    <main className="mahjong-table text-white container mx-auto p-4 flex flex-col min-h-screen">
      <header className="text-center mb-2">
        <h1 className="text-3xl font-bold">一人麻雀 (TypeScript版)</h1>
        <p id="wall-count" className="text-lg mt-1">山の残り牌: {wall.length}</p>
        <p id="game-message" className="text-amber-300 font-bold h-6">{gameMessage}</p>
      </header>

      <ActionButtons
        onKan={handleKan}
        onRiichi={handleRiichi}
        onTsumo={handleTsumo}
        onRestart={startGame}
        gameState={gameState}
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
          hand={drawnTile ? [...hand, drawnTile] : hand}
          doraIndicators={doraIndicators}
          uraDoraIndicators={uraDoraIndicators}
          isRiichi={gameState.isRiichi}
          onClose={() => setGameState(prev => ({ ...prev, winResult: null }))}
        />
      )}
    </main>
  );
}

