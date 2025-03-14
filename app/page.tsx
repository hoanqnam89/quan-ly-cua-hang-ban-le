'use client'

import Button, { EButtonType } from '@/components/button/button';
import TextInput from '@/components/text-input/text-input';
import Text from '@/components/text/text'
import { redirect } from 'next/navigation';
import React, { ChangeEvent, CSSProperties, useState } from 'react'
import styles from './style.module.css';

export default function Login() {
  const [username, setUsername] = useState<string>(``);
  const [password, setPassword] = useState<string>(``);

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  }

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  }
          
  const handleLogin = async () => {
    redirect(`/home`);
  }

  const titleStyle: CSSProperties = {
    fontSize: `1.5rem`, 
    fontWeight: 600, 
  }

  const textStyle: CSSProperties = {
    fontWeight: 600, 
  }

  return (
    <div className={`h-lvh flex items-center justify-center`}>
      <div 
        className={`p-10 flex flex-col gap-2 rounded-xl ${styles[`login-section`]}`} 
      >
        <Text style={titleStyle}>Đăng nhập vào hệ thống quản lý bán lẻ</Text>

        <Text style={textStyle}>Tên tài khoản:</Text>

        <TextInput 
          name={`username`}
          value={username} 
          onChange={handleChangeUsername}
          placeholder={`Nhập tên tài khoản`}
        >
        </TextInput>

        <Text style={textStyle}>Mật khẩu:</Text>

        <TextInput 
          isPassword={true}
          name={`password`}
          value={password} 
          onChange={handleChangePassword}
          placeholder={`Nhập mật khẩu`}
        >
        </TextInput>

        <Button onClick={handleLogin} type={EButtonType.SUCCESS}>
          <Text style={textStyle}>Đăng nhập</Text>
        </Button>
      </div>
    </div>
  )
}
