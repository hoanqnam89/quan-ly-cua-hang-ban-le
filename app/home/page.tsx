'use client';

import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import { Text } from '@/components'
import styles from './style.module.css'
import { ECollectionNames } from "@/enums";
import { getCollectionCount } from "@/services/api-service";

export default function Home(): ReactElement {
  const [productCount, setProductCount] = useState<number>(-1);
  const [orderFormCount, setOrderFormCount] = useState<number>(-1);
  const [supplierCount, setSupplierCount] = useState<number>(-1);
  const [warehouseReceiptCount, setWarehouseReceiptCount] = useState<number>(-1);
  const [userCount, setUserCount] = useState<number>(-1);

  const setCollectionCount = async (
    collectionName: ECollectionNames, 
    setCollection: Dispatch<SetStateAction<number>>, 
  ): Promise<void> => {
    const getCollectionCountResponse: Response = 
      await getCollectionCount(collectionName);
    const getCollectionCountJson: number = 
      await getCollectionCountResponse.json();

    setCollection(getCollectionCountJson);
  }

  useEffect((): void => {
    setCollectionCount(ECollectionNames.PRODUCT, setProductCount);
    setCollectionCount(ECollectionNames.ORDER_FORM, setOrderFormCount);
    setCollectionCount(ECollectionNames.SUPPLIER, setSupplierCount);
    setCollectionCount(
      ECollectionNames.WAREHOUSE_RECEIPT, 
      setWarehouseReceiptCount
    );
    setCollectionCount(ECollectionNames.USER, setUserCount);
  }, []);

  const collectionCount = (count: number = -1): string =>
    count < 0 ? `Đang tính...` : count + ``;

  return (
    <>
      <Text size={24}>Tổng quan</Text>

      <div className={`flex flex-wrap gap-2`}>
        <div className={`p-4 ${styles.box}`}>
          <Text>Doanh thu trong ngày:</Text>
          <Text size={32}>10.000.000D</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng phiếu nhập hàng:</Text>
          <Text size={32}>{collectionCount(orderFormCount)}</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng sản phẩm:</Text>
          <Text size={32}>{collectionCount(productCount)}</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng nhà cung cấp:</Text>
          <Text size={32}>{collectionCount(supplierCount)}</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng phiếu nhập kho:</Text>
          <Text size={32}>{collectionCount(warehouseReceiptCount)}</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng nhân viên:</Text>
          <Text size={32}>{collectionCount(userCount)}</Text>
        </div>
      </div>
    </>
  );
}
