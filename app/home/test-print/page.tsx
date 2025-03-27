'use client';

import { TestInvoice } from '../print';

export default function TestPrintPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Test In Hóa Đơn</h1>
            <TestInvoice />
        </div>
    );
} 