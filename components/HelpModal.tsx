import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white text-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-center">一人麻雀 - 遊び方</h2>

                <div className="space-y-4">
                    <section>
                        <h3 className="text-lg font-bold mb-2 text-blue-600">ゲームの目的</h3>
                        <p className="text-sm">
                            目標点数に到達することを目指します。和了（アガリ）すると得点が加算され、流局すると次のゲームに進みます。
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-2 text-blue-600">基本ルール</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>13枚の手牌と1枚のツモ牌で和了形を目指します</li>
                            <li>和了形は「3枚×4組＋2枚（雀頭）」または特殊形（七対子、国士無双）</li>
                            <li>和了するには役が必要です</li>
                            <li>山が尽きると流局（引き分け）です</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-2 text-blue-600">操作方法</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li><strong>牌をクリック:</strong> 捨て牌を選択</li>
                            <li><strong>カン:</strong> 同じ牌が4枚揃ったときに宣言</li>
                            <li><strong>リーチ:</strong> テンパイ時に宣言（役が付きます）</li>
                            <li><strong>ツモ:</strong> 和了形が完成したときに宣言</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-2 text-blue-600">主な役</h3>
                        <div className="text-sm space-y-1">
                            <div className="grid grid-cols-2 gap-2">
                                <div><strong>立直（リーチ）:</strong> 1飜</div>
                                <div><strong>門前清自摸和:</strong> 1飜</div>
                                <div><strong>断么九（タンヤオ）:</strong> 1飜</div>
                                <div><strong>平和（ピンフ）:</strong> 1飜</div>
                                <div><strong>一盃口:</strong> 1飜</div>
                                <div><strong>役牌:</strong> 1飜</div>
                                <div><strong>対々和:</strong> 2飜</div>
                                <div><strong>七対子:</strong> 2飜</div>
                                <div><strong>混一色:</strong> 3飜</div>
                                <div><strong>清一色:</strong> 6飜</div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-2 text-blue-600">ドラ</h3>
                        <p className="text-sm">
                            ドラ表示牌の次の牌がドラとなり、手牌にあると1枚につき1飜加算されます。<br/>
                            リーチ後の和了では裏ドラも確認できます。
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold mb-2 text-blue-600">得点計算</h3>
                        <p className="text-sm">
                            飜数と符によって得点が決まります。役満は別格の高得点です。<br/>
                            詳しい点数表は和了時のモーダルで確認できます。
                        </p>
                    </section>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
