'use client'

import { Button, LoadingScreen, Text } from '@/components';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import { COMPANY } from '@/constants/company.constant';
import { DEFAULT_ORDER_FORM } from '@/constants/order-form.constant';
import { ECollectionNames } from '@/enums';
import { IOrderForm, IOrderFormProductDetail } from '@/interfaces/order-form.interface';
import { IPageParams } from '@/interfaces/page-params.interface';
import { IProductDetail } from '@/interfaces/product-detail.interface';
import { IProduct } from '@/interfaces/product.interface';
import { IUnit } from '@/interfaces/unit.interface';
import { getCollectionById } from '@/services/api-service';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { formatCurrency } from '@/utils/format-currency';
import { toPdf } from '@/utils/to-pdf';
import { translateCollectionName } from '@/utils/translate-collection-name';
import React, { ReactElement, use, useEffect, useRef, useState } from 'react'
import { IBusiness } from '@/interfaces/business.interface';

type collectionType = IOrderForm;
const collectionName: ECollectionNames = ECollectionNames.ORDER_FORM;
const companyAddress: string = typeof COMPANY.address === 'object'
  ? Object.values(COMPANY.address).filter(Boolean).join(', ')
  : COMPANY.address;
const date: string = new Date().toLocaleString();

function numberToWords(num: number): string {
  // Đơn giản hóa: chỉ trả về số tiền bằng số, bạn có thể thay bằng thư viện chuyển số thành chữ nếu muốn
  return num.toLocaleString('vi-VN') + ' đồng chẵn.';
}

