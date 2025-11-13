import React from 'react';
import { GameStatistics } from '../types/mahjong';

interface GameStatsProps {
    stats: GameStatistics;
    currentScore: number;
    targetScore: number;
    onResetStats?: () => void;
}

const GameStats: React.FC<GameStatsProps> = ({ stats, currentScore, targetScore, onResetStats }) => {
    const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : '0.0';
    const progressPercentage = Math.min((currentScore / targetScore) * 100, 100);

    return (
        <div className="bg-emerald-800/50 p-4 rounded-lg shadow-md mb-4 animate-fadeIn">
            {/* Progress bar for target score */}
            <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-300">目標達成まで</span>
                    <span className="text-xs text-yellow-300 font-bold">{currentScore} / {targetScore}点</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                        className="bg-gradient-to-r from-green-500 to-yellow-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-emerald-900/50 p-3 rounded hover:bg-emerald-900/70 transition-colors">
                    <div className="text-xs text-gray-300 mb-1">現在のスコア</div>
                    <div className="text-2xl font-bold text-yellow-300">{currentScore}</div>
                    <div className="text-xs text-gray-400 mt-1">目標: {targetScore}</div>
                </div>
                <div className="bg-emerald-900/50 p-3 rounded hover:bg-emerald-900/70 transition-colors">
                    <div className="text-xs text-gray-300 mb-1">勝率</div>
                    <div className="text-2xl font-bold text-green-300">{winRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">{stats.wins}勝 / {stats.totalGames}戦</div>
                </div>
                <div className="bg-emerald-900/50 p-3 rounded hover:bg-emerald-900/70 transition-colors">
                    <div className="text-xs text-gray-300 mb-1">最高得点</div>
                    <div className="text-2xl font-bold text-blue-300">{stats.highScore}</div>
                    <div className="text-xs text-gray-400 mt-1">累計: {stats.totalScore}</div>
                </div>
                <div className="bg-emerald-900/50 p-3 rounded hover:bg-emerald-900/70 transition-colors">
                    <div className="text-xs text-gray-300 mb-1">連勝</div>
                    <div className="text-2xl font-bold text-purple-300">{stats.consecutiveWins}</div>
                    <div className="text-xs text-gray-400 mt-1">最高: {stats.maxConsecutiveWins}</div>
                </div>
            </div>

            {onResetStats && stats.totalGames > 0 && (
                <div className="mt-3 text-center">
                    <button
                        onClick={onResetStats}
                        className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                    >
                        統計をリセット
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameStats;
