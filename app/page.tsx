'use client';

import { useState, useEffect, useCallback } from 'react';
import * as logic from '../lib/mahjongLogic';
import ActionButtons from '../components/ActionButtons';
import DiscardPile from '../components/DiscardPile';
import HandDisplay from '../components/HandDisplay';
import WangpaiDisplay from '../components/WangpaiDisplay';
import WinModal from '../components/WinModal';
import GameStats from '../components/GameStats';
import SettingsModal, { GameSettings } from '../components/SettingsModal';
import HelpModal from '../components/HelpModal';
import VictoryModal from '../components/VictoryModal';
import { GameState, Tile, GameStatistics } from '../types/mahjong';

const initialGameState: GameState = {
  wall: [], hand: [], discards: [], wangpai: [], rinshanTiles: [],
  doraIndicators: [], uraDoraIndicators: [], dora: [], kanMelds: [],
  drawnTile: null, isGameOver: true, isRiichi: false, isIppatsu: false,
  isRinshan: false, isRiichiDeclaration: false, validRiichiDiscards: new Set(),
  gameMessage: 'ボタンを押してゲームを開始してください。', winResult: null,
  currentScore: 0, targetScore: 1000,
};

const initialStats: GameStatistics = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  totalScore: 0,
  highScore: 0,
  consecutiveWins: 0,
  maxConsecutiveWins: 0,
};

