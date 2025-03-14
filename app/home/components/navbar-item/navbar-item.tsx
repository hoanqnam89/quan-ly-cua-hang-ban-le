import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import Link from 'next/link';
import { INavbarItem } from '../../layout';
import IconContainer from '@/components/icon-container/icon-container';
import Text from '@/components/text/text';
import styles from './style.module.css'

interface INavbarItemProps {
  setIsLoading?: Dispatch<SetStateAction<boolean>>
  navbarItem: INavbarItem, 
}

export default function NavbarItem({ 
  setIsLoading, 
  navbarItem, 
}: Readonly<INavbarItemProps>): ReactElement {
  const handleRedirect = (): void => {
    if (setIsLoading)
      setIsLoading(true);
  }

  if ( navbarItem.link )
    return (
      <Link
        href={navbarItem.link}
        onClick={handleRedirect}
        className={`p-2 grid gap-6 rounded-2xl transition-all select-none ${styles[`navbar-item`]}`}
        title={navbarItem.label}
      >
        <IconContainer iconLink={navbarItem.icon}>
        </IconContainer>

        <Text className={`${styles.text}`}>{navbarItem.label}</Text>
      </Link>
    );

  return (
    <div
      className={`p-2 grid gap-6 rounded-2xl transition-all select-none cursor-pointer ${styles[`navbar-item`]}`}
      title={navbarItem.label}
      onClick={navbarItem.onClick}
    >
      <IconContainer iconLink={navbarItem.icon}>
      </IconContainer>

      <Text className={`${styles.text}`}>{navbarItem.label}</Text>
    </div>
  );
}
