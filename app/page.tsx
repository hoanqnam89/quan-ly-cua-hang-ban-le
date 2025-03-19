'use client';

import React, { ChangeEvent, CSSProperties, ReactElement, useState } from 'react';
import { redirect } from 'next/navigation';
// import { notification } from 'antd';
import { EStatusCode } from '@/enums/status-code.enum';
import { login } from '@/services/Auth';
import { Button, LoadingScreen, Text, TextInput } from '@/components';

export default function Login(): ReactElement {
  const [username, setUsername] = useState<string>(``);
  const [password, setPassword] = useState<string>(``);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [notificationApi, contextHolder] = notification.useNotification();

  const loginSectionStyle: CSSProperties = {
    backgroundImage: `linear-gradient(315deg, #2b4162 0%, #12100e 74%)`, 
  }

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  }

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  }

  const handleLogin = async (): Promise<void> => {
    setIsLoading(true);
    const loginApiResponse: Response = await login(username, password);
    setIsLoading(false);

    switch (loginApiResponse.status) {
      case EStatusCode.OK:
        redirect(`/home`);
      case EStatusCode.UNAUTHORIZED:
        // notificationApi.error({
        //   message: `Login Failed! Username or Password is incorrect.`,
        //   placement: `topRight`,
        // });
        break;
      default:
        // notificationApi.error({
        //   message: `Login Failed! Unknown Error.`,
        //   placement: `topRight`,
        // });
        break;
    }
  }

  return (
    <div className={`h-lvh flex items-center justify-center`}>
      {/* {contextHolder} */}

      <div 
        className={`p-10 flex flex-col gap-2 rounded-xl`} 
        style={loginSectionStyle}
      >
        <Text weight={600} size={24}>Đăng nhập vào hệ thống quản lý bán lẻ</Text>

        <Text weight={600}>Tên đăng nhập:</Text>
        <TextInput 
          value={username} 
          onInputChange={handleChangeUsername}
        >
        </TextInput>

        <Text weight={600}>Mật khẩu:</Text>
        <TextInput 
          value={password}
          isPassword={true} 
          onInputChange={handleChangePassword}
        >
        </TextInput>

        <Button onClick={handleLogin}>
          <Text weight={600}>Đăng nhập</Text>
        </Button>
      </div>

      {isLoading && <LoadingScreen></LoadingScreen>}
    </div>
  )
}
