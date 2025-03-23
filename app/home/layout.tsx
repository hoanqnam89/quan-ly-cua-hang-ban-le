'use client';

import { CSSProperties, ReactElement, useState } from 'react';
import NavbarItem from '@/app/home/components/navbar-item/navbar-item';
import { boxIcon, chevronLeftIcon, chevronRightIcon, circleUserRoundIcon, homeIcon, truckIcon, userIcon, warehouseIcon } from '@/public';
import { IRootLayout } from '@/app/interfaces/root-layout.interface';
import styles from './style.module.css';

export interface CNavbarItem {
  link?: string
  label: string
  icon: string
  onClick?: () => void
}

export default function RootLayout({ 
  children 
}: Readonly<IRootLayout>): ReactElement {
  const [isExpand, setIsExpand] = useState<boolean>(false);

  const toggleNavbar = (): void => {
    setIsExpand((prev: boolean): boolean => !prev);
  }

  const currentPath: string = `/home`;
  const navbarItems: CNavbarItem[] = [
    {
      label: isExpand ? `Thu gọn` : `Mở rộng`,
      icon: isExpand ? chevronLeftIcon : chevronRightIcon, 
      onClick: toggleNavbar, 
    },
    {
      link: `${currentPath}/`,
      label: `Trang chủ`,
      icon: homeIcon, 
    },
    {
      link: `${currentPath}/account`,
      label: `Tài khoản`,
      icon: circleUserRoundIcon, 
    },
    {
      link: `${currentPath}/product`,
      label: `Sản phẩm`,
      icon: boxIcon, 
    },
    {
      link: `${currentPath}/user`,
      label: `Nhân viên`,
      icon: userIcon, 
    },
    {
      link: `${currentPath}/supplier`,
      label: `Nhà cung cấp`,
      icon: truckIcon, 
    },
    {
      link: `${currentPath}/good-receipt`,
      label: `Phiếu nhập hàng`,
      icon: warehouseIcon, 
    },
    {
      link: `${currentPath}/warehouse-receipt`,
      label: `Phiếu nhập kho`,
      icon: warehouseIcon, 
    },
    {
      link: `${currentPath}/personal-info`,
      label: `Thông tin cá nhân`, 
      icon: circleUserRoundIcon, 
    },
  ];

  const pageStyle: CSSProperties = {
    gridTemplateColumns: `${isExpand ?
      'max-content' :
      'calc(24px + 16px * 2 + 8px * 2)'
      } auto`,
  }

  return (
    <div className={`h-lvh grid`} style={pageStyle}>
      <nav className={`h-lvh overflow-y-scroll flex flex-col gap-4 no-scrollbar p-4 ${styles.nav}`}>
        {navbarItems.map((navbarItem: CNavbarItem, index: number) =>
          <NavbarItem 
            navbarItem={navbarItem} 
            key={index}
          >
          </NavbarItem>
        )}
      </nav>

      <main className={`h-lvh p-4 tab-color flex flex-col gap-4 ${styles.main}`}>
        {children}
      </main>
    </div>
  );
}
