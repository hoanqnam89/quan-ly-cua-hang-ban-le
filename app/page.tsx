'use client'

import Button, { EButtonType } from '@/components/button/Button';
import TextInput from '@/components/text-input/TextInput'
import Text from '@/components/text/Text'
import React, { ChangeEvent, CSSProperties, useState } from 'react'

export default function Login() {
  const [username, setUsername] = useState<string>(``);
  const [password, setPassword] = useState<string>(``);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleChangeUsername = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  }

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  }
          
  const loginSectionStyle: CSSProperties = {
    background: `linear-gradient(to right, #2d7ad9, #5833d4)`,
  }

  const textStyle = {
    fontWeight: 600, 
    color: `#fff`, 
  }

  const titleStyle: CSSProperties = {
    fontSize: `1.5rem`, 
  }

  const handleLogin = async () => {

  }

  return (
    <div className={`h-lvh flex items-center justify-center`}>
      <div 
        className={`p-10 flex flex-col gap-2 rounded-xl`} 
        style={loginSectionStyle}
      >
        <Text style={{ ...titleStyle, ...textStyle }}>
          Đăng nhập vào hệ thống quản lý bán lẻ
          </Text>

        <Text style={textStyle}>Tên tài khoản:</Text>

        <TextInput 
          name={`username`}
          value={username} 
          onChange={handleChangeUsername}
        >
        </TextInput>

        <Text style={textStyle}>Mật khẩu:</Text>

        <TextInput 
          isPassword={true}
          name={`password`}
          value={password} 
          onChange={handleChangePassword}
        >
        </TextInput>

        <Button onClick={handleLogin} type={EButtonType.SUCCESS}>
          <Text style={textStyle}>Đăng nhập</Text>
        </Button>
      </div>
    </div>
  )
}
