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
        case ECollectionNames.PRODUCT:
          return `Sản phẩm`;
        case ECollectionNames.SUPPLIER:
          return `Nhà cung cấp`;
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
