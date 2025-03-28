'use client';

import { Button, IconContainer, NumberInput, SelectDropdown, Text, TextInput } from '@/components'
import ManagerPage, { ICollectionIdNotify } from '@/components/manager-page/manager-page'
import { IColumnProps } from '@/components/table/interfaces/column-props.interface'
import { ECollectionNames } from '@/enums'
import React, { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import InputSection from '../components/input-section/input-section';
import { infoIcon, trashIcon } from '@/public';
import { createDeleteTooltip, createMoreInfoTooltip } from '@/utils/create-tooltip';
import TabItem from '@/components/tabs/components/tab-item/tab-item';
import Tabs from '@/components/tabs/tabs';
import TimestampTabItem from '@/components/timestamp-tab-item/timestamp-tab-item';
import { IProduct } from '@/interfaces/product.interface';
import { DEFAULT_PROCDUCT } from '@/constants/product.constant';
import Image from 'next/image';
import styles from './style.module.css';
import { MAX_PRICE } from '@/constants/max-price.constant';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { getSelectedOptionIndex } from '@/components/select-dropdown/utils/get-selected-option-index';
import { IBusiness } from '@/interfaces/business.interface';
import { EBusinessType } from '@/enums/business-type.enum';
import { VND_UNIT } from '@/constants/vnd-unit.constant';
import { translateCollectionName } from '@/utils/translate-collection-name';
import { formatCurrency } from '@/utils/format-currency';

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;

export default function Product() {
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
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [product.supplier_id],
  );
  
  useEffect((): void => {
    getSuppliers();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
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

          if ( images.length === imageFiles.length && !isCancel ) {
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
      key: `_id`,
      ref: useRef(null), 
      title: `Mã`,
      size: `6fr`,
    },
    {
      key: `supplier_id`,
      ref: useRef(null), 
      title: `Nhà sản xuất`,
      size: `6fr`, 
    },
    {
      key: `name`,
      ref: useRef(null), 
      title: `Tên sản phẩm`,
      size: `4fr`, 
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
      key: `image_links`,
      ref: useRef(null), 
      title: `Hình ảnh`,
      size: `3fr`, 
      render: (collection: collectionType): ReactElement => 
        <div className={`flex flex-wrap gap-2`}>
          {
            collection.image_links.map((image: string, index: number) => 
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
              </div>
            )
          }
        </div>
    }, 
    {
      key: `created_at`,
      ref: useRef(null), 
      title: `Ngày tạo`,
      size: `4fr`, 
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
            isClicked: !isClickShowMore.isClicked, 
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

  const handleChangeProduct = (e: ChangeEvent<HTMLInputElement>): void => {
    setProduct({
      ...product, 
      [e.target.name]: e.target.value, 
    });
  }
  
  const handleChangeSupplierId = (e: ChangeEvent<HTMLSelectElement>): void => {
    setProduct({
      ...product, 
      supplier_id: e.target.value, 
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
    >
      <Tabs>
        <TabItem label={`${translateCollectionName(collectionName)}`}>
          <InputSection label={`Cho nhà sản xuất`}>
            <SelectDropdown
              name={`supplier_id`}
              isLoading={isLoading}
              isDisable={isModalReadOnly}
              options={supplierOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                supplierOptions, product.supplier_id
              )}
              onInputChange={handleChangeSupplierId}
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

          <InputSection label={`Giá nhập (VNĐ)`} gridColumns={gridColumns}>
            <NumberInput
              name={`input_price`}
              isDisable={isModalReadOnly}
              value={product.input_price + ``}
              onInputChange={handleChangeProduct}
              max={MAX_PRICE}
              step={VND_UNIT}
            >
            </NumberInput>
          </InputSection>

          <InputSection label={`Giá bán (VNĐ)`} gridColumns={gridColumns}>
            <NumberInput
              name={`output_price`}
              isDisable={isModalReadOnly}
              value={product.output_price + ``}
              onInputChange={handleChangeProduct}
              max={MAX_PRICE}
              step={VND_UNIT}
            >
            </NumberInput>
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

        <TabItem label={`Thời gian`} isDisable={!isModalReadOnly}>
          <TimestampTabItem<collectionType> collection={product}>
          </TimestampTabItem>
        </TabItem>

      </Tabs>
    </ManagerPage>
  );
}
