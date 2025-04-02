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

type collectionType = IOrderForm;
const collectionName: ECollectionNames = ECollectionNames.ORDER_FORM;
const companyAddress: string = `${COMPANY.address.number} ${COMPANY.address.street} ${COMPANY.address.ward} ${COMPANY.address.district} ${COMPANY.address.city} ${COMPANY.address.country}`;
const date: string = new Date().toLocaleString();

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
        <div 
          ref={invoiceRef} 
          className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 pt-4"
        >
          <div className="w-full space-y-4 px-8">

            <div className="flex justify-between items-start border-b-2 border-gray-300 pb-2">
              <div className="space-y-1">
                <p className="font-bold text-xl text-gray-900">{COMPANY.name}</p>
                <p className="text-gray-700">{companyAddress}</p>
                <p className="text-gray-700">Hotline: {COMPANY.phone}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-medium text-gray-700">Số phiếu: {COMPANY.number}</p>
                <p className="text-gray-700">Ngày: {
                  new Date(COMPANY.created_at).toLocaleString()
                }</p>
              </div>
            </div>

            <div className="text-center py-2 border-b-2 border-gray-300">
              <h1 className="text-3xl font-bold text-gray-900">{
                translateCollectionName(collectionName)
              }</h1>
            </div>

            <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th 
                      className="py-2 px-3 text-left font-bold text-gray-900 border-y-2 border-gray-300 w-[5%]"
                    >
                      STT
                    </th>
                    <th 
                      className="py-2 px-3 text-left font-bold text-gray-900 border-y-2 border-gray-300 w-[35%]"
                    >
                      Tên sản phẩm
                    </th>
                    <th 
                      className="py-2 px-3 text-left font-bold text-gray-900 border-y-2 border-gray-300 w-[10%]"
                    >
                      Đơn vị
                    </th>
                    <th 
                      className="py-2 px-3 text-left font-bold text-gray-900 border-y-2 border-gray-300 w-[15%]"
                    >
                      Ngày sản xuất
                    </th>
                    <th 
                      className="py-2 px-3 text-left font-bold text-gray-900 border-y-2 border-gray-300 w-[15%]"
                    >
                      Hạn sử dụng
                    </th>
                    <th 
                      className="py-2 px-3 text-right font-bold text-gray-900 border-y-2 border-gray-300 w-[10%]"
                    >
                      Giá
                    </th>
                    <th 
                      className="py-2 px-3 text-right font-bold text-gray-900 border-y-2 border-gray-300 w-[10%]"
                    >
                      Số lượng
                    </th>
                    <th 
                      className="py-2 px-3 text-right font-bold text-gray-900 border-y-2 border-gray-300 w-[15%]"
                    >
                      Tổng tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orderForm.product_details.map((item, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td 
                        className="py-2 px-3 border-b-2 border-gray-300 text-gray-700 font-medium"
                      >
                        {index + 1}
                      </td>
                      <td 
                        className="py-2 px-3 border-b-2 border-gray-300 text-gray-900 font-medium"
                      >
                        {getProduct(item._id)?.name}
                      </td>
                      <td 
                        className="py-2 px-3 border-b-2 border-gray-300 text-gray-700 font-medium"
                      >
                        {getUnit(item.unit_id)?.name}
                      </td>
                      <td 
                        className="py-2 px-3 border-b-2 border-gray-300 text-gray-700 font-medium"
                      >
                        {new Date(
                          getProductDetail(item._id)?.date_of_manufacture || 
                          new Date()
                        ).toLocaleDateString()}
                      </td>
                      <td 
                        className="py-2 px-3 border-b-2 border-gray-300 text-gray-700 font-medium"
                      >
                        {new Date(
                          getProductDetail(item._id)?.expiry_date || 
                          new Date()
                        ).toLocaleDateString()}
                      </td>
                      <td 
                        className="py-2 px-3 text-right border-b-2 border-gray-300 text-gray-700 font-medium"
                      >
                        {formatCurrency( getProduct(item._id)?.input_price || 0 )}
                      </td>
                      <td 
                        className="py-2 px-3 text-right border-b-2 border-gray-300 text-gray-700 font-medium"
                      >
                        {item.quantity}
                      </td>
                      <td 
                        className="py-2 px-3 text-right border-b-2 border-gray-300 font-bold text-gray-900"
                      >
                        {formatCurrency( (getProduct(item._id)?.input_price || 0) * item.quantity * (getUnit(item.unit_id)?.equal || 0) )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={6} className="py-2 px-3 font-bold text-gray-900 border-t-2 border-gray-300">Tổng cộng</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900 border-t-2 border-gray-300">{getTotalQuantity()}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900 border-t-2 border-gray-300">{formatCurrency( getTotalPrice() )}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t-2 border-gray-300">
              <div className="text-center">
                <p className="font-bold text-gray-900 mb-2">NGƯỜI NHẬN</p>
                <p className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</p>
                <div className="h-24"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 mb-2">NGƯỜI GIAO</p>
                <p className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</p>
                <div className="h-24"></div>
              </div>
            </div>

            <div className="text-right text-gray-700 pt-4">
              <p className="font-bold">{companyAddress}, {date}</p>
            </div>
          </div>
        </div>

        <Button type={EButtonType.INFO} onClick={printInvoice}>
          <Text>In hóa đơn</Text>
        </Button>
      </> 
  )
}