export default function Home() {
  // Load stats and settings from localStorage using lazy initializer
  const [stats, setStats] = useState<GameStatistics>(() => {
    if (typeof window !== 'undefined') {
      const savedStats = localStorage.getItem('mahjong-stats');
      if (savedStats) {
        return JSON.parse(savedStats);
      }
    }
    return initialStats;
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('mahjong-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return { targetScore: 1000, difficulty: 'normal' };
  });

  const [gameState, setGameState] = useState<GameState>(() => ({
    ...initialGameState,
    targetScore: settings.targetScore,
  }));

  const [validRiichiKanTile, setValidRiichiKanTile] = useState<Tile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showVictory, setShowVictory] = useState(false);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahjong-stats', JSON.stringify(stats));
    }
  }, [stats]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mahjong-settings', JSON.stringify(settings));
    }
  }, [settings]);

  const startGame = useCallback(() => {
    const initialState = logic.initializeGame();
    setGameState({
      ...initialState,
      dora: logic.calculateDoraTiles(initialState.doraIndicators),
      gameMessage: 'ゲーム開始！',
      winResult: null,
      currentScore: gameState.currentScore,
      targetScore: settings.targetScore,
    });
    setValidRiichiKanTile(null);
  }, [gameState.currentScore, settings.targetScore]);

  const resetGame = useCallback(() => {
    const initialState = logic.initializeGame();
    setGameState({
      ...initialState,
      dora: logic.calculateDoraTiles(initialState.doraIndicators),
      gameMessage: 'ゲーム開始！',
      winResult: null,
      currentScore: 0,
      targetScore: settings.targetScore,
    });
    setValidRiichiKanTile(null);
    setShowVictory(false);
  }, [settings.targetScore]);


  const drawTile = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || prev.drawnTile) return prev;
      if (prev.wall.length === 0) {
        // Handle draw - update statistics
        setStats(prevStats => ({
          ...prevStats,
          totalGames: prevStats.totalGames + 1,
          losses: prevStats.losses + 1,
          consecutiveWins: 0, // Reset consecutive wins on draw
        }));
        return { ...prev, isGameOver: true, gameMessage: '流局です。次のゲームを開始してください。' };
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
      const revealedDoraCount = prev.doraIndicators.length; // Number of currently shown indicators (starts at 1)
      const doraIndicatorIndexToAdd = 4 + revealedDoraCount * 2; // Index for the *next* Dora indicator (1st Kan: 4+1*2=6, 2nd Kan: 4+2*2=8)
      const uraIndicatorIndexToAdd = 5 + revealedDoraCount * 2; // Index for the *next* Ura indicator (1st Kan: 5+1*2=7, 2nd Kan: 5+2*2=9)

      const newDoraIndicator = prev.wangpai.length > doraIndicatorIndexToAdd ? prev.wangpai[doraIndicatorIndexToAdd] : null;
      const newUraDoraIndicator = prev.wangpai.length > uraIndicatorIndexToAdd ? prev.wangpai[uraIndicatorIndexToAdd] : null;

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
    if (!gameState.drawnTile) return;
    const fullHand = [...gameState.hand, gameState.drawnTile];
    if (logic.isWinningHand(fullHand, gameState.kanMelds)) {
      const result = logic.checkYaku(fullHand, gameState.drawnTile, gameState);
      if (result && result.yaku.length > 0) {
        const score = logic.calculateScore(result.han, result.fu, result.isYakuman);
        const pointsWon = score.ko_tsumo; // Use ko_tsumo for scoring
        
        setGameState(prev => ({ 
          ...prev, 
          isGameOver: true, 
          winResult: result, 
          gameMessage: 'ツモ！',
          currentScore: prev.currentScore + pointsWon
        }));

        // Update statistics
        setStats(prev => {
          const newConsecutiveWins = prev.consecutiveWins + 1;
          return {
            ...prev,
            totalGames: prev.totalGames + 1,
            wins: prev.wins + 1,
            totalScore: prev.totalScore + pointsWon,
            highScore: Math.max(prev.highScore, pointsWon),
            consecutiveWins: newConsecutiveWins,
            maxConsecutiveWins: Math.max(prev.maxConsecutiveWins, newConsecutiveWins),
          };
        });

        // Check for victory
        if (gameState.currentScore + pointsWon >= settings.targetScore) {
          setTimeout(() => setShowVictory(true), 1500);
        }
      } else {
        setGameState(prev => ({ ...prev, gameMessage: 'アガリ形ですが、役がありません。', winResult: null }));
      }
    } else {
      setGameState(prev => ({ ...prev, gameMessage: 'まだアガれません。' }))
    }
  }, [gameState, settings.targetScore]);

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

  const handleApplySettings = useCallback((newSettings: GameSettings) => {
    setSettings(newSettings);
    setGameState(prev => ({ ...prev, targetScore: newSettings.targetScore }));
  }, []);

  const handleContinueAfterVictory = useCallback(() => {
    setShowVictory(false);
  }, []);

  const handleResetStats = useCallback(() => {
    if (confirm('統計情報をリセットしますか？この操作は取り消せません。')) {
      setStats(initialStats);
      localStorage.removeItem('mahjong-stats');
    }
  }, []);

  const { hand, drawnTile, discards, wall, dora, kanMelds, gameMessage, winResult, doraIndicators, uraDoraIndicators, isRiichiDeclaration, validRiichiDiscards, currentScore, targetScore } = gameState;

  return (
    <main className="mahjong-table text-white container mx-auto p-4 flex flex-col min-h-screen">
      <header className="text-center mb-2">
        <div className="flex justify-between items-center mb-2">
          <button
            onClick={() => setShowHelp(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            ？ヘルプ
          </button>
          <h1 className="text-3xl font-bold">一人麻雀</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            ⚙ 設定
          </button>
        </div>
        <p id="wall-count" className="text-lg mt-1">山の残り牌: {wall.length}</p>
        <p id="game-message" className="text-amber-300 font-bold h-6">{gameMessage}</p>
      </header>

      <GameStats stats={stats} currentScore={currentScore} targetScore={targetScore} onResetStats={handleResetStats} />

      <ActionButtons
        onKan={handleKan}
        onRiichi={handleRiichi}
        onTsumo={handleTsumo}
        onRestart={startGame}
        gameState={gameState}
        validRiichiKanTile={validRiichiKanTile}
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
          kanMelds={kanMelds}
          doraIndicators={doraIndicators}
          uraDoraIndicators={uraDoraIndicators}
          isRiichi={gameState.isRiichi}
          onClose={() => setGameState(prev => ({ ...prev, winResult: null }))}
          onRestart={startGame}
        />
      )}

      <SettingsModal
        isOpen={showSettings}
        currentSettings={settings}
        onClose={() => setShowSettings(false)}
        onApply={handleApplySettings}
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <VictoryModal
        isOpen={showVictory}
        currentScore={currentScore}
        targetScore={targetScore}
        stats={stats}
        onRestart={resetGame}
        onContinue={handleContinueAfterVictory}
      />
    </main>
  );
}

