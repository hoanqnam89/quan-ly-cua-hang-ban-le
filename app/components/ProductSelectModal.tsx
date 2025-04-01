'use client';

import { IProduct } from '../interfaces/product.interface';
import { formatCurrency } from '../utils/format';
import Image from 'next/image';
import { useState } from 'react';

interface ProductSelectModalProps {
    product: IProduct | null;
    onClose: () => void;
    onAdd: (product: IProduct, quantity: number) => void;
}

export default function ProductSelectModal({ product, onClose, onAdd }: ProductSelectModalProps) {
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(product, quantity);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg mx-4">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Thêm sản phẩm</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                        >
                            <Image
                                src="/icons/close.svg"
                                alt="close"
                                width={20}
                                height={20}
                                className="text-slate-500"
                            />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex gap-4">
                            <div className="w-24 h-24 bg-slate-50 rounded-lg relative overflow-hidden flex-shrink-0">
                                {product.image_links?.[0] ? (
                                    <Image
                                        src={product.image_links[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Image
                                            src="/icons/product.svg"
                                            alt="product"
                                            width={32}
                                            height={32}
                                            className="text-slate-300"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-slate-900 mb-2">{product.name}</h3>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Giá bán:</span>
                                        <span className="font-medium text-slate-900">
                                            {formatCurrency(product.output_price)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Thành tiền:</span>
                                        <span className="font-medium text-blue-600">
                                            {formatCurrency(product.output_price * quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Số lượng
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50"
                                >
                                    <Image
                                        src="/icons/minus.svg"
                                        alt="minus"
                                        width={20}
                                        height={20}
                                        className="text-slate-600"
                                    />
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 h-10 text-center border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50"
                                >
                                    <Image
                                        src="/icons/plus.svg"
                                        alt="plus"
                                        width={20}
                                        height={20}
                                        className="text-slate-600"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-200">
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                            >
                                Thêm vào đơn hàng
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 