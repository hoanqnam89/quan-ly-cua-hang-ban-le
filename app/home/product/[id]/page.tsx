'use client'

import { ECollectionNames } from '@/enums';
import { IPageParams } from '@/interfaces/page-params.interface'
import { getCollectionById } from '@/services/api-service';
import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import { LoadingScreen } from '@/components';
import { IProduct } from '@/interfaces/product.interface';
import { DEFAULT_PROCDUCT } from '@/constants/product.constant';
import Image from 'next/image';
import { IBusiness } from '@/interfaces/business.interface';
import { fetchGetCollections } from '@/utils/fetch-get-collections';
import { EBusinessType } from '@/enums/business-type.enum';
import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
import Link from 'next/link';
import styles from '../style.module.css';
import { useRouter } from 'next/navigation';
import { IProductDetail } from '@/interfaces/product-detail.interface';

type collectionType = IProduct;
const collectionName: ECollectionNames = ECollectionNames.PRODUCT;
const defaultCollection: collectionType = DEFAULT_PROCDUCT;

export default function Detail({ params }: Readonly<IPageParams>): ReactElement {
  const [collection, setCollection] = useState<collectionType>(defaultCollection);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = React.use(params);
  const [supplierOptions, setSupplierOptions] = useState<ISelectOption[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [productDetails, setProductDetails] = useState<IProductDetail[]>([]);
  const [inventorySummary, setInventorySummary] = useState({
    totalInventory: 0,
    onShelf: 0,
    remaining: 0,
    productionDate: null as Date | null,
    expiryDate: null as Date | null
  });

  // Safely create collection detail link
  const safeCreateCollectionDetailLink = (collectionName: ECollectionNames, id: string) => {
    if (!id) return null;

    const href = `/home/${collectionName}/${id}`;
    return (
      <Link href={href} className={styles.linkIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </Link>
    );
  };

  const getSuppliers = useCallback(async () => {
    try {
      const newBusinesses = await fetchGetCollections<IBusiness>(
        ECollectionNames.BUSINESS
      );

      if (!newBusinesses || !Array.isArray(newBusinesses)) {
        console.error('Invalid business data received');
        return;
      }

      const newSuppliers = newBusinesses.filter(
        (business) => business && business.type !== EBusinessType.SUPPLIER
      );

      const options = newSuppliers.map((supplier) => ({
        label: supplier.name || 'Unknown',
        value: supplier._id || '',
      }));

      setSupplierOptions(options);

      // Find supplier name if we already have collection data
      if (collection.supplier_id) {
        const supplier = newSuppliers.find(s => s._id === collection.supplier_id);
        if (supplier) {
          setSupplierName(supplier.name || '');
        }
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Không thể tải danh sách nhà sản xuất');
    }
  }, [collection.supplier_id]);

  const getProductDetails = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await getCollectionById(id, collectionName);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const productData = await response.json();

      if (!productData) {
        throw new Error('No product data received');
      }

      setCollection(productData);

      // Set the first image as the selected image if available
      if (productData.image_links && Array.isArray(productData.image_links) && productData.image_links.length > 0) {
        setSelectedImage(productData.image_links[0]);
      }

      // Update supplier name if we have supplier options
      if (productData.supplier_id && supplierOptions.length > 0) {
        const supplier = supplierOptions.find(o => o.value === productData.supplier_id);
        if (supplier) {
          setSupplierName(supplier.label);
        }
      }

      // Fetch product details for inventory information
      try {
        const detailsResponse = await fetch(`/api/product-detail/by-product/${id}`);
        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          if (Array.isArray(details) && details.length > 0) {
            setProductDetails(details);

            // Sort by creation date (most recent first)
            const sortedDetails = [...details].sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            // Get most recent batch for dates
            const latestBatch = sortedDetails[0];

            // Calculate inventory data from all product details
            let totalInput = 0;
            let totalOutput = 0;
            let totalInventory = 0;

            // Sum up inventory data from all product details
            details.forEach((detail, index) => {
              console.log(`Detail #${index + 1}:`, {
                id: detail._id,
                input_quantity: detail.input_quantity,
                output_quantity: detail.output_quantity,
                inventory: detail.inventory || (detail.input_quantity - detail.output_quantity)
              });

              // input_quantity là tổng kho
              totalInput += Number(detail.input_quantity) || 0;

              // output_quantity là số lượng đã bán
              totalOutput += Number(detail.output_quantity) || 0;

              // inventory là số lượng tồn kho
              const detailInventory = detail.inventory || (detail.input_quantity - detail.output_quantity);
              totalInventory += Number(detailInventory) || 0;
            });

            console.log("Inventory data:", {
              totalInput,
              totalOutput,
              totalInventory
            });

            // Set inventory summary with calculated values
            setInventorySummary({
              // Tổng kho
              totalInventory: totalInput,

              // Số lượng đã bán
              onShelf: totalOutput,

              // Số lượng tồn kho
              remaining: totalInventory,

              productionDate: latestBatch.date_of_manufacture ? new Date(latestBatch.date_of_manufacture) : null,
              expiryDate: latestBatch.expiry_date ? new Date(latestBatch.expiry_date) : null
            });
          }
        }
      } catch (detailsError) {
        console.error('Error fetching product details:', detailsError);
        // Don't interrupt main flow, just log the error
      }

    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Không thể tải thông tin sản phẩm');
    } finally {
      setIsLoading(false);
    }
  }, [id, supplierOptions]);

  useEffect(() => {
    getSuppliers();
  }, [getSuppliers]);

  useEffect(() => {
    getProductDetails();
  }, [getProductDetails]);

  const handleGoBack = () => {
    router.push('/home/product');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <h2>Đã xảy ra lỗi</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <button onClick={handleGoBack} className={styles.backButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            <span>Quay lại</span>
          </button>
          <div>
            <h1 className={styles.title}>Chi tiết sản phẩm</h1>
            <p className={styles.productId}>{id}</p>
          </div>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.productGrid}>
          {/* Product Image Section */}
          <div className={styles.imageSection}>
            {collection.image_links && Array.isArray(collection.image_links) && collection.image_links.length > 0 ? (
              <>
                <div className={styles.mainImageContainer}>
                  <Image
                    src={selectedImage || collection.image_links[0]}
                    alt={collection.name || 'Product image'}
                    fill
                    className={styles.mainImage}
                    priority
                    quality={90}
                  />
                </div>

                {collection.image_links.length > 1 && (
                  <div className={styles.thumbnailContainer}>
                    {collection.image_links.map((image, index) => (
                      <div
                        key={index}
                        className={`${styles.thumbnail} ${selectedImage === image ? styles.activeThumbnail : ''}`}
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image
                          src={image}
                          alt={`${collection.name || 'Product'} - ${index + 1}`}
                          fill
                          className={styles.thumbnailImage}
                          quality={70}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noImageContainer}>
                <span>Không có hình ảnh</span>
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className={styles.detailsSection}>
            <div className={styles.productBasicInfo}>
              <h2 className={styles.productName}>{collection.name || 'Không có tên'}</h2>
              <p className={styles.productDescription}>{collection.description || 'Không có mô tả'}</p>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nhà sản xuất</span>
                <span className={styles.detailValue}>
                  {collection.supplier_id && safeCreateCollectionDetailLink(
                    ECollectionNames.BUSINESS,
                    collection.supplier_id
                  )}
                  {supplierName || 'Không xác định'}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Giá nhập</span>
                <span className={`${styles.detailValue} ${styles.priceInput}`}>
                  {(collection.input_price || 0).toLocaleString()} VNĐ
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Giá bán</span>
                <span className={`${styles.detailValue} ${styles.priceOutput}`}>
                  {(collection.output_price || 0).toLocaleString()} VNĐ
                </span>
              </div>

              {/* Inventory Information */}
              <div className={styles.inventorySection}>
                <h3 className={styles.sectionTitle}>Thông tin kho hàng</h3>

                {inventorySummary.expiryDate && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Hạn sử dụng</span>
                    <span className={styles.detailValue}>
                      {inventorySummary.expiryDate.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Tổng kho</span>
                  <span className={styles.detailValue}>
                    {inventorySummary.totalInventory.toLocaleString()} sản phẩm
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Số lượng đã bán</span>
                  <span className={`${styles.detailValue} ${styles.quantityOnShelf}`}>
                    {inventorySummary.onShelf.toLocaleString()} sản phẩm
                    <span className={styles.inventoryLabel}>(output_quantity)</span>
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Số lượng tồn kho</span>
                  <span className={`${styles.detailValue} ${styles.quantityRemaining}`}>
                    {inventorySummary.remaining.toLocaleString()} sản phẩm
                    <span className={styles.inventoryLabel}>(inventory)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.timestampSection}>
              <div className={styles.timestampItem}>
                <span className={styles.timestampLabel}>Ngày tạo</span>
                <span className={styles.timestampValue}>
                  {collection.created_at ?
                    new Date(collection.created_at).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'N/A'}
                </span>
              </div>

              <div className={styles.timestampItem}>
                <span className={styles.timestampLabel}>Ngày cập nhật</span>
                <span className={styles.timestampValue}>
                  {collection.updated_at ?
                    new Date(collection.updated_at).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
