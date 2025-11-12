import React from 'react';
import { GameStatistics } from '../types/mahjong';

interface GameStatsProps {
    stats: GameStatistics;
    currentScore: number;
    targetScore: number;
}

const GameStats: React.FC<GameStatsProps> = ({ stats, currentScore, targetScore }) => {
    const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : '0.0';

    return (
        <div className="bg-emerald-800/50 p-4 rounded-lg shadow-md mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-emerald-900/50 p-3 rounded">
                    <div className="text-xs text-gray-300 mb-1">現在のスコア</div>
                    <div className="text-2xl font-bold text-yellow-300">{currentScore}</div>
                    <div className="text-xs text-gray-400 mt-1">目標: {targetScore}</div>
                </div>
                <div className="bg-emerald-900/50 p-3 rounded">
                    <div className="text-xs text-gray-300 mb-1">勝率</div>
                    <div className="text-2xl font-bold text-green-300">{winRate}%</div>
                    <div className="text-xs text-gray-400 mt-1">{stats.wins}勝 / {stats.totalGames}戦</div>
                </div>
                <div className="bg-emerald-900/50 p-3 rounded">
                    <div className="text-xs text-gray-300 mb-1">最高得点</div>
                    <div className="text-2xl font-bold text-blue-300">{stats.highScore}</div>
                    <div className="text-xs text-gray-400 mt-1">累計: {stats.totalScore}</div>
                </div>
                <div className="bg-emerald-900/50 p-3 rounded">
                    <div className="text-xs text-gray-300 mb-1">連勝</div>
                    <div className="text-2xl font-bold text-purple-300">{stats.consecutiveWins}</div>
                    <div className="text-xs text-gray-400 mt-1">最高: {stats.maxConsecutiveWins}</div>
                </div>
            </div>
        </div>
    );
};

export default GameStats;
