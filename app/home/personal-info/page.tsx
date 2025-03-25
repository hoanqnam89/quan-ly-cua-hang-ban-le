'use client';

import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { LoadingScreen, Text, Button, TextInput, Modal } from '@/components'
import { IUser } from '@/interfaces';
import { DEFAULT_USER } from '@/constants/user.constant';
import { me, logout, auth } from '@/services/Auth';
import { IAccountPayload } from '@/app/api/interfaces/account-payload.interface';
import { ERoleAction } from '@/interfaces/role.interface';
import { ECollectionNames } from '@/enums';
import { redirect } from 'next/navigation';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import Image from 'next/image';
import DateInput from '@/components/date-input/date-input';

// Tách Component đổi mật khẩu thành một component riêng biệt
const ChangePasswordModal = React.memo(({
  isOpen,
  onClose,
  isLoading: parentLoading,
  onChangePassword
}: {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  onChangePassword: (data: { current_password: string, password: string }) => Promise<void>;
}) => {
  // Sử dụng useRef thay vì useState để tránh re-render khi nhập liệu
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // State để quản lý việc hiển thị/ẩn mật khẩu
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Reset form khi đóng modal
  const handleClose = useCallback((): void => {
    if (currentPasswordRef.current) currentPasswordRef.current.value = '';
    if (newPasswordRef.current) newPasswordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    setError('');
    // Reset các trạng thái hiển thị mật khẩu
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  }, [onClose]);

  // Các hàm xử lý việc hiển thị/ẩn mật khẩu
  const toggleCurrentPasswordVisibility = useCallback((): void => {
    setShowCurrentPassword(prev => !prev);
  }, []);

  const toggleNewPasswordVisibility = useCallback((): void => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback((): void => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Xử lý khi submit form đổi mật khẩu
  const handleSubmit = useCallback(async (): Promise<void> => {
    const currentPassword = currentPasswordRef.current?.value || '';
    const newPassword = newPasswordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';

    // Kiểm tra các trường nhập liệu
    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu mới');
      return;
    }

    if (newPassword.length < 5) {
      setError('Mật khẩu mới phải có ít nhất 5 ký tự');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onChangePassword({
        current_password: currentPassword,
        password: newPassword
      });

      handleClose();
      alert('Đổi mật khẩu thành công!');
    } catch (error) {
      setError(`Lỗi: ${error instanceof Error ? error.message : 'Không xác định'}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [handleClose, onChangePassword]);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={onClose}
      title="Đổi mật khẩu"
      showButtons={false}
    >
      <div className="space-y-4 p-4">
        {error && (
          <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-md mb-2">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Text>Mật khẩu hiện tại <span className="text-red-500">*</span></Text>
          <div className="relative">
            <input
              ref={currentPasswordRef}
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={toggleCurrentPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showCurrentPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Text>Mật khẩu mới <span className="text-red-500">*</span></Text>
          <div className="relative">
            <input
              ref={newPasswordRef}
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              placeholder="Tối thiểu 5 ký tự"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={toggleNewPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Text>Xác nhận mật khẩu mới <span className="text-red-500">*</span></Text>
          <div className="relative">
            <input
              ref={confirmPasswordRef}
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type={EButtonType.INFO} onClick={handleClose}>
            <Text>Hủy</Text>
          </Button>

          <Button type={EButtonType.INFO} onClick={handleSubmit} isDisable={isSubmitting || parentLoading}>
            <Text>{isSubmitting ? 'Đang xử lý...' : 'Lưu'}</Text>
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ChangePasswordModal.displayName = 'ChangePasswordModal';

export default function PersonalInfo(): ReactElement {
  // States chính
  const [user, setUser] = useState<IUser>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableUser, setEditableUser] = useState<IUser>(DEFAULT_USER);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States cho phần đổi mật khẩu
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

  // ----- PHẦN XỬ LÝ USER DATA -----
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

      // Kiểm tra xem người dùng có phải là quản trị viên không
      let isAdmin = false;
      try {
        const authResponse = await auth(ERoleAction.READ, ECollectionNames.ACCOUNT);

        if (authResponse.ok) {
          const authData = await authResponse.json();
          isAdmin = authData.isAccountHadPrivilage === true;
        }
      } catch (authError) {
        console.error('Lỗi khi kiểm tra quyền:', authError);
        isAdmin = false;
      }

      try {
        const userApiResponse = await fetch(`/api/user/account/${accountId}`);

        if (userApiResponse.ok) {
          const userResponseText = await userApiResponse.text();
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
        } else if (userApiResponse.status === 404) {
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
        } else {
          throw new Error(`Lỗi API user: ${userApiResponse.status} ${userApiResponse.statusText}`);
        }
      } catch (userError) {
        console.error('Lỗi khi xử lý thông tin người dùng:', userError);
        setUser({
          ...DEFAULT_USER,
          account_id: accountId
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      alert(`Lỗi khi lấy thông tin người dùng: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Xử lý lưu thay đổi khi người dùng chưa có hồ sơ trong hệ thống
  const handleSaveFirstTimeUser = async (): Promise<void> => {
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

      // Gọi API để tạo người dùng mới
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

      // Cập nhật state với dữ liệu mới
      const createdUser = JSON.parse(responseText);
      setUser(createdUser);
      setIsEditing(false);
      alert('Lưu thông tin cá nhân thành công!');
    } catch (error) {
      console.error('Lỗi khi lưu thông tin:', error);
      alert(`Lỗi khi lưu thông tin: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý lưu thay đổi
  const handleSaveChanges = async (): Promise<void> => {
    if (!user._id) {
      return handleSaveFirstTimeUser();
    }

    if (!editableUser.name?.first || editableUser.name.first.trim() === '') {
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

      // Gọi API để cập nhật thông tin
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

      // Cập nhật state với dữ liệu mới
      const updatedUser = JSON.parse(responseText);
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));

      setIsEditing(false);
      alert('Lưu thay đổi thành công!');

      // Tải lại dữ liệu người dùng
      getCurrentUser();
    } catch (error) {
      console.error('Lỗi khi lưu thông tin:', error);
      alert(`Lỗi khi lưu thông tin: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ----- PHẦN XỬ LÝ TƯƠNG TÁC NGƯỜI DÙNG -----

  // Bắt đầu chỉnh sửa hoặc lưu thay đổi
  const handleEdit = (): void => {
    if (isEditing) {
      handleSaveChanges();
    } else {
      setEditableUser({
        ...DEFAULT_USER,
        ...user,
        name: {
          ...DEFAULT_USER.name,
          ...(user.name || {})
        },
        address: {
          ...DEFAULT_USER.address,
          ...(user.address || {})
        },
        position: user.position
      });
      setIsEditing(true);
    }
  };

  // Đăng xuất
  const handleLogOut = async (): Promise<void> => {
    if (!confirm('Bạn có chắc bạn muốn đăng xuất?')) return;

    setIsLoading(true);
    await logout();
    redirect("/");
  };

  // ----- PHẦN XỬ LÝ THAY ĐỔI THÔNG TIN -----

  // Xử lý thay đổi input thông thường
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      const parentValue = editableUser[parent as keyof IUser] || {};

      setEditableUser({
        ...editableUser,
        [parent]: {
          ...parentValue,
          [child]: value
        }
      });
    } else {
      setEditableUser({
        ...editableUser,
        [name]: value
      });
    }
  };

  // Xử lý thay đổi ngày sinh
  const handleBirthdayChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEditableUser(prev => ({
      ...prev,
      birthday: new Date(e.target.value)
    }));
  };

  // Xử lý thay đổi giới tính
  const handleGenderChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setEditableUser(prev => ({
      ...prev,
      gender: e.target.value
    }));
  };

  // Hiển thị văn bản giới tính
  const getGenderText = (genderValue: string | undefined): string => {
    switch (genderValue) {
      case "1": return "Nam";
      case "2": return "Nữ";
      default: return "Không xác định";
    }
  };

  // ----- PHẦN XỬ LÝ ẢNH ĐẠI DIỆN -----

  // Xử lý khi click vào ảnh đại diện
  const handleAvatarClick = (): void => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  // Xử lý khi chọn ảnh mới
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        console.error("Không thể đọc file hình ảnh");
        return;
      }

      // Xử lý và nén ảnh
      const img = document.createElement('img');

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        // Tính toán kích thước mới giữ nguyên tỷ lệ
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        // Thiết lập kích thước canvas
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setEditableUser(prevState => ({
            ...prevState,
            avatar: compressedDataUrl
          }));
        }
      };

      img.src = event.target.result as string;
    };

    reader.onerror = () => {
      console.error("Lỗi khi đọc file");
    };

    reader.readAsDataURL(file);
  };

  // ----- PHẦN XỬ LÝ ĐỔI MẬT KHẨU -----

  // Xử lý đổi mật khẩu
  const handleChangePassword = useCallback(async (passwordData: { current_password: string, password: string }): Promise<void> => {
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

      const response = await fetch(`/api/account/change-password/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...passwordData,
          _id: accountId
        }),
      });

      const responseData = await response.text();

      if (!response.ok) {
        let errorMessage = 'Đổi mật khẩu không thành công';
        try {
          if (responseData) {
            const errorData = JSON.parse(responseData);
            errorMessage = errorData.message || errorData.error || 'Đổi mật khẩu không thành công';
          }
        } catch (parseError) {
          console.error('Lỗi khi phân tích phản hồi lỗi:', parseError);
        }
        throw new Error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ----- HOOKS EFFECTS -----
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  // ----- RENDER COMPONENTS -----

  // Component cho ảnh đại diện
  const AvatarSection = () => (
    <div className="flex flex-col items-center mb-6 mt-10">
      <div
        className={`w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center relative ${isEditing ? 'cursor-pointer hover:opacity-75' : ''}`}
        onClick={handleAvatarClick}
      >
        {editableUser.avatar && isEditing ? (
          <Image
            src={editableUser.avatar}
            alt="Avatar"
            width={150}
            height={150}
            className="object-cover w-full h-full"
            unoptimized={true}
          />
        ) : user.avatar ? (
          <Image
            src={user.avatar}
            alt="Avatar"
            width={150}
            height={150}
            className="object-cover w-full h-full"
            unoptimized={true}
          />
        ) : (
          <Text size={36}>{user.name?.first?.charAt(0) || ''}{user.name?.last?.charAt(0) || ''}</Text>
        )}
        {isEditing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity">
            <Text className="text-white">Thay đổi</Text>
          </div>
        )}
      </div>
    </div>
  );

  // Component cho phần actions
  const ActionButtons = () => (
    <div className="flex gap-2 mt-4">
      <Button type={EButtonType.INFO} onClick={handleEdit}>
        <Text>{isEditing ? 'Lưu' : 'Chỉnh sửa'}</Text>
      </Button>

      <Button type={EButtonType.INFO} onClick={() => setIsChangePasswordModalOpen(true)}>
        <Text>Đổi mật khẩu</Text>
      </Button>

      <Button type={EButtonType.INFO}>
        <Text>Quên mật khẩu?</Text>
      </Button>

      <Button type={EButtonType.ERROR} onClick={handleLogOut}>
        <Text>Đăng xuất</Text>
      </Button>
    </div>
  );

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
          {/* Ảnh đại diện bên trái */}
          <AvatarSection />

          {/* Thông tin bên phải */}
          <div className="flex-1">
            <div className="space-y-2">
              {/* Họ tên */}
              <div className="flex">
                <Text className="w-32">Họ tên:</Text>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <TextInput
                      name="name.first"
                      value={editableUser.name?.first || ''}
                      onInputChange={handleInputChange}
                    />
                    <TextInput
                      name="name.middle"
                      value={editableUser.name?.middle || ''}
                      onInputChange={handleInputChange}
                    />
                    <TextInput
                      name="name.last"
                      value={editableUser.name?.last || ''}
                      onInputChange={handleInputChange}
                    />
                  </div>
                ) : (
                  <Text>{user.name?.first || ''} {user.name?.middle || ''} {user.name?.last || ''}</Text>
                )}
              </div>

              {/* Chức vụ */}
              <div className="flex">
                <Text className="w-32">Chức vụ:</Text>
                <Text>{user.position || 'Nhân viênviên'}</Text>
              </div>

              {/* Số điện thoại */}
              <div className="flex">
                <Text className="w-32">Số điện thoại:</Text>
                {isEditing ? (
                  <TextInput
                    name="phoneNumber"
                    value={'0369445470'}
                    onInputChange={() => { }}
                  />
                ) : (
                  <Text>0369445470</Text>
                )}
              </div>

              {/* Email */}
              <div className="flex">
                <Text className="w-32">Email:</Text>
                {isEditing ? (
                  <TextInput
                    name="email"
                    value={editableUser.email}
                    onInputChange={handleInputChange}
                  />
                ) : (
                  <Text>{user.email}</Text>
                )}
              </div>

              {/* Địa chỉ */}
              <div className="flex">
                <Text className="w-32">Địa chỉ:</Text>
                {isEditing ? (
                  <div className="flex flex-col space-y-2">
                    <TextInput
                      name="address.number"
                      placeholder="Số nhà"
                      value={editableUser.address?.number || ''}
                      onInputChange={handleInputChange}
                    />
                    <TextInput
                      name="address.street"
                      placeholder="Đường"
                      value={editableUser.address?.street || ''}
                      onInputChange={handleInputChange}
                    />
                    <TextInput
                      name="address.ward"
                      placeholder="Phường"
                      value={editableUser.address?.ward || ''}
                      onInputChange={handleInputChange}
                    />
                    <TextInput
                      name="address.district"
                      placeholder="Quận"
                      value={editableUser.address?.district || ''}
                      onInputChange={handleInputChange}
                    />
                    <TextInput
                      name="address.city"
                      placeholder="Thành phố"
                      value={editableUser.address?.city || ''}
                      onInputChange={handleInputChange}
                    />
                  </div>
                ) : (
                  <Text>
                    {user.address?.number || ''} {user.address?.street || ''},
                    {user.address?.ward ? ` P.${user.address.ward},` : ''}
                    {user.address?.district ? ` Q.${user.address.district},` : ''}
                    {user.address?.city || ''}
                  </Text>
                )}
              </div>

              {/* Ngày sinh */}
              <div className="flex">
                <Text className="w-32">Ngày sinh:</Text>
                {isEditing ? (
                  <DateInput
                    name="birthday"
                    value={editableUser.birthday}
                    onInputChange={handleBirthdayChange}
                  />
                ) : (
                  <Text>{user.birthday ? new Date(user.birthday).toLocaleDateString('vi-VN') : ''}</Text>
                )}
              </div>

              {/* Giới tính */}
              <div className="flex">
                <Text className="w-32">Giới tính:</Text>
                {isEditing ? (
                  <select
                    className="p-2 outline outline-1 rounded"
                    value={editableUser.gender || ""}
                    onChange={handleGenderChange}
                  >
                    <option value="1">Nam</option>
                    <option value="2">Nữ</option>
                    <option value="0">Không xác định</option>
                  </select>
                ) : (
                  <Text>{getGenderText(user.gender)}</Text>
                )}
              </div>
            </div>
          </div>
        </div>

        <ActionButtons />
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        isLoading={isLoading}
        onChangePassword={handleChangePassword}
      />
    </>
  )
}
