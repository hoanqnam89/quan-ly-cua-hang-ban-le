import { ECollectionNames } from "@/enums";

/**
 * Dịch tên collection sang ngôn ngữ cần thiết
 * @param collectionName Tên collection cần dịch
 * @param lang Ngôn ngữ muốn dịch sang (mặc định: vn)
 * @returns Tên collection đã được dịch
 */
export const translateCollectionName = (
  collectionName: ECollectionNames | string,
  lang: string = 'vn'
): string => {
  switch (lang) {
    case 'vn':
      switch (collectionName) {
        case ECollectionNames.ACCOUNT:
          return 'Tài khoản';
        case ECollectionNames.ORDER_FORM:
          return 'Phiếu đặt hàng';
        case ECollectionNames.SUPPLIER_RECEIPT:
          return 'Phiếu nhập kho của nhà cung cấp';
        case ECollectionNames.PRODUCT:
          return 'Sản phẩm';
        case ECollectionNames.PRODUCT_DETAIL:
          return 'Chi tiết sản phẩm';
        case ECollectionNames.BUSINESS:
          return 'Đối tác';
        case ECollectionNames.UNIT:
          return 'Đơn vị tính';
        case ECollectionNames.USER:
          return 'Nhân viên';
        case ECollectionNames.WAREHOUSE_RECEIPT:
          return 'Phiếu nhập kho';
        case ECollectionNames.MARKET_RECEIPT:
          return 'Phiếu xuất kho';
        case ECollectionNames.CUSTOMER:
          return 'Khách hàng';
        case ECollectionNames.RECEIPT:
          return 'Hóa đơn';
        case ECollectionNames.CATEGORY:
          return 'Danh mục';
        default:
          return typeof collectionName === 'string' ? collectionName : '';
      }
    case 'en':
      switch (collectionName) {
        case ECollectionNames.ACCOUNT:
          return 'Account';
        case ECollectionNames.ORDER_FORM:
          return 'Order Form';
        case ECollectionNames.PRODUCT:
          return 'Product';
        case ECollectionNames.PRODUCT_DETAIL:
          return 'Product Detail';
        case ECollectionNames.BUSINESS:
          return 'Business';
        case ECollectionNames.UNIT:
          return 'Unit';
        case ECollectionNames.WAREHOUSE_RECEIPT:
          return 'Warehouse Receipt';
        default:
          return typeof collectionName === 'string' ? collectionName : '';
      }
    default:
      return typeof collectionName === 'string' ? collectionName : '';
  }
};
