import { ECollectionNames } from '../enums';
import { ROOT } from '@/constants/root.constant';

export const fetchGetCollections = async <T>(collectionName: ECollectionNames): Promise<T[]> => {
    try {
        const response = await fetch(`${ROOT}/api/${collectionName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching ${collectionName}: ${response.statusText}`);
        }

        const data: T[] = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        return [];
    }
}; 