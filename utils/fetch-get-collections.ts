import { ECollectionNames } from "@/enums";
import { getCollections } from "@/services/api-service";
import { ROOT } from "@/constants/root.constant";
import { Dispatch, SetStateAction } from "react";

/**
 * Lấy danh sách các collection từ API
 * @param collectionName Tên collection cần lấy dữ liệu
 * @param setCollections State setter để cập nhật dữ liệu (tùy chọn)
 * @returns Danh sách các collection
 */
export const fetchGetCollections = async <T>(
  collectionName: ECollectionNames,
  setCollections?: Dispatch<SetStateAction<T[]>>
): Promise<T[]> => {
  try {
    let response: Response;

    // Ưu tiên sử dụng API service nếu có
    if (typeof getCollections === 'function') {
      response = await getCollections(collectionName);
    } else {
      // Fallback sử dụng fetch trực tiếp
      response = await fetch(`${ROOT}/${collectionName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      throw new Error(`Error fetching ${collectionName}: ${response.statusText}`);
    }

    const data: T[] = await response.json();

    // Nếu có setCollections thì cập nhật state
    if (setCollections) {
      setCollections(data);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};
