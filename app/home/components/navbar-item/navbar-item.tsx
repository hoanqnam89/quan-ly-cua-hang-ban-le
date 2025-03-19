import React, { CSSProperties, Dispatch, ReactElement, SetStateAction } from 'react';
import Link from 'next/link';
import { CNavbarItem } from '../../layout';
import { IconContainer, Text } from '@/components';

interface INavbarItemProps {
  setIsLoading?: Dispatch<SetStateAction<boolean>>
  navbarItem: CNavbarItem, 
}

export default function NavbarItem({ 
  setIsLoading, 
  navbarItem, 
}: Readonly<INavbarItemProps>): ReactElement {
  const navbarItemStyle: CSSProperties = { 
    gridTemplateColumns: `24px auto`, 
  }

  const handleRedirect = (): void => {
    if (setIsLoading)
      setIsLoading(true);
  }

  if ( navbarItem.link )
    return (
      <Link
        href={navbarItem.link}
        onClick={handleRedirect}
        className={`
          p-2 grid gap-6 rounded-2xl transition-all select-none
        `}
        style={navbarItemStyle}
        title={navbarItem.label}
      >
        <IconContainer iconLink={navbarItem.icon}>
        </IconContainer>

        <Text weight={600} isEllipsis={true}>{navbarItem.label}</Text>
      </Link>
    );

  return (
    <div
      className={`
        p-2 grid gap-6 rounded-2xl transition-all select-none cursor-pointer
      `}
      style={navbarItemStyle}
      title={navbarItem.label}
      onClick={navbarItem.onClick}
    >
      <IconContainer iconLink={navbarItem.icon}>
      </IconContainer>

      <Text weight={600} isEllipsis={true}>{navbarItem.label}</Text>
    </div>
  );
}
