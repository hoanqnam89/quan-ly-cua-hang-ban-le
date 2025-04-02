import { ReactElement } from "react";
import { nameToHyphenAndLowercase } from "./name-to-hyphen-and-lowercase";
import { ECollectionNames } from "@/enums";
import { IconContainer } from "@/components";
import { createMoreInfoTooltip } from "./create-tooltip";
import { externalLinkIcon } from "@/public";

export const createCollectionDetailLink = (
  collectionName: ECollectionNames, 
  id: string
): ReactElement => 
  <a 
    href={`/home/${nameToHyphenAndLowercase(collectionName)}/${id}`} 
    target={`_blank`}
  >
    <IconContainer 
      tooltip={createMoreInfoTooltip(collectionName)}
      iconLink={externalLinkIcon}
    >
    </IconContainer>
  </a>