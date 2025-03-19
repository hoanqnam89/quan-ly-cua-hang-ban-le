'use client';

import { CSSProperties, ReactElement, useState } from 'react';
import '@/styles/globals.css';
import NavbarItem from '@/app/home/components/navbar-item/navbar-item';
import { logout, me } from '@/services/Auth';
import { redirect } from 'next/navigation';
import { blocksIcon, boxIcon, chevronLeftIcon, chevronRightIcon, circleUserRoundIcon, homeIcon, logOutIcon, paintRollerIcon, pencilIcon, textIcon, toyBrickIcon, userIcon } from '@/public';
import { LoadingScreen } from '@/components';
import { IRootLayout } from '@/app/interfaces/root-layout.interface';
import { ECollectionNames } from '@/enums';

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
      label: `Home`,
      icon: homeIcon, 
    },
    {
      link: `${currentPath}/account`,
      label: `Account`,
      icon: circleUserRoundIcon, 
    },
    {
      link: `${currentPath}/role`,
      label: `Role`,
      icon: pencilIcon, 
    },
    {
      link: `${currentPath}/role-group`,
      label: `Role Group`,
      icon: pencilIcon, 
    },
    {
      link: `${currentPath}/rubik-color-set`,
      label: `Rubik Color Set`,
      icon: paintRollerIcon, 
    },
    {
      link: `${currentPath}/rubik`,
      label: ECollectionNames.RUBIK,
      icon: toyBrickIcon, 
    },
    {
      link: `${currentPath}/rubik-algorithm-set`,
      label: ECollectionNames.RUBIK_ALGORITHM_SET,
      icon: blocksIcon, 
    },
    {
      link: `${currentPath}/rubik-case`,
      label: ECollectionNames.RUBIK_CASE,
      icon: blocksIcon, 
    },
    {
      link: `${currentPath}/rubik-algorithm`,
      label: ECollectionNames.RUBIK_ALGORITHM,
      icon: textIcon, 
    },
    {
      link: `${currentPath}/user`,
      label: `Users`,
      icon: userIcon, 
    },
    {
      link: `${currentPath}/rubik-simulator`,
      label: `Rubik Simulator`,
      icon: boxIcon, 
    },
    {
      link: `${currentPath}/test-component`,
      label: `Test UI Components`,
      icon: boxIcon, 
    },
    {
      label: `Log Out`,
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

  const navStyle: CSSProperties = {
    background: `linear-gradient(to right, #2d7ad9, #5833d4)`, 
  }

  const mainStyle: CSSProperties = {
    background: `light-dark(
      linear-gradient(315deg, #ffffff 0%, #aaaaaa 100%), 
      linear-gradient(315deg, #2b4162 0%, #12100e 74%)
    )`, 
  }

  return (
    <div className={`h-lvh grid`} style={pageStyle}>
      <nav 
        className={`h-lvh overflow-y-scroll flex flex-col gap-4 no-scrollbar p-4`}
        style={navStyle}
      >
        {navbarItems.map((navbarItem: CNavbarItem, index: number) =>
          <NavbarItem 
            // setIsLoading={setIsLoading} 
            navbarItem={navbarItem} 
            key={index}
          >
          </NavbarItem>
        )}
      </nav>

      <main 
        className={`h-lvh p-4 tab-color flex flex-col gap-4`}
        style={mainStyle}
      >
        {children}
      </main>

      {isLoading && <LoadingScreen></LoadingScreen>}
    </div>
  );
}
