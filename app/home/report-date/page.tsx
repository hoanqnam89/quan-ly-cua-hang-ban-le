'use client';

import { useEffect, useState } from 'react';
import { IProduct, IProductDetail } from '@/interfaces';

interface ExpirationInfo {
  product: IProduct;
  detail: IProductDetail;
  daysExpired?: number;
  daysLeft?: number;
}

export default function ExpirationPage() {
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState<ExpirationInfo[]>([]);
  const [expiring, setExpiring] = useState<ExpirationInfo[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/product').then(res => res.json()),
      fetch('/api/product-detail').then(res => res.json())
    ]).then(([products, details]: [IProduct[], IProductDetail[]]) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiredList: ExpirationInfo[] = [];
      const expiringList: ExpirationInfo[] = [];

      for (const product of products) {
        for (const detail of details.filter(d => d.product_id === product._id)) {
          const expiry = new Date(detail.expiry_date);
          expiry.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (expiry < today) {
            expiredList.push({ product, detail, daysExpired: -diffDays });
          } else if (diffDays <= 30) {
            expiringList.push({ product, detail, daysLeft: diffDays });
          }
        }
      }

      setExpired(expiredList.sort((a, b) => (b.daysExpired ?? 0) - (a.daysExpired ?? 0)));
      setExpiring(expiringList.sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0)));
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white px-10 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Theo dõi hạn sử dụng sản phẩm</h1>

      {loading ? (
        <div className="flex justify-center items-center h-96 text-2xl text-blue-600">Đang tải dữ liệu...</div>
      ) : (
        <div className="space-y-12">
          {/* Expired Products */}
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-semibold text-red-600 mb-6">
              Sản phẩm đã hết hạn ({expired.length})
            </h2>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xl">
                <thead className="bg-red-50 text-red-800">
                  <tr>
                    <th className="text-left p-4">Tên sản phẩm</th>
                    <th className="text-left p-4">Hạn sử dụng</th>
                    <th className="text-left p-4">Số lượng trong kho</th>
                  </tr>
                </thead>
                <tbody>
                  {expired.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500 text-lg">
                        Không có sản phẩm nào đã hết hạn.
                      </td>
                    </tr>
                  ) : (
                    expired.map(({ product, detail, daysExpired }) => (
                      <tr key={detail._id} className="hover:bg-red-50">
                        <td className="p-4">{product.name}</td>
                        <td className="p-4 text-red-500">
                          {new Date(detail.expiry_date).toLocaleDateString('vi-VN')}<br />
                          <span className="text-sm">({daysExpired} ngày trước)</span>
                        </td>
                        <td className="p-4">{detail.input_quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Expiring Soon */}
          <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-3xl font-semibold text-yellow-600 mb-6">
              Sản phẩm sắp hết hạn ({expiring.length})
            </h2>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-xl">
                <thead className="bg-yellow-50 text-yellow-800">
                  <tr>
                    <th className="text-left p-4">Tên sản phẩm</th>
                    <th className="text-left p-4">Hạn sử dụng</th>
                    <th className="text-left p-4">Số lượng trong kho</th>
                  </tr>
                </thead>
                <tbody>
                  {expiring.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500 text-lg">
                        Không có sản phẩm nào sắp hết hạn.
                      </td>
                    </tr>
                  ) : (
                    expiring.map(({ product, detail, daysLeft }) => (
                      <tr key={detail._id} className="hover:bg-yellow-50">
                        <td className="p-4">{product.name}</td>
                        <td className="p-4 text-yellow-600">
                          {new Date(detail.expiry_date).toLocaleDateString('vi-VN')}<br />
                          <span className="text-sm">({daysLeft} ngày nữa)</span>
                        </td>
                        <td className="p-4">{detail.input_quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
