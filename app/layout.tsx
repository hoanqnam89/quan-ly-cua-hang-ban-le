'use client';

import { Context, createContext, ReactElement, useMemo } from "react";
import "@/styles/globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { IRootLayout } from "@/app/interfaces/root-layout.interface";

const context: Context<{name: string}> = createContext({name: `default`});

export default function RootLayout({ 
  children 
}: Readonly<IRootLayout>): ReactElement {
  const contextValue: {name: string} = useMemo(() => ({name: `Lmao`}), []);

  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <context.Provider value={contextValue}>
            {children}
          </context.Provider>
        </AntdRegistry>
      </body>
    </html>
  );
}
