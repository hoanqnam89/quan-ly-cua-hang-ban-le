import React, { ChangeEvent, CSSProperties, memo, ReactElement, Ref, useRef } from 'react';
import { IRationalNumber } from '@/interfaces/rational-number.interface';
import Text from '../text/text';

interface INumberInputProps {
  numeratorName?: string
  denominatorName?: string
  borderWidth?: number
  borderColor?: string
  borderRadius?: number
  padding?: number
  value: IRationalNumber
  placeholder?: string
  text?: string
  onInputChange?: (
    numeratorInputElement: HTMLInputElement | null, 
    denominatorInputElement: HTMLInputElement | null, 
  ) => void
  onInputBlur?: (e: ChangeEvent<HTMLInputElement>) => void
}

function NumberInput({
  numeratorName = ``, 
  denominatorName = ``, 
  borderWidth = 0,
  borderColor = `#ffffff`,
  borderRadius = 4,
  padding = 4,
  value,
  placeholder = ``,
  text = `π\u00A0/`, 
  onInputChange = () => {},
  onInputBlur = () => {},
}: Readonly<INumberInputProps>): ReactElement {
  const inputStyle: CSSProperties = {
    borderStyle: `solid`,
    borderWidth: borderWidth,
    borderColor: borderColor,
    borderRadius: borderRadius,
    padding: padding,
    // fieldSizing: `content`,
  }
  const numeratorRef: Ref<HTMLInputElement | null> = useRef(null);
  const denominatorRef: Ref<HTMLInputElement | null> = useRef(null);

  const handleChange = (): void => {
    const numeratorInputElement: HTMLInputElement | null = 
      numeratorRef.current;
    const denominatorInputElement: HTMLInputElement | null = 
      denominatorRef.current;

    onInputChange(numeratorInputElement, denominatorInputElement);
  }

  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => 
    onInputBlur(e);

  return (
    <div className={`flex gap-2 items-center`}>
      <input
        name={numeratorName}
        ref={numeratorRef}
        style={inputStyle}
        type={`number`}
        value={value.numerator}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full`}
      >
      </input>
      <Text>{text}</Text>
      <input
        name={denominatorName}
        ref={denominatorRef}
        style={inputStyle}
        type={`number`}
        min={0}
        value={value.denominator}
        placeholder={placeholder}
        onChange={() => handleChange()}
        onBlur={handleBlur}
        className={`w-full`}
      >
      </input>
    </div>
  )
}

export default memo( NumberInput );
