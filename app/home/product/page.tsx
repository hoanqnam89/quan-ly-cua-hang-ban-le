'use client';

import { Button, IconContainer, SelectDropdown, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { pencilIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import Image from 'next/image';
import styles from './style.module.css';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { IBusiness } from '@/interfaces/business.interface';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { formatCurrency } from '@/utils/format-currency';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ICategory } from '@/interfaces/category.interface';
import { IProduct } from '@/interfaces/product.interface';
import { DEFAULT_PROCDUCT } from '@/constants/product.constant';
import { createCollectionDetailLink } from '@/utils/create-collection-detail-link';
import { IUnit } from '@/interfaces/unit.interface';
import { EStatusCode } from '@/enums/status-code.enum';
import { addCollection } from '@/services/api-service';
import { ENotificationType } from '@/components/notify/notification/notification';

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;

export default function Product() {
  const { createNotification, notificationElements } = useNotificationsHook();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [product, setProduct] = useState<collectionType>(DEFAULT_PROCDUCT);
  const [isModalReadOnly, setIsModalReadOnly] = useState<boolean>(false);
  const [isClickShowMore, setIsClickShowMore] = useState<ICollectionIdNotify>({
    id: ``,
    isClicked: false
  });
  const [isClickDelete, setIsClickDelete] = useState<ICollectionIdNotify>({
    id: ``,
    isClicked: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supplierOptions, setSupplierOptions] = useState<ISelectOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ISelectOption[]>([]);
  const [supplier, setSupplier] = useState<IBusiness[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<collectionType[]>([]);
  const [units, setUnits] = useState<IUnit[]>([]);

  // Dùng ref để đảm bảo chỉ gọi API khi cần thiết
  const dataFetched = useRef(false);
  const productAdded = useRef(false);

  // Hàm fetch data chỉ chạy 1 lần khi component mount
  useEffect(() => {
    // Nếu đã fetch data rồi thì không fetch nữa
    if (dataFetched.current) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        console.log("Đang tải dữ liệu ban đầu...");

        // Fetch tất cả dữ liệu cần thiết
        const [newBusinesses, newCategories, newUnits, fetchedProducts] = await Promise.all([
          fetchGetCollections<IBusiness>(ECollectionNames.BUSINESS),
          fetchGetCollections<ICategory>(ECollectionNames.CATEGORY),
          fetchGetCollections<IUnit>(ECollectionNames.UNIT),
          fetchGetCollections<IProduct>(ECollectionNames.PRODUCT)
        ]);

        // Xử lý suppliers
        const newSuppliers = newBusinesses.filter(
          (business: IBusiness): boolean => business.type !== 'SUPPLIER'
        );
        setSupplier(newSuppliers);

        // Chỉ set supplier_id nếu chưa có
        if (newSuppliers.length > 0) {
          setProduct(prev => ({
            ...prev,
            supplier_id: prev.supplier_id || newSuppliers[0]._id,
          }));
        }

        setSupplierOptions(
          newSuppliers.map((supplier: IBusiness): ISelectOption => ({
            label: `${supplier.name}`,
            value: supplier._id,
          }))
        );

        // Xử lý categories
        setCategories(newCategories);

        // Chỉ set category_id nếu chưa có
        if (newCategories.length > 0) {
          setProduct(prev => ({
            ...prev,
            category_id: prev.category_id || newCategories[0]._id,
          }));
        }

        setCategoryOptions(
          newCategories.map((category: ICategory): ISelectOption => ({
            label: `${category.name}`,
            value: category._id,
          }))
        );

        // Xử lý units
        setUnits(newUnits);

        // Xử lý products
        // Sắp xếp sản phẩm theo thời gian tạo mới nhất
        fetchedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const newProducts = fetchedProducts.map((product) => {
          const newProduct = { ...product } as any;
          const foundCategory = newCategories.find((category) => category._id === product.category_id);
          newProduct.category = foundCategory?.name;

          const foundSupplier = newSuppliers.find((supplier2) => supplier2._id === product.supplier_id);
          newProduct.supplier = foundSupplier?.name;
          return newProduct;
        });

        setProducts(newProducts);

        // Đánh dấu đã tải dữ liệu
        dataFetched.current = true;
        console.log("Đã tải dữ liệu xong!");
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // Chỉ chạy 1 lần khi component mount

  // Tách riêng useEffect cho việc tải lại dữ liệu khi thêm sản phẩm thành công
  useEffect(() => {
    // Nếu đã thêm sản phẩm thành công thì tải lại dữ liệu
    if (productAdded.current) {
      const reloadProducts = async () => {
        setIsLoading(true);
        try {
          console.log("Đang tải lại danh sách sản phẩm...");

          // Chỉ cần tải lại sản phẩm, không cần tải lại các dữ liệu khác
          const fetchedProducts = await fetchGetCollections<IProduct>(ECollectionNames.PRODUCT);

          // Sắp xếp sản phẩm theo thời gian tạo mới nhất
          fetchedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          const newProducts = fetchedProducts.map((product) => {
            const newProduct = { ...product } as any;
            const foundCategory = categories.find((category) => category._id === product.category_id);
            newProduct.category = foundCategory?.name;

            const foundSupplier = supplier.find((supplier2) => supplier2._id === product.supplier_id);
            newProduct.supplier = foundSupplier?.name;
            return newProduct;
          });

          setProducts(newProducts);

          // Đặt lại trạng thái
          productAdded.current = false;
          console.log("Đã tải lại danh sách sản phẩm xong!");
        } catch (error) {
          console.error('Lỗi khi tải lại danh sách sản phẩm:', error);
        } finally {
          setIsLoading(false);
        }
      };

      reloadProducts();
    }
  }, [categories, supplier]);

  // Thêm xử lý riêng cho product page khi xóa
  const handleProductDelete = useCallback((productId: string) => {
    // Cập nhật UI ngay lập tức
    setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));

    // Đánh dấu để xóa
    setIsClickDelete({
      id: productId,
      isClicked: true
    });
  }, []);

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const validImageFiles: File[] = [];
    if (!files)
      return;

    for (let i = 0; i < files.length; i++) {
      const file: File = files[i];
      if (file) {
        validImageFiles.push(file);
      }
    }

    setImageFiles([...validImageFiles]);
  }

  useEffect(() => {
    const images: string[] = [];
    const fileReaders: FileReader[] = [];
    let isCancel = false;

    if (imageFiles.length) {
      imageFiles.forEach((file: File) => {
        const fileReader: FileReader = new FileReader();
        fileReaders.push(fileReader);
        fileReader.onload = (e: ProgressEvent<FileReader>) => {
          const result = e.target?.result;
          if (result) {
            images.push(result.toString());
          }

          if (images.length === imageFiles.length && !isCancel) {
            setProduct({
              ...product,
              image_links: images,
            });
          }
        }
        fileReader.readAsDataURL(file);
      });
    }

    return () => {
      isCancel = true;
      fileReaders.forEach((fileReader: FileReader) => {
        if (fileReader.readyState === 1) {
          fileReader.abort();
        }
      });
    }
  }, [imageFiles, product]);

  const columns: Array<IColumnProps<collectionType>> = [
    {
      key: `index`,
      ref: useRef(null),
      title: `#`,
      size: `1fr`,
    },
    {
      key: `code`,
      ref: useRef(null),
      title: `Mã`,
      size: `4fr`,
    },
    {
      key: `image_links`,
      ref: useRef(null),
      title: `Hình ảnh`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement =>
        <div className="flex items-center justify-center min-h-[60px]">
          {
            collection.image_links?.map((image: string, index: number) =>
              image ? (
                <div
                  key={index}
                  className={`relative ${styles[`image-container`]}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}
                >
                  <Image
                    className="object-contain max-h-[56px] max-w-[56px]"
                    src={image}
                    alt={``}
                    width={56}
                    height={56}
                    quality={10}
                  />
                </div>
              ) : null
            ) || []
          }
        </div>
    },
    {
      key: `code`,
      ref: useRef(null),
      title: `Nhà cung cấp`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const foundSupplier = supplier.find((element) => element._id === collection.supplier_id)
        return <p>{foundSupplier?.name}</p>
      }
    },
    {
      key: `name`,
      ref: useRef(null),
      title: `Tên sản phẩm`,
      size: `4fr`,
    },
    {
      key: `name`,
      ref: useRef(null),
      title: `Loại sản phẩm`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const foundCategories = categories.find((element) => {
          return element._id === collection.category_id
        })
        return <p>{foundCategories?.name}</p>

      }
    },
    {
      key: `description`,
      ref: useRef(null),
      title: `Mô tả`,
      size: `5fr`,
    },
    {
      key: `input_price`,
      ref: useRef(null),
      title: `Giá nhập`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement =>
        <Text>{formatCurrency(collection.input_price)}</Text>
    },
    {
      key: `output_price`,
      ref: useRef(null),
      title: `Giá bán`,
      size: `3fr`,
      render: (collection: collectionType): ReactElement =>
        <Text>{formatCurrency(collection.output_price)}</Text>
    },

    {
      key: `created_at`,
      ref: useRef(null),
      title: `Ngày tạo`,
      size: `4fr`,
      render: (collection: collectionType): ReactElement => {
        const date: string = new Date(collection.created_at).toLocaleDateString();
        return <Text isEllipsis={true} tooltip={date}>{date}</Text>
      }
    },
    {
      title: `Thao tác`,
      ref: useRef(null),
      size: `4fr`,
      render: (collection: collectionType): ReactElement => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, minHeight: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8, padding: 6, transition: 'background 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e0e7ef')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
          >
            <Button
              title={createMoreInfoTooltip(collectionName)}
              onClick={(): void => {
                setIsClickShowMore({
                  id: collection._id,
                  isClicked: !isClickShowMore.isClicked,
                });
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                cursor: 'pointer',
              }}
            >
              <IconContainer
                tooltip={createMoreInfoTooltip(collectionName)}
                iconLink={pencilIcon}
                style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8, padding: 6, transition: 'background 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fde8e8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
          >
            <Button
              title={createDeleteTooltip(collectionName)}
              onClick={(): void => {
                // Gọi hàm xử lý xóa sản phẩm cụ thể
                handleProductDelete(collection._id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
                cursor: 'pointer',
              }}
            >
              <IconContainer
                tooltip={createDeleteTooltip(collectionName)}
                iconLink={trashIcon}
                style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              />
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8, padding: 6, transition: 'background 0.2s', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e0e7ef')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f3f4f6')}
          >
            {createCollectionDetailLink(collectionName, collection._id)}
          </div>
        </div>
      )
    },
  ];

  const handleChangeBusinessId = (e: ChangeEvent<HTMLSelectElement>): void => {
    setProduct({
      ...product,
      supplier_id: e.target.value,
    });
  }
  const handleChangeCategoryId = (e: ChangeEvent<HTMLSelectElement>): void => {
    const categoryId = e.target.value;
    setProduct({
      ...product,
      category_id: categoryId,
    });
  }

  const handleDeleteImage = (index: number): void => {
    const newImages: string[] = product.image_links?.filter(
      (_image: string, imageIndex: number) => imageIndex !== index
    ) || [];
    const newImageFiles: File[] = imageFiles.filter(
      (_imageFile: File, imageFileIndex: number) => imageFileIndex !== index
    );
    setProduct({
      ...product,
      image_links: newImages,
    });
    setImageFiles([...newImageFiles]);
  }

  const gridColumns: string = `200px 1fr`;

  const handleOpenModal = (prev: boolean): boolean => {
    return !prev;
  }

  function handleChangeProduct(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value,
    }));
  }

  // Custom handle add collection
  const customHandleAddCollection = async (): Promise<void> => {
    try {
      console.log("Đang thêm sản phẩm mới...");
      const response = await addCollection<IProduct>(product, collectionName);

      if (response.status === EStatusCode.CREATED || response.status === EStatusCode.OK) {
        console.log("Thêm sản phẩm thành công, đang cập nhật lại danh sách...");

        // Cập nhật lại danh sách sản phẩm trực tiếp
        const fetchedProducts = await fetchGetCollections<IProduct>(ECollectionNames.PRODUCT);
        // Sắp xếp sản phẩm theo thời gian tạo mới nhất
        fetchedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const newProducts = fetchedProducts.map((product) => {
          const newProduct = { ...product } as any;
          const foundCategory = categories.find((category) => category._id === product.category_id);
          newProduct.category = foundCategory?.name;

          const foundSupplier = supplier.find((supplier2) => supplier2._id === product.supplier_id);
          newProduct.supplier = foundSupplier?.name;
          return newProduct;
        });

        // Cập nhật danh sách sản phẩm trực tiếp
        setProducts(newProducts);

        // Hiển thị thông báo thành công
        createNotification({
          id: Date.now(),
          children: `Lưu sản phẩm ${product.name} thành công!`,
          type: ENotificationType.SUCCESS,
          isAutoClose: true,
          title: 'Thành công'
        });

        // Reset form
        setProduct(DEFAULT_PROCDUCT);
        setImageFiles([]);
      } else {
        // Hiển thị thông báo lỗi
        let errorMessage = "Lưu sản phẩm thất bại!";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage += ' ' + errorData.message;
          }
        } catch { }

        createNotification({
          id: Date.now(),
          children: errorMessage,
          type: ENotificationType.ERROR,
          isAutoClose: true,
          title: 'Lỗi'
        });
      }

      return;
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);

      // Hiển thị thông báo lỗi
      createNotification({
        id: Date.now(),
        children: `Lỗi khi lưu sản phẩm: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        type: ENotificationType.ERROR,
        isAutoClose: true,
        title: 'Lỗi'
      });
    }
  };

  return (
    <ManagerPage
      columns={columns}
      collectionName={collectionName}
      defaultCollection={DEFAULT_PROCDUCT}
      collection={product}
      setCollection={setProduct}
      isModalReadonly={isModalReadOnly}
      setIsModalReadonly={setIsModalReadOnly}
      isClickShowMore={isClickShowMore}
      isClickDelete={isClickDelete}
      isLoaded={isLoading}
      handleOpenModal={handleOpenModal}
      displayedItems={products}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      totalItems={products.length}
      customHandleAddCollection={customHandleAddCollection}
    >
      <>
        <Tabs>
          <TabItem label={`${translateCollectionName(collectionName)}`}>
            <InputSection label={`Nhà cung cấp`}>
              <SelectDropdown
                name={`business_id`}
                isLoading={isLoading}
                isDisable={isModalReadOnly}
                options={supplierOptions}
                defaultOptionIndex={getSelectedOptionIndex(
                  supplierOptions, product.supplier_id
                )}
                onInputChange={handleChangeBusinessId}
              >
              </SelectDropdown>
            </InputSection>

            <InputSection label={`Loại sản phẩm`}>
              <SelectDropdown
                name={`category_id`}
                isLoading={isLoading}
                isDisable={isModalReadOnly}
                options={categoryOptions}
                defaultOptionIndex={getSelectedOptionIndex(
                  categoryOptions, product.category_id
                )}
                onInputChange={handleChangeCategoryId}
              >
              </SelectDropdown>
            </InputSection>

            <InputSection label={`Tên sản phẩm`} gridColumns={gridColumns}>
              <TextInput
                name={`name`}
                isDisable={isModalReadOnly}
                value={product.name}
                onInputChange={handleChangeProduct}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Mô tả`} gridColumns={gridColumns}>
              <TextInput
                name={`description`}
                isDisable={isModalReadOnly}
                value={product.description}
                onInputChange={handleChangeProduct}
              >
              </TextInput>
            </InputSection>

            <InputSection label={`Hình ảnh sản phẩm`} gridColumns={gridColumns}>
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
                    product.image_links?.map((image: string, index: number) => (
                      <div
                        key={index}
                        className={`relative ${styles[`image-container`]}`}
                      >
                        <Image
                          className={`w-full max-w-full max-h-full`}
                          src={image}
                          alt={``}
                          width={0}
                          height={0}
                          quality={10}
                        >
                        </Image>

                        {!isModalReadOnly ? (
                          <div className={`absolute top-0 right-0`}>
                            <Button
                              className={`absolute top-0 right-0`}
                              onClick={() => handleDeleteImage(index)}
                            >
                              <IconContainer iconLink={trashIcon}>
                              </IconContainer>
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )) || []
                  }
                </div>
              </div>
            </InputSection>
          </TabItem>
        </Tabs>

        {notificationElements}
      </>
    </ManagerPage>
  );
}