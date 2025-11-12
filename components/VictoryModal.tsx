import React from 'react';
import { GameStatistics } from '../types/mahjong';

interface VictoryModalProps {
    isOpen: boolean;
    currentScore: number;
    targetScore: number;
    stats: GameStatistics;
    onRestart: () => void;
    onContinue: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, currentScore, targetScore, stats, onRestart, onContinue }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 text-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-2 text-yellow-800">目標達成！</h2>
                    <p className="text-xl mb-6">おめでとうございます！</p>

                    <div className="bg-white p-4 rounded-lg shadow-inner mb-6">
                        <div className="text-sm text-gray-600 mb-1">最終スコア</div>
                        <div className="text-4xl font-bold text-green-600 mb-2">{currentScore}</div>
                        <div className="text-sm text-gray-600">目標: {targetScore}点</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-inner mb-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-xs text-gray-500">勝率</div>
                                <div className="text-lg font-bold text-blue-600">
                                    {stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : '0'}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">連勝</div>
                                <div className="text-lg font-bold text-purple-600">{stats.consecutiveWins}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">総ゲーム数</div>
                                <div className="text-lg font-bold text-gray-700">{stats.totalGames}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">最高得点</div>
                                <div className="text-lg font-bold text-orange-600">{stats.highScore}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onContinue}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            続ける（さらに高得点を目指す）
                        </button>
                        <button
                            onClick={onRestart}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                        >
                            新しく始める
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VictoryModal;
