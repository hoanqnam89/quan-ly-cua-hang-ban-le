'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Button, Text, Modal } from '@/components';
import { EButtonType } from '@/components/button/interfaces/button-type.interface';
import Image from 'next/legacy/image';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    onChangePassword: (data: { current_password: string, password: string }) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    isOpen,
    onClose,
    isLoading: parentLoading,
    onChangePassword
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
                            defaultValue=""
                        />
                        <button
                            type="button"
                            onClick={toggleCurrentPasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                            {showCurrentPassword ? (
                                <Image
                                    src="/hide.svg"
                                    alt="Ẩn mật khẩu"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                />
                            ) : (
                                <Image
                                    src="/view.svg"
                                    alt="Hiển thị mật khẩu"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                />
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
                                <Image
                                    src="/hide.svg"
                                    alt="Ẩn mật khẩu"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                />
                            ) : (
                                <Image
                                    src="/view.svg"
                                    alt="Hiển thị mật khẩu"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                />
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Text>Xác nhận mật khẩu mới <span className="text-red-500">*</span></Text>
                    <div className="relative">
                        <input
                            ref={confirmPasswordRef}
                            type={showConfirmPassword ? "text" : ""}
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
                                <Image
                                    src="/hide.svg"
                                    alt="Ẩn mật khẩu"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                />
                            ) : (
                                <Image
                                    src="/view.svg"
                                    alt="Hiển thị mật khẩu"
                                    width={20}
                                    height={20}
                                    className="h-5 w-5"
                                />
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
};

export default ChangePasswordModal; 