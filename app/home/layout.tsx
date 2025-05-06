'use client';

import { CSSProperties, ReactElement, useState } from 'react';
import NavbarItem from '@/app/home/components/navbar-item/navbar-item';
import { boxesIcon, boxIcon, chevronLeftIcon, chevronRightIcon, circleSmallIcon, circleUserRoundIcon, factoryIcon, homeIcon, scrollIcon, settingIcon, toyBrickIcon, userIcon } from '@/public';
import { IRootLayout } from '@/app/interfaces/root-layout.interface';
import styles from './style.module.css';

export interface CNavbarItem {
  link?: string
  label: string
  icon: string
  onClick?: () => void
  children?: CNavbarItem[]
  isExpanded?: boolean
}

export default function RootLayout({
  children
}: Readonly<IRootLayout>): ReactElement {
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  const toggleNavbar = (): void => {
    setIsExpand((prev: boolean): boolean => !prev);
  }

  const toggleGroup = (groupKey: string): void => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
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
      label: `Quản lý kho`,
      icon: boxesIcon,
      isExpanded: expandedGroups['warehouse'],
      onClick: () => toggleGroup('warehouse'),
      children: [
        {
          link: `${currentPath}/product`,
          label: `Sản phẩm`,
          icon: boxIcon,
        },
        {
          link: `${currentPath}/product-detail`,
          label: `Chi tiết kho`,
          icon: boxesIcon,
        },
        {
          link: `${currentPath}/unit`,
          label: `Đơn vị tính`,
          icon: circleSmallIcon,
        },
        {
          link: `${currentPath}/category`,
          label: `Danh mục`,
          icon: toyBrickIcon,
        },
        {
          link: `${currentPath}/business`,
          label: `Doanh nghiệp`,
          icon: factoryIcon,
        },
      ]
    },
    {
      label: `Quản lý đơn hàng`,
      icon: scrollIcon,
      isExpanded: expandedGroups['orders'],
      onClick: () => toggleGroup('orders'),
      children: [
        {
          link: `${currentPath}/order-form`,
          label: `Phiếu đặt hàng`,
          icon: scrollIcon,
        },
        {
          link: `${currentPath}/warehouse-receipt`,
          label: `Phiếu nhập kho`,
          icon: scrollIcon,
        },
        {
          link: `${currentPath}/order`,
          label: `Đơn hàng`,
          icon: scrollIcon,
        },
      ]
    },
    {
      label: `Quản lý hệ thống`,
      icon: settingIcon,
      isExpanded: expandedGroups['settings'],
      onClick: () => toggleGroup('settings'),
      children: [
        {
          link: `${currentPath}/account`,
          label: `Tài khoản`,
          icon: circleUserRoundIcon,
        },
        {
          link: `${currentPath}/user`,
          label: `Nhân viên`,
          icon: userIcon,
        },
        {
          link: `${currentPath}/personal-info`,
          label: `Thông tin cá nhân`,
          icon: circleUserRoundIcon,
        },
        {
          link: `${currentPath}/setting`,
          label: `Báo cáo thống kê`,
          icon: settingIcon,
        },
        {
          link: `${currentPath}/setting`,
          label: `Cài đặt`,
          icon: settingIcon,
        },
      ]
    },
  ];

  const pageStyle: CSSProperties = {
    gridTemplateColumns: `${isExpand
      ? `max-content`
      : `calc(24px + 16px * 2 + 8px * 2)`
      } auto`,
  }

  return (
    <div className={`h-lvh grid`} style={pageStyle}>
      <nav className={`h-lvh overflow-y-scroll flex flex-col gap-4 no-scrollbar p-4 ${styles.nav}`}>
        {navbarItems.map((navbarItem: CNavbarItem, index: number) =>
          <NavbarItem
            navbarItem={navbarItem}
            key={index}
            isExpand={isExpand}
            setIsExpand={setIsExpand}
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
