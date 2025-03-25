'use client';

import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { LoadingScreen, Text, Button, TextInput } from '@/components'
import { IUser } from '@/interfaces';
import { DEFAULT_USER } from '@/constants/user.constant';
import { me, logout, auth } from '@/services/Auth';
import { IAccountPayload } from '@/app/api/interfaces/account-payload.interface';
import { ERoleAction } from '@/interfaces/role.interface';
import { ECollectionNames } from '@/enums';
import { redirect } from 'next/navigation';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import Image from 'next/legacy/image';
import ChangePasswordModal from '@/app/components/password-modal/change-password-modal';

// Sử dụng memo để tránh re-render không cần thiết
const FormField = React.memo(({
  label,
  editing,
  editValue,
  displayValue,
  children
}: {
  label: string;
  editing: boolean;
  editValue: React.ReactNode;
  displayValue: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="flex">
    <Text className="w-32">{label}:</Text>
    {editing ? editValue : displayValue}
    {children}
  </div>
));

FormField.displayName = 'FormField';

// Component xử lý input đầu vào
const InputField = React.memo(({
  name,
  value,
  placeholder = "",
  onChange
}: {
  name: string;
  value: string;
  placeholder?: string;
  onChange: (name: string, value: string) => void;
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(name, newValue);
  };

  return (
    <TextInput
      name={name}
      value={inputValue}
      placeholder={placeholder}
      onInputChange={handleChange}
    />
  );
});

InputField.displayName = 'InputField';

export default function PersonalInfo(): ReactElement {
  // --------------------------------------------------
  // STATE DEFINITIONS
  // --------------------------------------------------
  // Các trạng thái chính
  const [user, setUser] = useState<IUser>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableUser, setEditableUser] = useState<IUser>(DEFAULT_USER);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái modal đổi mật khẩu
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  // Refs cho các input fields
  const firstNameRef = useRef<HTMLInputElement>(null);
  const middleNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const wardRef = useRef<HTMLInputElement>(null);
  const districtRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const birthdayRef = useRef<HTMLInputElement>(null);

  // --------------------------------------------------
  // HELPER FUNCTIONS
  // --------------------------------------------------

  // Cập nhật giá trị từ refs vào state trước khi lưu
  const updateFromRefs = useCallback(() => {
    if (isEditing) {
      // Clone user để cập nhật
      const updatedUser = { ...editableUser };

      // Cập nhật thông tin tên
      if (!updatedUser.name) updatedUser.name = DEFAULT_USER.name;
      if (firstNameRef.current) updatedUser.name.first = firstNameRef.current.value;
      if (middleNameRef.current) updatedUser.name.middle = middleNameRef.current.value;
      if (lastNameRef.current) updatedUser.name.last = lastNameRef.current.value;

      // Cập nhật email
      if (emailRef.current) updatedUser.email = emailRef.current.value;

      // Cập nhật địa chỉ
      if (!updatedUser.address) updatedUser.address = DEFAULT_USER.address;
      if (numberRef.current) updatedUser.address.number = numberRef.current.value;
      if (streetRef.current) updatedUser.address.street = streetRef.current.value;
      if (wardRef.current) updatedUser.address.ward = wardRef.current.value;
      if (districtRef.current) updatedUser.address.district = districtRef.current.value;
      if (cityRef.current) updatedUser.address.city = cityRef.current.value;

      // Cập nhật ngày sinh
      if (birthdayRef.current && birthdayRef.current.value) {
        updatedUser.birthday = new Date(birthdayRef.current.value);
      }

      setEditableUser(updatedUser);
    }
  }, [editableUser, isEditing]);

  // --------------------------------------------------
  // API HANDLERS
  // --------------------------------------------------
  /**
   * Lấy thông tin người dùng hiện tại từ API
   */
  const getCurrentUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const meApiResponse = await me();
      if (!meApiResponse.ok) {
        throw new Error(`Lỗi API me: ${meApiResponse.status} ${meApiResponse.statusText}`);
      }

      const responseText = await meApiResponse.text();
      if (!responseText) {
        throw new Error('Phản hồi API me trống');
      }

      const meApiJson: IAccountPayload = JSON.parse(responseText);
      const accountId = meApiJson._id;
      if (!accountId) {
        throw new Error('Không tìm thấy ID tài khoản');
      }

      // Kiểm tra quyền quản trị
      const isAdmin = await checkAdminPrivilege();
      await fetchUserData(accountId, isAdmin);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Kiểm tra quyền quản trị của người dùng
   */
  const checkAdminPrivilege = useCallback(async (): Promise<boolean> => {
    try {
      const authResponse = await auth(ERoleAction.READ, ECollectionNames.ACCOUNT);
      if (authResponse.ok) {
        const authData = await authResponse.json();
        return authData.isAccountHadPrivilage === true;
      }
    } catch {
      // Xử lý lỗi mặc định
    }
    return false;
  }, []);

  /**
   * Lấy thông tin người dùng dựa trên ID tài khoản
   */
  const fetchUserData = useCallback(async (accountId: string, isAdmin: boolean): Promise<void> => {
    try {
      const userApiResponse = await fetch(`/api/user/account/${accountId}`);

      if (userApiResponse.ok) {
        await handleExistingUserData(userApiResponse, isAdmin);
      } else if (userApiResponse.status === 404) {
        handleNewUserSetup(accountId, isAdmin);
      } else {
        throw new Error(`Lỗi API user: ${userApiResponse.status} ${userApiResponse.statusText}`);
      }
    } catch (error) {
      alert(`Lỗi khi lấy thông tin người dùng: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  }, []);

  /**
   * Xử lý dữ liệu khi người dùng đã tồn tại trong hệ thống
   */
  const handleExistingUserData = useCallback(async (response: Response, isAdmin: boolean): Promise<void> => {
    const userResponseText = await response.text();
    if (!userResponseText) {
      throw new Error('Phản hồi API user trống');
    }

    const userApiJson: IUser = JSON.parse(userResponseText);
    const completeUser = {
      ...DEFAULT_USER,
      ...userApiJson,
      name: {
        ...DEFAULT_USER.name,
        ...(userApiJson.name || {})
      },
      address: {
        ...DEFAULT_USER.address,
        ...(userApiJson.address || {})
      },
      gender: userApiJson.gender,
      position: isAdmin ? 'Quản lý' : 'Nhân viên'
    };

    setUser(completeUser);
  }, []);

  /**
   * Cài đặt thông tin ban đầu cho người dùng mới
   */
  const handleNewUserSetup = useCallback((accountId: string, isAdmin: boolean): void => {
    const emptyUserInfo: IUser = {
      ...DEFAULT_USER,
      account_id: accountId,
      name: {
        first: '',
        last: ''
      },
      email: '',
      gender: DEFAULT_USER.gender,
      address: {
        number: '',
        street: '',
        ward: '',
        district: '',
        city: '',
        country: ''
      },
      avatar: undefined,
      position: isAdmin ? 'Quản lý' : 'Nhân viên'
    };

    setUser(emptyUserInfo);
    setEditableUser(emptyUserInfo);
    setIsEditing(true);
    alert('Vui lòng cập nhật thông tin cá nhân của bạn.');
  }, []);

  // --------------------------------------------------
  // UPDATE HANDLERS
  // --------------------------------------------------
  /**
   * Lưu thông tin cho người dùng lần đầu
   */
  const handleSaveFirstTimeUser = useCallback(async (): Promise<void> => {
    if (!editableUser.name?.first || editableUser.name.first.trim() === '') {
      alert('Vui lòng nhập họ của bạn!');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        ...editableUser,
        account_id: user.account_id,
        created_at: new Date(),
        updated_at: new Date()
      };

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Lưu thông tin không thành công: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Phản hồi API tạo thông tin trống');
      }

      const createdUser = JSON.parse(responseText);
      setUser(createdUser);
      setIsEditing(false);
      alert('Lưu thông tin cá nhân thành công!');
    } catch (error) {
      alert(`Lỗi khi lưu thông tin: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editableUser, user.account_id]);

  // Cập nhật giá trị vào refs khi bắt đầu chỉnh sửa
  useEffect(() => {
    if (isEditing) {
      if (firstNameRef.current) firstNameRef.current.value = editableUser.name?.first || '';
      if (middleNameRef.current) middleNameRef.current.value = editableUser.name?.middle || '';
      if (lastNameRef.current) lastNameRef.current.value = editableUser.name?.last || '';
      if (emailRef.current) emailRef.current.value = editableUser.email || '';
      if (numberRef.current) numberRef.current.value = editableUser.address?.number || '';
      if (streetRef.current) streetRef.current.value = editableUser.address?.street || '';
      if (wardRef.current) wardRef.current.value = editableUser.address?.ward || '';
      if (districtRef.current) districtRef.current.value = editableUser.address?.district || '';
      if (cityRef.current) cityRef.current.value = editableUser.address?.city || '';
      if (birthdayRef.current && editableUser.birthday) {
        birthdayRef.current.value = new Date(editableUser.birthday).toISOString().split('T')[0];
      }
    }
  }, [isEditing, editableUser]);

  // Cập nhật handleSaveChanges để đọc từ refs
  const handleSaveChanges = useCallback(async (): Promise<void> => {
    if (!user._id) {
      return handleSaveFirstTimeUser();
    }

    // Cập nhật thông tin từ refs trước khi lưu
    updateFromRefs();

    if (!editableUser.name?.first || firstNameRef.current?.value.trim() === '') {
      alert('Vui lòng nhập họ của bạn!');
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        ...editableUser,
        _id: user._id,
        account_id: user.account_id,
        updated_at: new Date()
      };

      const response = await fetch(`/api/user/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (!errorText) {
          throw new Error(`Cập nhật thông tin không thành công: ${response.status} ${response.statusText}`);
        }

        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Cập nhật thông tin không thành công');
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Phản hồi API cập nhật thông tin trống');
      }

      // Cập nhật thông tin người dùng
      const updatedUser = JSON.parse(responseText);
      setUser(updatedUser);
      setIsEditing(false);
      alert('Cập nhật thông tin cá nhân thành công!');
    } catch (error) {
      alert(`Lỗi khi cập nhật thông tin: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  }, [editableUser, handleSaveFirstTimeUser, user._id, user.account_id, updateFromRefs]);

  // --------------------------------------------------
  // USER INTERACTION HANDLERS
  // --------------------------------------------------
  /**
   * Bắt đầu hoặc lưu thông tin chỉnh sửa
   */
  const handleEditActions = useCallback((): void => {
    if (isEditing) {
      handleSaveChanges();
    } else {
      setEditableUser({ ...user });
      setIsEditing(true);
    }
  }, [isEditing, user, handleSaveChanges]);

  /**
   * Xử lý khi người dùng thay đổi avatar
   */
  const handleImageChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditableUser(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  /**
   * Xử lý khi người dùng chọn ảnh từ thiết bị
   */
  const handleSelectImage = useCallback((): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Hiển thị giới tính người dùng dưới dạng văn bản
   */
  const getGenderText = useCallback((genderValue: string | undefined): string => {
    switch (genderValue) {
      case "1": return "Nam";
      case "2": return "Nữ";
      default: return "Không xác định";
    }
  }, []);

  // --------------------------------------------------
  // PASSWORD MANAGEMENT
  // --------------------------------------------------
  /**
   * Mở modal đổi mật khẩu
   */
  const handleOpenChangePasswordModal = useCallback((): void => {
    setIsChangePasswordModalOpen(true);
  }, []);

  /**
   * Đóng modal đổi mật khẩu
   */
  const handleCloseChangePasswordModal = useCallback((): void => {
    setIsChangePasswordModalOpen(false);
  }, []);

  /**
   * Thực hiện đổi mật khẩu
   */
  const handleChangePassword = useCallback(async (data: { current_password: string, password: string }): Promise<void> => {
    if (!user.account_id) {
      throw new Error('Không tìm thấy ID tài khoản');
    }

    const response = await fetch(`/api/user/account/${user.account_id}/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Đổi mật khẩu không thành công: ${response.status} ${response.statusText}`;

      try {
        if (errorText) {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        }
      } catch {
        // Bỏ qua lỗi khi parse JSON
      }

      throw new Error(errorMessage);
    }
  }, [user.account_id]);

  /**
   * Xử lý đăng xuất khỏi hệ thống
   */
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      const response = await logout();
      if (response.ok) {
        redirect('/auth/login');
      } else {
        alert('Đăng xuất không thành công, vui lòng thử lại sau!');
      }
    } catch (error) {
      alert(`Lỗi khi đăng xuất: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  }, []);

  const handleCancelEdit = useCallback((): void => {
    setEditableUser({ ...user });
    setIsEditing(false);
  }, [user]);

  // --------------------------------------------------
  // EFFECTS
  // --------------------------------------------------
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  // ----- RENDER COMPONENTS -----

  // Component cho ảnh đại diện
  const AvatarSection = useCallback(() => (
    <div className="flex flex-col items-center mb-6 mt-10">
      <div
        className={`w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative ${isEditing ? 'cursor-pointer hover:opacity-75' : ''}`}
        onClick={isEditing ? handleSelectImage : undefined}
      >
        {editableUser.avatar && isEditing ? (
          <Image src={editableUser.avatar} alt="Avatar" width={150} height={150} className="object-cover w-full h-full" unoptimized={true} />
        ) : user.avatar ? (
          <Image src={user.avatar} alt="Avatar" width={150} height={150} className="object-cover w-full h-full" unoptimized={true} />
        ) : (
          <Image src="/avatar.png" alt="Default avatar" width={150} height={150} className="object-cover w-full h-full" priority />
        )}
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
            <Text className="text-white">Thay đổi</Text>
          </div>
        )}
      </div>
    </div>
  ), [editableUser.avatar, user.avatar, isEditing, handleSelectImage]);

  // Component cho phần thông tin người dùng
  const UserInfoSection = useCallback(() => (
    <div className="flex-1">
      <div className="space-y-2">
        {/* Họ tên */}
        <FormField
          label="Họ tên"
          editing={isEditing}
          editValue={
            <div className="flex space-x-2">
              <input
                ref={firstNameRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Họ"
                defaultValue={editableUser.name?.first || ''}
              />
              <input
                ref={middleNameRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Tên đệm"
                defaultValue={editableUser.name?.middle || ''}
              />
              <input
                ref={lastNameRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Tên"
                defaultValue={editableUser.name?.last || ''}
              />
            </div>
          }
          displayValue={<Text>{user.name?.first || ''} {user.name?.middle || ''} {user.name?.last || ''}</Text>}
        />

        {/* Chức vụ */}
        <FormField
          label="Chức vụ"
          editing={isEditing}
          editValue={<Text>{user.position || 'Nhân viên'}</Text>}
          displayValue={<Text>{user.position || 'Quản lý'}</Text>}
        />

        {/* Số điện thoại */}
        <FormField
          label="Số điện thoại"
          editing={isEditing}
          editValue={
            <input
              type="text"
              value="0369445470"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              readOnly
            />
          }
          displayValue={<Text>0369445470</Text>}
        />

        {/* Email */}
        <FormField
          label="Email"
          editing={isEditing}
          editValue={
            <input
              ref={emailRef}
              type="email"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Email"
              defaultValue={editableUser.email || ''}
            />
          }
          displayValue={<Text>{user.email || ''}</Text>}
        />

        {/* Địa chỉ */}
        <FormField
          label="Địa chỉ"
          editing={isEditing}
          editValue={
            <div className="flex flex-col space-y-2">
              <input
                ref={numberRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Số nhà"
                defaultValue={editableUser.address?.number || ''}
              />
              <input
                ref={streetRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Đường"
                defaultValue={editableUser.address?.street || ''}
              />
              <input
                ref={wardRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Phường"
                defaultValue={editableUser.address?.ward || ''}
              />
              <input
                ref={districtRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Quận"
                defaultValue={editableUser.address?.district || ''}
              />
              <input
                ref={cityRef}
                type="text"
                className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Thành phố"
                defaultValue={editableUser.address?.city || ''}
              />
            </div>
          }
          displayValue={
            <Text>
              {user.address?.number || ''} {user.address?.street || ''},
              {user.address?.ward ? ` P.${user.address.ward},` : ''}
              {user.address?.district ? ` Q.${user.address.district},` : ''}
              {user.address?.city || ''}
            </Text>
          }
        />

        {/* Ngày sinh */}
        <FormField
          label="Ngày sinh"
          editing={isEditing}
          editValue={
            <input
              ref={birthdayRef}
              type="date"
              className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              defaultValue={editableUser.birthday ? new Date(editableUser.birthday).toISOString().split('T')[0] : ''}
            />
          }
          displayValue={<Text>{user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : ''}</Text>}
        />

        {/* Giới tính */}
        <FormField
          label="Giới tính"
          editing={isEditing}
          editValue={
            <select
              className="p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              defaultValue={editableUser.gender || "0"}
              onChange={(e) => {
                const genderValue = e.target.value;
                setEditableUser(prev => ({
                  ...prev,
                  gender: genderValue
                }));
              }}
            >
              <option value="1">Nam</option>
              <option value="2">Nữ</option>
              <option value="0">Không xác định</option>
            </select>
          }
          displayValue={<Text>{getGenderText(user.gender)}</Text>}
        />
      </div>
    </div>
  ), [isEditing, editableUser, user, getGenderText]);

  // Component cho phần actions
  const ActionButtons = useCallback(() => (
    <div className="flex gap-2 mt-4">
      <Button type={EButtonType.INFO} onClick={handleEditActions}>
        <Text>{isEditing ? 'Lưu' : 'Chỉnh sửa'}</Text>
      </Button>

      {isEditing && (
        <Button type={EButtonType.SUCCESS} onClick={handleCancelEdit}>
          <Text>Hủy</Text>
        </Button>
      )}

      <Button type={EButtonType.INFO} onClick={handleOpenChangePasswordModal}>
        <Text>Đổi mật khẩu</Text>
      </Button>

      <Button type={EButtonType.ERROR} onClick={handleLogout}>
        <Text>Đăng xuất</Text>
      </Button>
    </div>
  ), [isEditing, handleEditActions, handleOpenChangePasswordModal, handleLogout, handleCancelEdit]);

  // ----- MAIN RENDER -----
  return (
    <>
      {isLoading && <LoadingScreen />}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      <div className="p-4">
        <Text size={24} className="font-bold mb-4">Thông tin cá nhân</Text>

        <div className="flex flex-row gap-8">
          <AvatarSection />
          <UserInfoSection />
        </div>

        <ActionButtons />
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleCloseChangePasswordModal}
        isLoading={isLoading}
        onChangePassword={handleChangePassword}
      />
    </>
  )
}
