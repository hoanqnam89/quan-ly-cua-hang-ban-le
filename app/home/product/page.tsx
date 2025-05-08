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
import { EBusinessType } from '@/enums/business-type.enum';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { formatCurrency } from '@/utils/format-currency';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ICategory } from '@/interfaces/category.interface';
import { IProduct } from '@/interfaces/product.interface';
import { DEFAULT_PROCDUCT } from '@/constants/product.constant';
import { createCollectionDetailLink } from '@/utils/create-collection-detail-link';
import { IUnit } from '@/interfaces/unit.interface';

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

  const getSuppliers: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newBusinesses: IBusiness[] = await fetchGetCollections<IBusiness>(
        ECollectionNames.BUSINESS,
      );
      const newSuppliers: IBusiness[] = newBusinesses.filter((
        business: IBusiness
      ): boolean =>
        business.type !== EBusinessType.SUPPLIER
      );
      setSupplier([...newSuppliers])

      if (newSuppliers.length > 0) {
        setProduct({
          ...product,
          supplier_id: newSuppliers[0]._id,
        });
      }
      setSupplierOptions([
        ...newSuppliers.map((supplier: IBusiness): ISelectOption => ({
          label: `${supplier.name}`,
          value: supplier._id,
        }))
      ]);
      setIsLoading(false);
    },
    [product],
  );
  const getCategory: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newCategories: ICategory[] = await fetchGetCollections<ICategory>(
        ECollectionNames.CATEGORY,
      );
      setCategories([...newCategories])

      if (newCategories.length > 0) {
        setProduct({
          ...product,
          category_id: newCategories[0]._id,
        });
      }
      setCategoryOptions([
        ...newCategories.map((category: ICategory): ISelectOption => ({
          label: `${category.name}`,
          value: category._id,
        }))
      ]);
      setIsLoading(false);
    },
    [product],
  );

  const getUnits: () => Promise<void> = useCallback(
    async (): Promise<void> => {
      const newUnits: IUnit[] = await fetchGetCollections<IUnit>(
        ECollectionNames.UNIT,
      );
      setUnits([...newUnits]);
      setIsLoading(false);
    },
    [],
  );

  useEffect((): void => {
    getSuppliers();
  }, []);
  useEffect((): void => {
    getCategory();
  }, []);
  useEffect((): void => {
    getUnits();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const newBusinesses: IBusiness[] = await fetchGetCollections<IBusiness>(
          ECollectionNames.BUSINESS,
        );
        const newSuppliers: IBusiness[] = newBusinesses.filter((
          business: IBusiness
        ): boolean =>
          business.type !== EBusinessType.SUPPLIER
        );
        const newCategories: ICategory[] = await fetchGetCollections<ICategory>(
          ECollectionNames.CATEGORY,
        );
        console.log('Đang fetch dữ liệu sản phẩm...');
        const fetchedProducts = await fetchGetCollections<IProduct>(ECollectionNames.PRODUCT);
        console.log('Dữ liệu sản phẩm:', fetchedProducts);
        setProducts(fetchedProducts);
        console.log('acbc', fetchedProducts)
        const newProducts = fetchedProducts.map((product) => {
          const newProduct = { ...product };
          const foundCategory = newCategories.find((category) => category._id === product.category_id)
          newProduct.category = foundCategory?.name

          const foundSupplier = newSuppliers.find((supplier2) => supplier2._id === product.supplier_id)
          newProduct.supplier = foundSupplier?.name
          return newProduct;
        })
        console.log('abc2', newProducts)
        setProducts(newProducts)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
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
            collection.image_links.map((image: string, index: number) =>
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
            )
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
    // {
    //   key: `updated_at`,
    //   ref: useRef(null),
    //   title: `Ngày cập nhật`,
    //   size: `4fr`,
    //   render: (collection: collectionType): ReactElement => {
    //     const date: string = new Date(collection.updated_at).toLocaleString();
    //     return <Text isEllipsis={true} tooltip={date}>{date}</Text>
    //   }
    // },
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
                setIsClickDelete({
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
    const newImages: string[] = product.image_links.filter(
      (_image: string, imageIndex: number) => imageIndex !== index
    );
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
    // if (businessOptions.length === 0) {
    //   createNotification({
    //     id: 0,
    //     children: <Text>Thêm nhà cung cấp vào trước khi thêm sản phẩm!</Text>,
    //     type: ENotificationType.ERROR,
    //     isAutoClose: true, 
    //   });
    //   return prev;
    // }

    return !prev;
  }

  function handleChangeProduct(e: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value,
    }));
  }


  return (
    <ManagerPage<collectionType>
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

            {/* <InputSection label={`Code`} gridColumns={gridColumns}>
            <TextInput
              name={`code`}
              isDisable={isModalReadOnly}
              value={product.code}
              onInputChange={handleChangeProduct}
            >
            </TextInput>
          </InputSection> */}

            <InputSection label={`Mô tả`} gridColumns={gridColumns}>
              <TextInput
                name={`description`}
                isDisable={isModalReadOnly}
                value={product.description}
                onInputChange={handleChangeProduct}
              >
              </TextInput>
            </InputSection>

            {/* <InputSection label={`Mã sản phẩm`} gridColumns={gridColumns}>
            <TextInput
              name={`code`}
              isDisable={isModalReadOnly}
              value={product.code}
              onInputChange={handleChangeProduct}
            >
            </TextInput>
          </InputSection> */}

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
                    product.image_links.map((image: string, index: number) =>
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

                        {!isModalReadOnly ? <div className={`absolute top-0 right-0`}>
                          <Button
                            className={`absolute top-0 right-0`}
                            onClick={() => handleDeleteImage(index)}
                          >
                            <IconContainer iconLink={trashIcon}>
                            </IconContainer>
                          </Button>
                        </div> : null}
                      </div>
                    )
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

// function loadBusinessNames() {
//   throw new Error('Function not implemented.');
// }

// function getCategory() {
//   throw new Error('Function not implemented.');
// }

// function setImageFiles(arg0: File[]) {
//   throw new Error('Function not implemented.');
// }

