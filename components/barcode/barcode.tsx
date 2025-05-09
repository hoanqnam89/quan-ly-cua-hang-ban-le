'use client';

import React, { useEffect } from 'react';
import { generateBatchNumber } from '@/utils/batch-number';
import BarcodeDisplay from './index';

interface BarcodeComponentProps {
    productId: string;
    value: string;
    onChange: (value: string) => void;
    showBarcode?: boolean;
}

const BarcodeComponent: React.FC<BarcodeComponentProps> = ({
    productId,
    value,
    onChange,
    showBarcode = false
}) => {
    useEffect(() => {
        // Tự động tạo số lô khi productId thay đổi và không có giá trị
        if (productId && !value) {
            const newBatchNumber = generateBatchNumber(productId);
            onChange(newBatchNumber);
        }
    }, [productId, value, onChange]);

    const handleGenerateBatchNumber = () => {
        if (!productId) {
            alert('Vui lòng chọn sản phẩm trước khi tạo số lô');
            return;
        }

        const newBatchNumber = generateBatchNumber(productId);
        onChange(newBatchNumber);
    };

    return (
        <div className="flex flex-col space-y-2">
            <div className="relative">
                {value ? (
                    <div className="flex items-center">
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 overflow-hidden whitespace-nowrap overflow-ellipsis">
                            {value}
                        </div>
                        <button
                            type="button"
                            onClick={handleGenerateBatchNumber}
                            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
                            title="Tạo lại số lô"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleGenerateBatchNumber}
                        className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Tạo số lô tự động</span>
                    </button>
                )}
            </div>

            {showBarcode && value && (
                <div className="mt-2">
                    <BarcodeDisplay
                        value={value}
                        width={1.5}
                        height={50}
                        displayValue={true}
                        className="border border-gray-300 rounded-lg p-2 bg-white"
                    />
                </div>
            )}
        </div>
    );
};

export default BarcodeComponent; 