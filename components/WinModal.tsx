import React from 'react';
import MahjongTile from './MahjongTile';
import { calculateScore } from '../lib/mahjongLogic';
import { Tile, YakuResult, Meld } from '../types/mahjong';
import * as logic from '../lib/mahjongLogic';

interface WinModalProps {
    result: YakuResult;
    hand: Tile[];
    kanMelds: Meld[];
    doraIndicators: Tile[];
    uraDoraIndicators: Tile[];
    isRiichi: boolean;
    onClose: () => void;
    onRestart: () => void; // Add restart function prop
}

const WinModal: React.FC<WinModalProps> = ({ result, hand, kanMelds, doraIndicators, uraDoraIndicators, isRiichi, onClose, onRestart }) => {
    if (!result) return null;

    const { yaku, han, fu, isYakuman } = result;
    const score = calculateScore(han, fu, isYakuman);

    const handleRestartClick = () => {
        onRestart(); // Call the restart function passed from parent
        onClose(); // Close the modal
    }
    const displayHand = [...hand];
    logic.sortHand(displayHand);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl max-w-none w-full" onClick={e => e.stopPropagation()}>
                <p className="text-2xl font-bold mb-4 text-center">{isYakuman ? '役満！おめでとう！' : 'アガリ！おめでとう！'}</p>

                {/* Display Winning Hand including Kans */}
                <div className="flex justify-center items-center space-x-1 mb-4">
                {/* Display Kans */}
                {kanMelds.map((meld, meldIndex) => (
                    <div key={`kan-${meldIndex}`} className="flex space-x-1">
                    <MahjongTile tile="back" isKan/>
                    <MahjongTile tile={meld[1]} isKan/>
                    <MahjongTile tile={meld[2]} isKan/>
                    <MahjongTile tile="back" isKan/>
                    </div>
                ))}
                {/* Display Loose Hand */}
                <div className='flex space-x-1'>
                    {displayHand.map((tile, index) => <MahjongTile key={`loose-${index}`} tile={tile} />)}
                </div>
                
                </div>

                <div className="text-left bg-gray-100 p-3 rounded">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <div className="flex items-center">
                            <span className="mr-2 font-bold text-sm">ドラ表示:</span>
                            <div className="flex space-x-1">
                                {doraIndicators.map((t, i) => <MahjongTile key={`dora-${i}`} tile={t} isDiscarded />)}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2 font-bold text-sm">裏ドラ表示:</span>
                            <div className="flex space-x-1">
                                {uraDoraIndicators.slice(0, doraIndicators.length).map((t, i) => <MahjongTile key={`ura-${i}`} tile={isRiichi ? t : 'back'} isDiscarded />)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {yaku.map((y, i) => (
                            <React.Fragment key={i}>
                                <div>{y.name}</div>
                                <div className="text-right">{y.yakuman ? '役満' : `${y.han}飜`}</div>
                            </React.Fragment>
                        ))}
                    </div>

                    <hr className="my-2" />

                    <p className="text-right font-bold text-lg">{isYakuman ? score.name : `${fu}符 ${han}飜 ${score.name || ''}`}</p>

                    <div className="mt-2 text-right">
                        <div className="text-sm">子: <span className="font-mono">{score.ko_ron}</span> (<span className="font-mono">{score.ko_tsumo}</span>)</div>
                        <div className="text-sm">親: <span className="font-mono">{score.oya_ron}</span> (<span className="font-mono">{score.oya_tsumo}</span>)</div>
                    </div>
                </div>

                {/* Add New Game Button */}
                <div className="mt-4 text-center">
                    <button
                        onClick={handleRestartClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                        新しく始める
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WinModal;

