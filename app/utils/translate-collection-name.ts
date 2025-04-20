import { ECollectionNames } from '../enums';

export const translateCollectionName = (collectionName: ECollectionNames | string): string => {
    switch (collectionName) {
        case ECollectionNames.PRODUCT:
            return 'Sản phẩm';
        case ECollectionNames.PRODUCT_DETAIL:
            return 'Chi tiết sản phẩm';
        case ECollectionNames.BUSINESS:
            return 'Đối tác';
        case ECollectionNames.UNIT:
            return 'Đơn vị tính';
        case ECollectionNames.ORDER_FORM:
            return 'Phiếu đặt hàng';
        case ECollectionNames.WAREHOUSE_RECEIPT:
            return 'Phiếu nhập kho';
        case ECollectionNames.CUSTOMER:
            return 'Khách hàng';
        case ECollectionNames.RECEIPT:
            return 'Hóa đơn';
        case ECollectionNames.CATEGORY:
            return 'Danh mục';
        default:
            return collectionName.toString();
    }
}; 