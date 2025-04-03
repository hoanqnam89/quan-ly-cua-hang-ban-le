import { ChangeEvent, ReactElement } from "react";
import { ISelectOption } from "./interfaces/select-option.interface";
import LoadingIcon from "../loading-icon/loading-icon";
import styles from './style.module.css';

interface ISelectDropdownProps {
  name?: string
  isLoading?: boolean
  isDisable?: boolean
  options?: ISelectOption[] 
  defaultOptionIndex?: number
  isSelectMultiple?: boolean
  onInputChange?: (e: ChangeEvent<HTMLSelectElement>) => void
}

export default function SelectDropdown({ 
  name = ``, 
  isLoading = false, 
  isDisable = false, 
  options = [], 
  defaultOptionIndex = 0, 
  isSelectMultiple = false, 
  onInputChange = () => {}, 
}: Readonly<ISelectDropdownProps>): ReactElement {
  return (
    isLoading ? 
      <LoadingIcon></LoadingIcon> :
      <select 
        name={name}
        disabled={isDisable}
        className={`p-2 outline outline-1 ${styles.select}`} 
        onChange={onInputChange}
        value={options.length > 0 ? options[defaultOptionIndex].value : `No Value`}
        multiple={isSelectMultiple}
      >
        {options.map((option: ISelectOption, index: number): ReactElement => 
          <option key={index} value={option.value}>
            {option.label}
          </option>
        )}
      </select>
  )
}
