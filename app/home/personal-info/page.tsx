'use client';

import React, { ChangeEvent, ReactElement, useCallback, useEffect, useState } from 'react'
import InputSection from '../components/input-section/input-section'
import { Button, IconContainer, LoadingScreen, SelectDropdown, Text, TextInput } from '@/components'
import { IAccount, IUser } from '@/interfaces';
import { DEFAULT_USER } from '@/constants/user.constant';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { trashIcon } from '@/public';
import DateInput from '@/components/date-input/date-input';
import { enumToKeyValueArray } from '@/utils/enum-to-array';
import { EUserGender } from '@/enums/user-gender.enum';
import Image from 'next/image';
import styles from './style.module.css';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import Checkbox from '@/components/checkbox/checkbox';
import { DEFAULT_ACCOUNT } from '@/constants/account.constant';
import { logout, me } from '@/services/Auth';
import { redirect } from 'next/navigation';
import { IAccountPayload } from '@/app/api/interfaces/account-payload.interface';

type collectionType = IUser;

export default function PersonalInfo(): ReactElement {
  const [account, setAccount] = useState<IAccount>(DEFAULT_ACCOUNT);
  const [user, setUser] = useState<IUser>(DEFAULT_USER);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);

  const getCurrentUser: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      setIsLoading(true);

      const meApiResponse: Response = await me();
      const meApiJson: IAccountPayload = await meApiResponse.json();
      const accountId = meApiJson._id;

      const userApiResponse: Response = await fetch(`/api/user/account/${accountId}`);
      const userApiJson: IUser = await userApiResponse.json();
      setUser(userApiJson);

      setIsLoading(false);
    }, 
    []
  )
    
  useEffect((): void => {
    getCurrentUser();
  }, [getCurrentUser]);

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files)
      return;

    const file: File = e.target.files[0];
    if (!file)
      return;

    setImageFile(file);
  }

  useEffect(() => {
    let isCancel = false;
    const fileReader: FileReader = new FileReader();

    if (imageFile) {
      fileReader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (result && !isCancel) {
          setUser({
            ...user, 
            avatar: result.toString(), 
          });
        }
      }
      fileReader.readAsDataURL(imageFile);
    }

    return () => {
      isCancel = true;
      if (fileReader.readyState === 1) {
        fileReader.abort();
      }
    }
  }, [imageFile, user]);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>): void => {
    setUser({
      ...user, 
      name: {
        ...user.name, 
        [e.target.name]: e.target.value, 
      }
    });
  }

  const handleChangeAddress = (e: ChangeEvent<HTMLInputElement>): void => {
    setUser({
      ...user, 
      address: {
        ...user.address, 
        [e.target.name]: e.target.value, 
      }
    });
  }

  const handleChangeEmail = (e: ChangeEvent<HTMLInputElement>): void => {
    setUser({
      ...user, 
      email: e.target.value, 
    });
  }

  const handleChangeBirthday = (e: ChangeEvent<HTMLInputElement>): void => {
    setUser({
      ...user, 
      birthday: new Date(e.target.value), 
    });
  }

  const handleChangeGender = (e: ChangeEvent<HTMLSelectElement>): void => {
    setUser({
      ...user, 
      gender: e.target.value, 
    });
  }

  const handleDeleteImage = (): void => {
    setUser({
      ...user, 
      avatar: undefined, 
    });
    setImageFile(null);
  }

  const handleChangeAccount = (e: ChangeEvent<HTMLInputElement>): void => {
    setAccount({
      ...account, 
      [e.target.name]: e.target.value, 
    });
  }

  const handleChangeIsAdmin = (e: ChangeEvent<HTMLInputElement>): void => {
    setAccount({
      ...account, 
      is_admin: e.target.checked, 
    });
  }

  const handleLogOut = async (): Promise<void> => {
    if ( !confirm(`Are you sure you want to log out?`) ) 
      return;

    await me();
    setIsLoading(true);
    await logout();
    redirect("/");
  }

  const genderOptions: ISelectOption[] = enumToKeyValueArray(EUserGender)
    .map((array: string[]): ISelectOption => ({
      label: array[0], 
      value: array[1], 
    }));

	const titleSize: number = 24;

  return (
    <>
			{isLoading ? <LoadingScreen></LoadingScreen> : <></>}

			<Text size={titleSize}>Thông tin nhân viên</Text>

      <Tabs>
        <TabItem label={`Họ và Tên`}>

          <div className={`flex flex-col gap-2`}>
            <InputSection label={`Họ`}>
              <TextInput
                name={`first`}
                isDisable={isModalReadOnly}
                value={user.name.first}
                onInputChange={handleChangeName}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Tên đệm`}>
              <TextInput
                name={`middle`}
                isDisable={isModalReadOnly}
                value={user.name.middle}
                onInputChange={handleChangeName}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Tên`}>
              <TextInput
                name={`last`}
                isDisable={isModalReadOnly}
                value={user.name.last}
                onInputChange={handleChangeName}
              >
              </TextInput>
            </InputSection>
          </div>
        </TabItem>

        <TabItem label={`Địa chỉ`}>
          <div className={`flex flex-col gap-2`}>
            <InputSection label={`Quốc gia`}>
              <TextInput
                name={`country`}
                isDisable={isModalReadOnly}
                value={user.address.country}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Thành phố`}>
              <TextInput
                name={`city`}
                isDisable={isModalReadOnly}
                value={user.address.city}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Quận`}>
              <TextInput
                name={`district`}
                isDisable={isModalReadOnly}
                value={user.address.district}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Phường`}>
              <TextInput
                name={`ward`}
                isDisable={isModalReadOnly}
                value={user.address.ward}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Đường`}>
              <TextInput
                name={`street`}
                isDisable={isModalReadOnly}
                value={user.address.street}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Số nhà`}>
              <TextInput
                name={`number`}
                isDisable={isModalReadOnly}
                value={user.address.number}
                onInputChange={handleChangeAddress}
              >
              </TextInput>
            </InputSection>
          </div>

        </TabItem>

        <TabItem label={`Thông tin khác`}>
          <div className={`flex flex-col gap-2`}>
            <InputSection label={`Email`}>
              <TextInput
                textType={`email`}
                name={`email`}
                isDisable={isModalReadOnly}
                value={user.email}
                onInputChange={handleChangeEmail}
              >
              </TextInput>
            </InputSection>

            {user.birthday ? 
              <InputSection label={`Ngày sinh`}>
                <DateInput
                  name={`birthday`}
                  isDisable={isModalReadOnly}
                  value={user.birthday}
                  onInputChange={handleChangeBirthday}
                >
                </DateInput>
              </InputSection> : <Text>{user.birthday}</Text>
            }

            <InputSection label={`Giới tính`}>
              <SelectDropdown
                isDisable={isModalReadOnly}
                options={genderOptions}
                defaultOptionIndex={getSelectedOptionIndex(
                  genderOptions, 
                  (user.gender 
                    ? user.gender 
                    : EUserGender.FEMALE
                  ) as unknown as string
                )}
                onInputChange={handleChangeGender}
              >
              </SelectDropdown>
            </InputSection>
          </div>
        </TabItem>
        
        <TabItem label={`Hình ảnh`}>
          <InputSection label={`Hình đại diện của nhân viên`}>
            <div>
              <input
                type={`file`}
                accept={`image/*`}
                multiple={true}
                onChange={handleChangeImage}
              >
              </input>

              <div className={`relative flex flex-wrap gap-2 overflow-scroll no-scrollbar`}>
                {
                  user.avatar ? <div 
                    className={`relative ${styles[`image-container`]}`}
                  >
                    <Image 
                      className={`w-full max-w-full max-h-full`}
                      src={user.avatar} 
                      alt={``}
                      width={0}
                      height={0}
                      quality={10}
                    >
                    </Image>

                    <div className={`absolute top-0 right-0`}>
                      <Button 
                        className={`absolute top-0 right-0`} 
                        onClick={() => handleDeleteImage()}
                      >
                        <IconContainer iconLink={trashIcon}>
                        </IconContainer>
                      </Button>
                    </div>
                  </div> : <></>
                }
              </div> 
            </div>
          </InputSection>
        </TabItem>

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={user}>
          </TimestampTabItem>
        </TabItem>
      </Tabs>

			<Text size={titleSize}>Thông tin tài khoản</Text>

			<InputSection label={`Tên tài khoản`}>
				<TextInput
					name={`username`}
					isDisable={isModalReadOnly}
					value={account.username}
					onInputChange={handleChangeAccount}
				>
				</TextInput>
			</InputSection>

			<InputSection label={`Là quản lý`}>
				<Checkbox 
					isChecked={account.is_admin}
					onInputChange={handleChangeIsAdmin}
				>
				</Checkbox>
			</InputSection>

			<Text size={titleSize}>Chức năng</Text>

			<div className={`flex gap-2`}>
				<Button type={EButtonType.INFO} onClick={() => setIsModalReadOnly(!isModalReadOnly)}>
					<Text>Chỉnh sửa</Text>
				</Button>

				<Button type={EButtonType.INFO}>
					<Text>Đổi mật khẩu</Text>
				</Button>

				<Button type={EButtonType.INFO}>
					<Text>Quên mật khẩu?</Text>
				</Button>

				<Button type={EButtonType.ERROR} onClick={handleLogOut}>
					<Text>Đăng xuất</Text>
				</Button>
			</div>
    </>
  )
}
