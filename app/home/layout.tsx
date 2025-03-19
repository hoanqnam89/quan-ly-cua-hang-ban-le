'use client';

import { CSSProperties, ReactElement, useState } from 'react';
import NavbarItem from '@/app/home/components/navbar-item/navbar-item';
import { logout, me } from '@/services/Auth';
import { redirect } from 'next/navigation';
import { boxIcon, chevronLeftIcon, chevronRightIcon, circleUserRoundIcon, homeIcon, logOutIcon, warehouseIcon } from '@/public';
import { LoadingScreen } from '@/components';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleNavbar = (): void => {
    setIsExpand((prev: boolean): boolean => !prev);
  }

  const handleLogOut = async (): Promise<void> => {
    if ( !confirm(`Are you sure you want to log out?`) ) 
      return;

    await me();
    setIsLoading(true);
    await logout();
    redirect("/");
  }

  const currentPath: string = `/home`;
  const navbarItems: CNavbarItem[] = [
    {
      label: isExpand ? `Collapse` : `Expand`,
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
      link: `${currentPath}/supplier`,
      label: `Nhà cung cấp`,
      icon: boxIcon, 
    },
    {
      link: `${currentPath}/warehouse-receipt`,
      label: `Phiếu nhập kho`,
      icon: warehouseIcon, 
    },
    {
      label: `Đăng xuất`,
      icon: logOutIcon, 
      onClick: handleLogOut, 
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
            // setIsLoading={setIsLoading} 
            navbarItem={navbarItem} 
            key={index}
          >
          </NavbarItem>
        )}
      </nav>

      <main className={`h-lvh p-4 tab-color flex flex-col gap-4 ${styles.main}`}>
        {children}
      </main>

      {isLoading && <LoadingScreen></LoadingScreen>}
    </div>
  );
}
