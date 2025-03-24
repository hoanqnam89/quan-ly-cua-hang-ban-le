'use client';

import { Button, IconContainer, SelectDropdown, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { DEFAULT_USER } from '@/constants/user.constant'
import { ECollectionNames } from '@/enums'
import { IAccount, IUser } from '@/interfaces'
import { infoIcon, trashIcon } from '@/public'
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { enumToKeyValueArray } from '@/utils/enum-to-array';
import { EUserGender } from '@/enums/user-gender.enum';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import Image from 'next/image';
import Tabs from '@/components/tabs/tabs';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import DateInput from '@/components/date-input/date-input';
import styles from './style.module.css';
import { getDate } from '@/utils/get-date';
import { getSameDayOfYear } from '@/utils/get-same-date-of-year';

type collectionType = IUser;
const collectionName: ECollectionNames = ECollectionNames.USER;

export default function User() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [user, setUser] = useState<IUser>(DEFAULT_USER);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false, 
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: ``, 
    isClicked: false, 
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountOptions, setAccountOptions] = useState<ISelectOption[]>([]);

  const getAccounts: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newAccounts: IAccount[] = await fetchGetCollections<IAccount>(
        ECollectionNames.ACCOUNT, 
      );

      setUser({
        ...user, 
        account_id: newAccounts[0]._id, 
      });
      setAccountOptions([
        ...newAccounts.map((account: IAccount): ISelectOption => ({
          label: `${account.username}`,
          value: account._id,
        }))
      ]);
      setIsLoading(false);
    }, 
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [user.account_id],
  );

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

  useEffect((): void => {
    getAccounts();
  }, [getAccounts]);
  
  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: `index`,
      ref: useRef(null), 
      title: `#`,
      size: `1fr`,
    },
    {
      key: `_id`,
      ref: useRef(null), 
      title: `Mã`,
      size: `6fr`,
      isVisible: false, 
    },
    {
      key: `account_id`,
      ref: useRef(null), 
      title: `Tài khoản`,
      size: `3fr`, 
    },
    {
      key: `name`,
      ref: useRef(null), 
      title: `Họ tên`,
      size: `3fr`, 
      render: (user: collectionType): ReactElement => {
        const name: string = `${user.name.first} ${user.name.middle + ` `}${user.name.last}`;
        return <Text isEllipsis={true} tooltip={name}>{name}</Text>
      }
    },
    {
      key: `address`,
      ref: useRef(null), 
      title: `Địa chỉ`,
      size: `3fr`, 
      isVisible: false, 
      render: (collection: collectionType): ReactElement => {
        const address: string = `${collection.address.number} ${collection.address.street}, ${collection.address.ward}, ${collection.address.district}, ${collection.address.city}, ${collection.address.country}`;
        return <Text isEllipsis={true} tooltip={address}>{address}</Text>
      }
    },
    {
      key: `email`,
      ref: useRef(null), 
      title: `Email`,
      size: `3fr`, 
      isVisible: false, 
    },
    {
      key: `birthday`,
      ref: useRef(null), 
      title: `Ngày sinh`,
      size: `3fr`, 
      isVisible: false, 
      render: (collection: collectionType): ReactElement => {
        if ( !collection.birthday )
          return <Text isEllipsis={true}>NaN</Text>

        const date: string = new Date(collection.birthday).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `gender`,
      ref: useRef(null), 
      title: `Giới tính`,
      size: `3fr`, 
      isVisible: false, 
      render: (collection: collectionType): ReactElement => {
        const gender: string = collection.gender === EUserGender.MALE 
          ? `Nam`
          : collection.gender === EUserGender.FEMALE
            ? `Nữ`
            : `Không rõ`;
        return <Text isEllipsis={true} tooltip={gender}>{gender}</Text>
      }
    },
    {
      key: `avatar`,
      ref: useRef(null), 
      title: `Hình ảnh`,
      size: `3fr`, 
      render: (collection: collectionType): ReactElement => collection.avatar ? <div 
        className={`relative ${styles[`image-container`]}`}
      >
        <Image 
          className={`w-full max-w-full max-h-full`}
          src={collection.avatar} 
          alt={``}
          width={0}
          height={0}
          quality={10}
        >
        </Image>
      </div> : <></>
    }, 
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Ngày tạo`,
      size: `4fr`, 
      isVisible: false, 
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.created_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      key: `updated_at`,
      ref: useRef(null), 
      title: `Ngày cập nhật`,
      size: `4fr`, 
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.updated_at).toLocaleString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `Xem thêm`,
      ref: useRef(null), 
      size: `2fr`, 
      render: (collection: collectionType): ReactElement => <Button 
        title={createMoreInfoTooltip(collectionName)}
        onClick={(): void => {
          setIsClickShowMore({
            id: collection._id, 
            isClicked: !isClickShowMore.isClicked, 
          });
        }}
      >
        <IconContainer 
          tooltip={createMoreInfoTooltip(collectionName)}
          iconLink={infoIcon}
        >
        </IconContainer>
      </Button>
    },
    {
      title: `Xóa`,
      ref: useRef(null), 
      size: `2fr`, 
      render: (collection: collectionType): ReactElement => <Button 
        title={createDeleteTooltip(collectionName)}
        onClick={(): void => {
          setIsClickDelete({
            id: collection._id, 
            isClicked: !isClickDelete.isClicked, 
          });
        }}
      >
        <IconContainer 
          tooltip={createDeleteTooltip(collectionName)}
          iconLink={trashIcon}
        >
        </IconContainer>
      </Button>
    },
  ];

  const handleChangeAccountId = (e: ChangeEvent<HTMLSelectElement>): void => {
    setUser({
      ...user, 
      account_id: e.target.value, 
    });
  }

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

  const genderOptions: ISelectOption[] = enumToKeyValueArray(EUserGender)
    .map((array: string[]): ISelectOption => ({
      label: array[0], 
      value: array[1], 
    }));

  return (
    <ManagerPage<collectionType>
      columns={columns} 
      collectionName={collectionName} 
      defaultCollection={DEFAULT_USER}
      collection={user}
      setCollection={setUser}
      isModalReadonly={isModalReadOnly} 
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
      isLoaded={isLoading}
    >
      <Tabs>

        <TabItem label={`Tài khoản`}>

          <InputSection label={`Cho tài khoản`}>
            <SelectDropdown
              isLoading={isLoading}
              isDisable={isModalReadOnly}
              options={accountOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                accountOptions, user.account_id
              )}
              onInputChange={handleChangeAccountId}
            >
            </SelectDropdown>
          </InputSection>

        </TabItem>

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
                  min={getDate(getSameDayOfYear(new Date(), -65))}
                  max={getDate(getSameDayOfYear(new Date(), -18))}
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
              {!isModalReadOnly ? <input
                type={`file`}
                accept={`image/*`}
                multiple={true}
                onChange={handleChangeImage}
                disabled={isModalReadOnly}
              >
              </input> : null}

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

                    {!isModalReadOnly ? <div className={`absolute top-0 right-0`}>
                      <Button 
                        className={`absolute top-0 right-0`} 
                        onClick={() => handleDeleteImage()}
                      >
                        <IconContainer iconLink={trashIcon}>
                        </IconContainer>
                      </Button>
                    </div> : null}
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

    </ManagerPage>
  )
}
