import { ECollectionNames } from "@/enums";

export const translateCollectionName = (
  collectionName: ECollectionNames, 
  lang: string = `vn`
): string => {
  switch (lang) {
    case `vn`:
      switch (collectionName) {
        case ECollectionNames.ACCOUNT:
          return `Tài khoản`;
        case ECollectionNames.ORDER_FORM:
          return `Phiếu đặt hàng`;
        case ECollectionNames.PRODUCT:
          return `Sản phẩm`;
        case ECollectionNames.PRODUCT_DETAIL:
          return `Chi tiết sản phẩm`;
        case ECollectionNames.BUSINESS:
          return `Doanh nghiệp`;
        case ECollectionNames.USER:
          return `Nhân viên`;
        case ECollectionNames.WAREHOUSE_RECEIPT:
          return `Phiếu nhập kho`;
        default:
          return ``;
      }
    default:
      return ``;
  }
}
