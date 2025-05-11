'use client';

import { CSSProperties, ReactElement, useState } from 'react';
import NavbarItem from '@/app/home/components/navbar-item/navbar-item';
import chevronRightIcon from '@/public/chevron-right.svg?url';
import chevronLeftIcon from '@/public/chevron-left.svg?url';
import homeIcon from '@/public/home.svg?url';
import boxesIcon from '@/public/boxes.svg?url';
import scrollIcon from '@/public/scroll.svg?url';
import settingIcon from '@/public/setting.svg?url';
import { boxIcon, circleSmallIcon, circleUserRoundIcon, factoryIcon, toyBrickIcon, userIcon, chartBarIcon } from '@/public';
import { IRootLayout } from '@/interfaces/root-layout.interface';
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
      label: `Quản lý danh mục`,
      icon: boxesIcon,
      isExpanded: expandedGroups['warehouse'],
      onClick: () => toggleGroup('warehouse'),
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
          link: `${currentPath}/business`,
          label: `Nhà cung cấp`,
          icon: factoryIcon,
        },
        {
          link: `${currentPath}/unit`,
          label: `Đơn vị tính`,
          icon: circleSmallIcon,
        },
        {
          link: `${currentPath}/category`,
          label: `Loại sản phẩm`,
          icon: toyBrickIcon,
        },
        {
          link: `${currentPath}/product`,
          label: `Sản phẩm`,
          icon: boxIcon,
        },
      ]
    },

    {
      link: `${currentPath}/order-form`,
      label: `Quản lý đặt hàng`,
      icon: scrollIcon,
    },
    {
      link: `${currentPath}/warehouse-receipt`,
      label: `Quản lý nhập kho`,
      icon: scrollIcon,
    },
    {
      link: `${currentPath}/order`,
      label: `Quản lý bán hàng`,
      icon: scrollIcon,
    },
    {
      link: `${currentPath}/return-exchange`,
      label: `Quản lý đổi trả`,
      icon: scrollIcon,
    },

    {
      label: `Báo cáo thống kê`,
      icon: settingIcon,
      isExpanded: expandedGroups['report'],
      onClick: () => toggleGroup('report'),
      children: [
        {
          link: `${currentPath}/product-detail`,
          label: `Báo cáo tồn kho`,
          icon: boxesIcon,
        },
        {
          link: `${currentPath}/report-date`,
          label: `Thống kê hạn sử dụng`,
          icon: chartBarIcon,
        },

      ]
    },
    {
      label: `Cài đặt`,
      icon: settingIcon,
      isExpanded: expandedGroups['settings'],
      onClick: () => toggleGroup('settings'),
      children: [
        {
          link: `${currentPath}/personal-info`,
          label: `Thông tin cá nhân`,
          icon: circleUserRoundIcon,
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
