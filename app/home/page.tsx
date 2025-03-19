'use client';

import { ReactElement } from "react";
import { Text} from '@/components'
import { ECollectionNames } from "@/enums";

export default function Home(): ReactElement {
  return (
    <>
      <Text>Number of {ECollectionNames.ACCOUNT}: 2</Text>
    </>
  );
}
