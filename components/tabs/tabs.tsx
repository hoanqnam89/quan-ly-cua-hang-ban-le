'use client'

import React, { Children, isValidElement, ReactElement, useEffect, useState } from 'react'
import TabItem, { ITabProps } from './components/tab-item/tab-item';
import { Button, Text } from '..';

interface ITabsProps {
  activeTabIndex?: number
  children: ReactElement<ITabProps> | ReactElement<ITabProps>[]
}

export default function Tabs({
  activeTabIndex = 0, 
  children, 
}: Readonly<ITabsProps>): ReactElement {
  const [activeTab, setActiveTab] = useState<number>(activeTabIndex);

  useEffect((): () => void => {
    return (): void => {
      setActiveTab(0);
    }
  }, []);
  
  const handleTabClick = (tab: ReactElement<ITabProps>, index: number) => {
    if ( !tab.props.isDisable )
      setActiveTab(index);
  }

  const tabs = Children.toArray(children).filter(
    (child): child is ReactElement<ITabProps> =>
      isValidElement(child) && child.type === TabItem
  );

  return (
    <div className={`flex flex-col gap-2`}>
      <ul className={`tab-list flex overflow-x-scroll border-b-2 border-solid border-b-gray no-scrollbar`}>
        {tabs.map((
          tab: ReactElement<ITabProps>, index: number
        ): ReactElement => (
          <li 
            key={`tab-${index}`} 
            className={`p-1 block border-b-2 border-solid ${
              activeTab === index ? `border-b-blue-700` : `border-none`
            }`
          }>
            <Button
              onClick={(): void => handleTabClick(tab, index)}
              className={`whitespace-nowrap`}
            >
              <Text color={tab.props.isDisable ? {
                light: `#777`, 
                dark: `#777`
              } : {
                light: `#000`, 
                dark: `#fff`, 
              }}>
                {tab.props.label}
              </Text>
            </Button>
          </li>
        ))}
      </ul>

      {tabs[activeTab]}
    </div>
  )
}
