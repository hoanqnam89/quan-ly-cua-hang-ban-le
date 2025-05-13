import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Parse CLOUDINARY_URL thủ công
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
    const matches = cloudinaryUrl.match(
        /cloudinary:\/\/(\w+):(\w+)@(\w+)/
    );
    if (matches) {
        cloudinary.config({
            cloud_name: matches[3],
            api_key: matches[1],
            api_secret: matches[2],
        });
    }
}

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Đọc file thành buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'business_logos' }, // Đổi tên folder nếu muốn
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(buffer);
        });
        return NextResponse.json({ url: uploadResult.secure_url });
    } catch (error) {
        return NextResponse.json({ error: 'Upload failed', details: error }, { status: 500 });
    }
} 