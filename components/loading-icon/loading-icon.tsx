import React, { ReactElement } from 'react';
import { Spin } from 'antd';

export default function LoadingIcon(): ReactElement {
  return (
    <div className={`w-full h-full flex items-center justify-center`}>
      <Spin size={`large`}></Spin>
    </div>
  )
}
