# Quản Lý Cửa Hàng Bán Lẻ

## Tối ưu API và Triển khai React Query

### Cải tiến đã thực hiện

#### 1. Tối ưu API `/api/business` 

- **Caching Server-side**: Lưu trữ kết quả truy vấn trong 5 phút để giảm tải cho database
- **Phân trang (Pagination)**: Thêm tham số `page` và `limit` để phân trang dữ liệu
- **Giới hạn dữ liệu**: Mặc định 20 bản ghi mỗi trang, có thể tùy chỉnh qua tham số `limit`
- **Bộ lọc**: Thêm bộ lọc theo loại doanh nghiệp qua tham số `type`
- **Tối ưu query MongoDB**: Sử dụng `lean()` và `maxTimeMS()` để tăng hiệu suất
- **Response Headers**: Thêm headers chứa thông tin về số lượng, trang hiện tại, tổng số trang

#### 2. Tích hợp React Query

- **React Query Provider**: Thiết lập provider cho toàn ứng dụng
- **Hook `use-business.ts`**: Tạo hook để quản lý và truy vấn dữ liệu
- **Tự động quản lý cache**: Invalidate cache khi có thay đổi dữ liệu 
- **Xử lý các trạng thái**: Loading, error, và success states

#### 3. Cải tiến UI

- **Component Pagination**: Dễ dàng điều hướng giữa các trang
- **Responsive UI**: Hiển thị trạng thái loading và lỗi
- **Bộ lọc**: Thêm bộ lọc theo loại doanh nghiệp trên UI

### Cách sử dụng API

#### Lấy danh sách Business

```
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
