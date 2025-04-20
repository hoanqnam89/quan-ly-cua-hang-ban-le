import { translateCollectionName } from './translate-collection-name';

export const createMoreInfoTooltip = (collectionName: string): string => {
    return `Xem thông tin chi tiết ${translateCollectionName(collectionName).toLowerCase()}`;
};

export const createDeleteTooltip = (collectionName: string): string => {
    return `Xóa ${translateCollectionName(collectionName).toLowerCase()}`;
}; 