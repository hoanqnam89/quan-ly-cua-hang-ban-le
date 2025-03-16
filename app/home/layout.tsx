'use client'

import React, { CSSProperties, ReactElement, useState } from 'react'
import { IRootLayout } from '../interfaces/root-layout.interface'
import { redirect } from 'next/navigation';
import { boxIcon, chevronLeftIcon, chevronRightIcon, homeIcon, logOutIcon } from '@/public';
import NavbarItem from './components/navbar-item/navbar-item';
import styles from './style.module.css';

export interface INavbarItem {
  link?: string
  label: string
  icon: string
  onClick?: () => void
}

export default function RootLayout({
  children
}: Readonly<IRootLayout>): ReactElement {
  const [isExpand, setIsExpand] = useState<boolean>(false);
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleNavbar = (): void => {
    setIsExpand((prev: boolean): boolean => !prev);
  }

  const handleLogOut = async (): Promise<void> => {
    if ( !confirm(`Are you sure you want to log out?`) ) 
      return;

    // await me();
    // setIsLoading(true);
    // await logout();
    redirect("/");
  }

  const currentPath: string = `/home`;
  const navbarItems: INavbarItem[] = [
    {
      label: isExpand ? `Thu nhỏ` : `Mở rộng`,
      icon: isExpand ? chevronLeftIcon : chevronRightIcon, 
      onClick: toggleNavbar, 
    },
    {
      link: `${currentPath}/`,
      label: `Trang chủ`,
      icon: homeIcon, 
    },
    {
      link: `${currentPath}/product`,
      label: `Sản phẩm`,
      icon: boxIcon, 
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
    <div className={`h-lvh grid ${styles.screen}`} style={pageStyle}>
      <nav className={`h-lvh overflow-y-scroll flex flex-col gap-4 no-scrollbar p-4 ${styles.nav}`}
      >
        {navbarItems.map((navbarItem: INavbarItem, index: number) =>
          <NavbarItem 
            // setIsLoading={setIsLoading} 
            navbarItem={navbarItem} 
            key={index}
          >
          </NavbarItem>
        )}
      </nav>

      <main 
        className={`h-lvh p-4 flex flex-col gap-4 ${styles.main}`}
      >
        {children}
      </main>

      {/* {isLoading && <LoadingScreen></LoadingScreen>} */}
    </div>
  );
}