export default function PreviewOrderForm({
  params
}: Readonly<IPageParams>): ReactElement {
  const { id } = use(params);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [orderForm, setOrderForm] = useState<collectionType>(
    DEFAULT_ORDER_FORM
  );
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);
  const [units, setUnits] = useState<IUnit[]>([]);
  const [isOrderFormLoading, setIsOrderFormLoading] = useState<boolean>(true);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);
  const [isProductDetailsLoading, setIsProductDetailsLoading] = useState<boolean>(true);
  const [isUnitLoading, setIsUnitLoading] = useState<boolean>(true);
  const [supplier, setSupplier] = useState<IBusiness | null>(null);

  useEffect((): void => {
    const getOrderFormById = async () => {
      const getOrderFormApiResponse: Response =
        await getCollectionById(id, collectionName);
      const getOrderFormApiJson = await getOrderFormApiResponse.json();
      setOrderForm(getOrderFormApiJson);
      setIsOrderFormLoading(false);
    }
    const getProducts = async () => {
      const newProducts: IProduct[] = await fetchGetCollections<IProduct>(
        ECollectionNames.PRODUCT,
      );
      setProducts([...newProducts]);
      setIsProductsLoading(false);
    }
    const getProductDetails = async () => {
      const newProductDetails: IProductDetail[] =
        await fetchGetCollections<IProductDetail>(
          ECollectionNames.PRODUCT_DETAIL,
        );
      setProductDetails([...newProductDetails]);
      setIsProductDetailsLoading(false);
    }
    const getUnits = async () => {
      const newUnits: IUnit[] = await fetchGetCollections<IUnit>(
        ECollectionNames.UNIT,
      );
      setUnits([...newUnits]);
      setIsUnitLoading(false);
    }

    getOrderFormById();
    getProducts();
    getProductDetails();
    getUnits();
  }, [id]);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (orderForm.supplier_id) {
        try {
          const res = await fetch(`/api/business/${orderForm.supplier_id}`);
          if (res.ok) {
            const data = await res.json();
            setSupplier(data);
          }
        } catch { }
      }
    };
    fetchSupplier();
  }, [orderForm.supplier_id]);

  const printInvoice = async (): Promise<void> => {
    await toPdf(invoiceRef);
  }

  const getProduct = (id: string): IProduct | undefined => {
    return products.find((product: IProduct): boolean => product._id ===
      productDetails.find((productDetail: IProductDetail): boolean =>
        productDetail._id === id
      )?.product_id
    );
  }

  const getProductDetail = (id: string): IProductDetail | undefined => {
    return productDetails.find((productDetail: IProductDetail): boolean =>
      productDetail._id === id
    );
  }

  const getUnit = (id: string): IUnit | undefined => {
    return units.find((unit: IUnit): boolean => unit._id === id);
  }

  const getTotalPrice = () => orderForm.product_details.reduce(
    (accumulator: number, currentValue: IOrderFormProductDetail): number => {
      const foundProduct: IProduct | undefined = getProduct(currentValue._id);
      const foundUnit: IUnit | undefined = getUnit(currentValue.unit_id);

      if (!foundProduct || !foundUnit)
        return 0;

      return accumulator + foundProduct.input_price * currentValue.quantity * foundUnit.equal;
    },
    0
  );

  const getTotalQuantity = (): number => orderForm.product_details.reduce(
    (accumulator: number, currentValue: IOrderFormProductDetail): number =>
      accumulator + currentValue.quantity,
    0
  );

  return (
    (
      isOrderFormLoading ||
      isProductsLoading ||
      isProductDetailsLoading ||
      isUnitLoading
    )
      ? <LoadingScreen></LoadingScreen>
      : <>
        <div className="max-w-3xl mx-auto my-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-lg uppercase">{COMPANY.name}</div>
              <div className="text-sm">{companyAddress}</div>
              <div className="text-sm">Điện thoại: {COMPANY.phone}</div>
              {COMPANY.bank_account && (
                <div className="text-sm">
                  Số tài khoản: {COMPANY.bank_account} tại {COMPANY.bank_name}
                </div>
              )}
              {COMPANY.bank_account_name && (
                <div className="text-sm">
                  Tên tài khoản: {COMPANY.bank_account_name}
                </div>
              )}
            </div>
            <div className="text-right text-sm">
              <div>Ngày: <b>{orderForm.created_at ? new Date(orderForm.created_at).toLocaleDateString('vi-VN') : ''}</b></div>
              <div>Số: <b>{orderForm._id?.substring(orderForm._id.length - 6)}</b></div>
              <div>Loại tiền: <b>VND</b></div>
            </div>
          </div>

          <div className="text-center my-4">
            <div className="text-2xl font-bold uppercase tracking-wider">ĐƠN MUA HÀNG</div>
          </div>

          {supplier && (
            <div className="mb-2 text-sm">
              <div><b>Tên nhà cung cấp:</b> {supplier.name}</div>
              {supplier.address && <div><b>Địa chỉ:</b> {supplier.address}</div>}
              {supplier.phone && <div><b>Điện thoại:</b> {supplier.phone}</div>}
              {supplier.bank_account && <div><b>Số tài khoản:</b> {supplier.bank_account}</div>}
              {supplier.bank_account_name && <div><b>Tên tài khoản:</b> {supplier.bank_account_name}</div>}
            </div>
          )}
          <div className="mb-2 text-sm">
            <b>Diễn giải:</b> Mua hàng
          </div>

          <div className="overflow-x-auto border border-gray-300 rounded-lg mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border border-gray-300 py-1 px-2">Quy cách (cm)</th>
                  <th className="border border-gray-300 py-1 px-2">Diễn giải</th>
                  <th className="border border-gray-300 py-1 px-2">Đơn vị</th>
                  <th className="border border-gray-300 py-1 px-2">Số lượng</th>
                  <th className="border border-gray-300 py-1 px-2">Đơn giá</th>
                  <th className="border border-gray-300 py-1 px-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {orderForm.product_details.map((item, idx) => {
                  const product = products.find(p => p._id === item._id);
                  const unit = units.find(u => u._id === item.unit_id);
                  const price = typeof item.input_price === 'number' ? item.input_price : (product?.input_price || 0);
                  return (
                    <tr key={idx} className="text-center">
                      <td className="border border-gray-300 py-1 px-2">{product?.specs || ''}</td>
                      <td className="border border-gray-300 py-1 px-2 text-left">{product?.name || ''}</td>
                      <td className="border border-gray-300 py-1 px-2">{unit?.name || ''}</td>
                      <td className="border border-gray-300 py-1 px-2">{item.quantity}</td>
                      <td className="border border-gray-300 py-1 px-2 text-right">{formatCurrency(price)}</td>
                      <td className="border border-gray-300 py-1 px-2 text-right">{formatCurrency(price * item.quantity)}</td>
                    </tr>
                  )
                })}
                <tr>
                  <td colSpan={5} className="border border-gray-300 py-1 px-2 text-right font-bold">Cộng tiền hàng:</td>
                  <td className="border border-gray-300 py-1 px-2 text-right font-bold">
                    {formatCurrency(orderForm.product_details.reduce((sum, item) => sum + (typeof item.input_price === 'number' ? item.input_price : 0) * item.quantity, 0))}
                  </td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-gray-300 py-1 px-2 text-right">Thuế suất thuế GTGT:</td>
                  <td className="border border-gray-300 py-1 px-2 text-right">0%</td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-gray-300 py-1 px-2 text-right">Tiền thuế GTGT:</td>
                  <td className="border border-gray-300 py-1 px-2 text-right">0</td>
                </tr>
                <tr>
                  <td colSpan={5} className="border border-gray-300 py-1 px-2 text-right font-bold">Tổng tiền thanh toán:</td>
                  <td className="border border-gray-300 py-1 px-2 text-right font-bold">
                    {formatCurrency(orderForm.product_details.reduce((sum, item) => sum + (typeof item.input_price === 'number' ? item.input_price : 0) * item.quantity, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-2 text-sm">
            <b>Số tiền viết bằng chữ:</b> <i>{numberToWords(orderForm.product_details.reduce((sum, item) => sum + (typeof item.input_price === 'number' ? item.input_price : 0) * item.quantity, 0))}</i>
          </div>

          <div className="mt-2 text-sm">
            <div><b>Ngày giao hàng:</b> ....................................................</div>
            <div><b>Địa điểm giao hàng:</b> .............................................</div>
            <div><b>Điều khoản thanh toán:</b> ........................................</div>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8 mt-8 border-t border-gray-200 text-center">
            <div>
              <p className="font-bold text-gray-900 mb-2">Người lập</p>
              <p className="text-sm text-gray-500">(Ký, họ tên)</p>
              <div className="h-16"></div>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Kế toán trưởng</p>
              <p className="text-sm text-gray-500">(Ký, họ tên)</p>
              <div className="h-16"></div>
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-2">Giám đốc KD</p>
              <p className="text-sm text-gray-500">(Ký, họ tên, đóng dấu)</p>
              <div className="h-16"></div>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mb-10 flex justify-end">
          <Button
            type={EButtonType.INFO}
            onClick={printInvoice}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg shadow-md"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              In đơn mua hàng
            </span>
          </Button>
        </div>
      </>
  )
}

