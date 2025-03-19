import React, { ChangeEvent, CSSProperties, Dispatch, ReactElement, SetStateAction } from 'react'
import { LoadingIcon, Text } from '@/components';
import styles from './style.module.css';

export interface ICheckbox {
  label: string
  value: string 
  isChecked: boolean
}

interface ICheckboxesProps {
  isDisable?: boolean
  isLoading?: boolean
  title?: string
  options?: ICheckbox[] 
  setOptions: Dispatch<SetStateAction<ICheckbox[]>>
  shouldSetOptions?: boolean
  onInputChange?: (
    e: ChangeEvent<HTMLInputElement>, option: ICheckbox, index: number, 
  ) => void 
}

export default function Checkboxes({
  isDisable = false, 
  isLoading = false, 
  title = ``, 
  options = [], 
  setOptions, 
  shouldSetOptions = true, 
  onInputChange = () => {}, 
}: Readonly<ICheckboxesProps>): ReactElement {
  return (
    <div className={`flex gap-2 items-center`}>
      {title !== `` && <Text>{title}</Text>}

      <div className={`flex gap-2 flex-wrap`}>
        {isLoading && <LoadingIcon></LoadingIcon>}

        {!isLoading && options.map((
          option: ICheckbox, optionIndex: number
        ): ReactElement => 
          <div key={optionIndex} className={`py-2`}>
            <label 
              htmlFor={`${option.value}`}
              className={`checkbox select-none p-2 rounded-lg whitespace-nowrap overflow-hidden text-ellipsis ${option.isChecked ? styles.checked : styles.unchecked}`}
            >
              {option.label}
            </label>
            <input 
              className={`hidden`}
              disabled={isDisable}
              id={`${option.value}`} 
              name={`${option.value}`} 
              type={`checkbox`} 
              value={option.value}
              checked={option.isChecked}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                if ( shouldSetOptions )
                  setOptions([...options.map(
                    (option: ICheckbox, index: number): ICheckbox => ({
                      ...option, 
                      isChecked: index === optionIndex 
                        ? !option.isChecked 
                        : option.isChecked
                    }))
                  ]);

                onInputChange(e, option, optionIndex);
              }}
            >
            </input>
          </div>
        )}
      </div>
    </div>
  )
}
