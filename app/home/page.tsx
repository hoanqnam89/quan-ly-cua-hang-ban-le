'use client';

import { ReactElement } from "react";
import { Text } from '@/components'
import styles from './style.module.css'

export default function Home(): ReactElement {
  return (
    <>
      <div className={`flex gap-2 justify-around`}>
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
          <Text size={32}>2</Text>
        </div>
      </div>
    </>
  );
}
