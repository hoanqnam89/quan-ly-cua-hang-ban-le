'use client';

import { Button } from '@/components';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CreateOrder() {
    const router = useRouter();

    const handleBack = () => {
        router.push('/home/product-detail');
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center h-14 px-5">
                        <Button
                            onClick={handleBack}
                            className="flex items-center justify-center w-[30px] h-[30px] rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                        >
                            <Image
                                src="/icons/chevron-left.svg"
                                alt="back"
                                width={16}
                                height={16}
                                className="text-slate-600"
                                priority
                            />
                        </Button>
                        <span className="ml-3 text-lg font-medium text-slate-900">Tạo đơn hàng</span>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-5">
                <div className="grid grid-cols-3 gap-5">
                    {/* Cột trái */}
                    <div className="col-span-2 space-y-5">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/product.svg"
                                    alt="product"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Sản phẩm
                            </h2>
                            <div className="flex gap-3">
                                <div className="w-full relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên, mã SKU... (F3)"
                                        className="w-full h-10 px-4 pl-9 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-400 text-[15px] text-slate-900 placeholder:text-slate-400"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M14 14L11.2 11.2" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center h-44 border-2 border-dashed border-slate-200 rounded-lg mt-5 bg-slate-50 hover:border-blue-200 transition-all duration-200">
                                <div className="text-center">
                                    <Image
                                        src="/icons/empty-cart.svg"
                                        alt="empty"
                                        width={44}
                                        height={44}
                                        className="mx-auto mb-3 text-slate-400"
                                        priority
                                    />
                                    <p className="text-slate-600 mb-3 text-[16px]">Bạn chưa thêm sản phẩm nào</p>
                                    <Button className="px-6 py-2.5 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 text-[16px]">
                                        Thêm sản phẩm
                                    </Button>
                                </div>
                            </div>

                            <Button className="mt-5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 border border-blue-200 w-full text-[16px]">
                                <Image
                                    src="/icons/plus.svg"
                                    alt="plus"
                                    width={18}
                                    height={18}
                                    className="text-blue-600"
                                    priority
                                />
                                Thêm sản phẩm hoặc dịch vụ tùy chỉnh
                            </Button>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/order.svg"
                                    alt="payment"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Thanh toán
                            </h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Tổng tiền hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 font-medium text-[16px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Thêm giảm giá</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 font-medium text-[16px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                                    <span className="text-slate-700 text-[16px]">Thêm phí giao hàng</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 font-medium text-[16px]">0đ</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-3">
                                    <span className="font-semibold text-slate-900 text-lg">Thành tiền</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 text-[16px]">---</span>
                                        <span className="text-slate-900 text-xl font-semibold">0đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="space-y-5">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/source.svg"
                                    alt="source"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Nguồn đơn
                            </h2>
                            <div className="relative">
                                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[16px] text-slate-700 appearance-none transition-all duration-200">
                                    <option>Chọn nguồn đơn</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Image
                                        src="/icons/download.svg"
                                        alt="down"
                                        width={18}
                                        height={18}
                                        className="text-slate-400"
                                        priority
                                    />
                                </div>
                            </div>
                            <p className="mt-3 text-[16px] text-slate-600">
                                Nguồn đơn sẽ giúp xác định nguồn bán hàng và giúp phân loại đơn hàng hiệu quả
                            </p>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/employee.svg"
                                    alt="employee"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Thông tin đơn hàng
                            </h2>
                            <div>
                                <label className="block text-[16px] font-medium text-slate-700 mb-2">
                                    Nhân viên phụ trách
                                </label>
                                <div className="relative">
                                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[16px] text-slate-700 appearance-none transition-all duration-200">
                                        <option>Chọn nhân viên</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <Image
                                            src="/icons/download.svg"
                                            alt="down"
                                            width={18}
                                            height={18}
                                            className="text-slate-400"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                                <Image
                                    src="/icons/note.svg"
                                    alt="note"
                                    width={20}
                                    height={20}
                                    className="text-slate-700"
                                    priority
                                />
                                Ghi chú
                            </h2>
                            <textarea
                                placeholder="VD: Giao hàng trong giờ hành chính cho khách"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[100px] resize-none text-[16px] text-slate-700 placeholder:text-slate-400 transition-all duration-200"
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
                <div className="max-w-[1400px] mx-auto px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                        <Button className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 font-medium text-[16px] text-slate-700 transition-all duration-200 hover:shadow-sm flex items-center gap-2">
                            <Image
                                src="/icons/save.svg"
                                alt="save"
                                width={18}
                                height={18}
                                className="text-slate-600"
                                priority
                            />
                            Lưu nháp
                        </Button>
                        <Button className="h-11 px-6 bg-white hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 rounded-lg font-medium text-[15px] text-slate-900 hover:text-blue-600 shadow-sm transition-all duration-200 flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.6663 5L7.49967 14.1667L3.33301 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Tạo đơn hàng
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 