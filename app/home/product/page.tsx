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
import { nameToHyphenAndLowercase } from '@/utils/name-to-hyphen-and-lowercase';
import { createCollectionDetailLink } from '@/utils/create-collection-detail-link';
import useNotificationsHook from '@/hooks/notifications-hook';
import { ENotificationType } from '@/components/notify/notification/notification';
import { ICategory } from '@/interfaces/category.interface';

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
    [],
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
    [],
  );

  loadBusinessNames();
}, []);

useEffect((): void => {
  getCategory();
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
      console.log(foundCategories, categories);
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
    key: `image_links`,
    ref: useRef(null),
    title: `Hình ảnh`,
    size: `3fr`,
    render: (collection: collectionType): ReactElement =>
      <div className={`flex flex-wrap gap-2`}>
        {
          collection.image_links.map((image: string, index: number) =>
            image ? ( // Kiểm tra xem image có phải là chuỗi rỗng không
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
                />
              </div>
            ) : null // Nếu image là chuỗi rỗng, trả về null
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
      const date: string = new Date(collection.created_at).toDateString();
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
    title: `Chỉnh sửa `,
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
  // {
  //   title: `Xem chi tiết`,
  //   ref: useRef(null),
  //   size: `2fr`,
  //   render: (collection: collectionType): ReactElement =>
  //     createCollectionDetailLink(
  //       collectionName,
  //       collection._id
  //     )
  // },
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

const handleChangeBusinessId = (e: ChangeEvent<HTMLSelectElement>): void => {
  const selectedBusinessId = e.target.value;
  // Tìm business tương ứng từ ID
  const selectedBusiness = businessesData.find(business => business._id === selectedBusinessId);
  setProduct({
    ...product,
    _id: selectedBusinessId,
  });
}
const handleChangeCategoryId = (e: ChangeEvent<HTMLSelectElement>): void => {
  setProduct({
    ...product,
    category_id: e.target.value,
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

// Trong hàm xử lý submit form
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!product.supplier_name) {
    createNotification({
      id: Date.now(),
      children: <Text>Vui lòng chọn nhà cung cấp!</Text>,
      type: ENotificationType.ERROR,
      isAutoClose: true,
    });
    return;
  }

  // Gửi dữ liệu lên server
  // ...
};

function handleChangeProduct(e: ChangeEvent<HTMLInputElement>): void {
  const { name, value } = e.target;
  setProduct((prevProduct) => ({
    ...prevProduct,
    [name]: name === 'input_price' || name === 'output_price' ? parseFloat(value) || 0 : value,
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
  >
    <>
      <Tabs>
        <TabItem label={`${translateCollectionName(collectionName)}`}>
          <InputSection label={`Nhà cung cấp`}>
            <SelectDropdown
              name={`business_id`}
              isLoading={isLoading}
              isDisable={isModalReadOnly}
              options={businessOptions}
              defaultOptionIndex={getSelectedOptionIndex(
                businessOptions, product.business_id
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

          <InputSection label={`Code`} gridColumns={gridColumns}>
            <TextInput
              name={`code`}
              isDisable={isModalReadOnly}
              value={product.code}
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

          <InputSection label={`Mã sản phẩm`} gridColumns={gridColumns}>
            <TextInput
              name={`code`}
              isDisable={isModalReadOnly}
              value={product.code}
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
      </Tabs>

      {notificationElements}
    </>
  </ManagerPage>
);
}

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  print(`${collectionName} API - GET ${collectionName}s`, ETerminal.FgGreen);

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '1000');
    const fields = url.searchParams.get('fields');

    let projection = {};
    if (fields) {
      projection = fields.split(',').reduce((acc, field) => ({
        ...acc,
        [field.trim()]: 1
      }), {});
    } else {
      projection = {
        _id: 1,
        code: 1,
        name: 1,
        description: 1,
        image_links: 1,
        input_price: 1,
        output_price: 1,
        business_id: 1,
        supplier_name: 1,
        created_at: 1,
        updated_at: 1
      };
    }

    // Sử dụng fetch API của Next.js với revalidate
    const products = await fetch(`${ROOT}/api/products?limit=${limit}&fields=${fields}`, {
      next: { revalidate: 60 }, // Revalidate cache mỗi 60 giây
    }).then(res => res.json());

    return NextResponse.json(products, {
      status: EStatusCode.OK,
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache 60 giây ở client
        'X-Cached-Response': 'true' // Hoặc 'false' tùy thuộc vào việc dữ liệu có từ cache hay không
      }
    });
  } catch (error: unknown) {
    console.error(error);

    return NextResponse.json(
      createErrorMessage(
        `Failed to get ${collectionName}s.`,
        error as string,
        req.url,
        `Please contact for more information.`,
      ),
      { status: EStatusCode.INTERNAL_SERVER_ERROR }
    );
  }
};
