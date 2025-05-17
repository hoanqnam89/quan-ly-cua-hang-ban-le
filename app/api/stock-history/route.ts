import { NextRequest, NextResponse } from 'next/server';
import { StockHistoryModel } from '@/models/StockHistory';
import { connectToDatabase } from '@/utils/database';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const histories = await StockHistoryModel.find().sort({ created_at: -1 });
        return NextResponse.json(histories || []);
    } catch (error) {
        console.error('Error fetching stock history:', error);
        // Trả về mảng rỗng thay vì lỗi để tránh crash frontend
        return NextResponse.json([]);
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        // Đảm bảo có user_name
        if (!body.user_name) return NextResponse.json({ message: 'Thiếu tên người thực hiện' }, { status: 400 });
        const created = await StockHistoryModel.create(body);
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error('Error creating stock history:', error);
        return NextResponse.json({ message: 'Lỗi khi lưu lịch sử nhập/xuất kho' }, { status: 500 });
    }
} 