import React, { useState } from 'react';

export interface GameSettings {
    targetScore: number;
    difficulty: 'easy' | 'normal' | 'hard';
}

interface SettingsModalProps {
    isOpen: boolean;
    currentSettings: GameSettings;
    onClose: () => void;
    onApply: (settings: GameSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, currentSettings, onClose, onApply }) => {
    const [settings, setSettings] = useState<GameSettings>(currentSettings);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(settings);
        onClose();
    };

    const difficultySettings = {
        easy: { targetScore: 500, label: '簡単（目標: 500点）' },
        normal: { targetScore: 1000, label: '普通（目標: 1000点）' },
        hard: { targetScore: 2000, label: '難しい（目標: 2000点）' },
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-center">ゲーム設定</h2>

                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2">難易度</label>
                    <div className="space-y-2">
                        {(['easy', 'normal', 'hard'] as const).map((diff) => (
                            <label key={diff} className="flex items-center cursor-pointer p-3 bg-gray-100 rounded hover:bg-gray-200">
                                <input
                                    type="radio"
                                    name="difficulty"
                                    value={diff}
                                    checked={settings.difficulty === diff}
                                    onChange={(e) => setSettings({
                                        difficulty: e.target.value as 'easy' | 'normal' | 'hard',
                                        targetScore: difficultySettings[e.target.value as 'easy' | 'normal' | 'hard'].targetScore
                                    })}
                                    className="mr-3 w-4 h-4"
                                />
                                <span>{difficultySettings[diff].label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded mb-4">
                    <p className="text-sm text-gray-700">
                        <strong>ルール:</strong> 目標点数に到達するとゲームクリア！<br/>
                        流局になると次のゲームに進みます。
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        適用
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
