import React, { ReactElement, ReactNode } from "react";
import styles from "./style.module.css";
import { EButtonType } from "../button/interfaces/button-type.interface";
import IconContainer from "../icon-container/icon-container";
import { xIcon } from "@/public";
import createContainer from "./utils/create-container";
import { createPortal } from "react-dom";

interface INotificationProps {
  type: EButtonType
  children: ReactNode
}

const container: HTMLElement = createContainer();

export default function Notification({
  type = EButtonType.TRANSPARENT, 
  children
}: Readonly<INotificationProps>): ReactElement {
  return createPortal(
    <div className={`${styles.notification} ${styles[type]}`}>
      {children}
      <button className={styles.closeButton}>
        <IconContainer iconLink={xIcon}>
        </IconContainer>
      </button>
    </div>, 
    container
  );
}
