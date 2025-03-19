import { ISupplier } from "@/interfaces/supplier.interface";
import { createId } from "@/utils/create-id";

export const DEFAULT_SUPPLIER: ISupplier = {
  _id: createId(`Account`),
  created_at: new Date(),
  updated_at: new Date(),

  name: `TEST Supplier`, 
}
