'use client';

import { Dispatch, ReactElement, SetStateAction, useEffect, useState } from "react";
import { Text } from '@/components'
import styles from './style.module.css'
import { ECollectionNames } from "@/enums";
import { getCollectionCount } from "@/services/api-service";

export default function Home(): ReactElement {
  const [productCount, setProductCount] = useState<number>(0);
  const [supplierCount, setSupplierCount] = useState<number>(0);
  const [warehouseReceiptCount, setWarehouseReceiptCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);

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
    setCollectionCount(ECollectionNames.SUPPLIER, setSupplierCount);
    setCollectionCount(
      ECollectionNames.WAREHOUSE_RECEIPT, 
      setWarehouseReceiptCount
    );
    setCollectionCount(ECollectionNames.USER, setUserCount);
  }, []);

  return (
    <>
      <Text size={24}>Tổng quan</Text>

      <div className={`flex flex-wrap gap-2`}>
        <div className={`p-4 ${styles.box}`}>
          <Text>Doanh thu trong ngày:</Text>
          <Text size={32}>10.000.000D</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng đơn hàng:</Text>
          <Text size={32}>32</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng sản phẩm:</Text>
          <Text size={32}>{productCount}</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng nhà cung cấp:</Text>
          <Text size={32}>{supplierCount}</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng phiếu nhập kho:</Text>
          <Text size={32}>{warehouseReceiptCount}</Text>
        </div>

        <div className={`p-4 ${styles.box}`}>
          <Text>Số lượng nhân viên:</Text>
          <Text size={32}>{userCount}</Text>
        </div>
      </div>
    </>
  );
}
