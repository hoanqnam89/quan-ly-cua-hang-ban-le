// 'use client'

// import { CColor } from '@/classes/Color.class';
// import { Button, ColorInput, IconContainer, NumberInput, SelectDropdown, Text } from '@/components';
// import Checkbox from '@/components/checkbox/checkbox';
// import RationalNumberInput from '@/components/rational-number-input/rational-number-input';
// import { ISelectOption } from '@/components/select-dropdown/interfaces/select-option.interface';
// import { TRANSPARENT_BUTTON } from '@/constants';
// import { MAX_HEX_COLOR_TO_DECIMAL } from '@/constants/max-hex-color-to-decimal.constants';
// import { IRationalNumber } from '@/interfaces/rational-number.interface';
// import { chevronLeftIcon, chevronRightIcon } from '@/public';
// import React, { ChangeEvent, CSSProperties, RefObject, useEffect, useMemo, useRef, useState } from 'react'
// import { createPlaneFrom3Points } from './utils/create-plane-from-3-points';
// import { CPosition } from '@/classes/Position.class';
// import { CPlane } from '@/classes/Plane.class';
// import { CControl } from '@/classes/Control.class';
// import { QUARTER_OF_CIRCLE } from '@/constants/quarter-of-circle.constant';
// import { ROTATE_QUARTER_OF_CIRCLE_REVERSE_SYMBOL } from '@/constants/rotate-quarter-of-circle-reverse-symbol.constant';
// import { HALF_OF_CIRCLE } from '@/constants/half-of-circle.constant';
// import { eulerToQuat } from './utils/euler-to-quat';
// import { invertQuat } from './utils/invert-quat';
// import { multiplyQuat } from './utils/multiply-quat';
// import { rounding } from './utils/rounding';
// import { identity, invert, multiply, transformMat3 } from './utils/matrix-functions';
// import { lookAt } from './utils/look-at';
// import { perspective } from './utils/perspective';
// import { rotate } from './utils/rotate';
// import { resetCanvasDimension } from './utils/reset-canvas-dimension';
// import { DEFAULT_BOX_INDEXES, DEFAULT_BOX_VERTEXES } from '@/constants/box-geometry.constant';
// import { CVertex } from '@/classes/Vertex.class';
// import { hexaToRgba } from './utils/hex-to-rgba';

// const ALPHA: number = 0.75;

// export default function RubikSimulator() {
//   const [gl, setGl] = useState<
//     WebGL2RenderingContext | WebGLRenderingContext | null
//   >(null);
//   const [program, setProgram] = useState<WebGLProgram | null>(null);
//   const [isControlExpand, setIsControlExpand] = useState<boolean>(true);
//   const [rubikSizeX, setRubikSizeX] = useState<number>(3);
//   const [rubikSizeY, setRubikSizeY] = useState<number>(3);
//   const [rubikSizeZ, setRubikSizeZ] = useState<number>(3);
//   const [rubikLength, setRubikLength] = useState<number>(0.999);
//   const rubikHalfLength = rubikLength / 2;
//   const [stickerGap, setStickerGap] = useState<number>(0.001);
//   const [stickerSize, setStickerSize] = useState<number>(0.95);
//   const [translateX, setTranslateX] = useState<number>(0);
//   const [translateY, setTranslateY] = useState<number>(0);
//   const [translateZ, setTranslateZ] = useState<number>(0);
//   const [axisXRotation, setAxisXRotation] = useState<IRationalNumber>({
//     numerator: 0, 
//     denominator: 1, 
//   });
//   const [axisYRotation, setAxisYRotation] = useState<IRationalNumber>({
//     numerator: 0, 
//     denominator: 1, 
//   });
//   const [axisZRotation, setAxisZRotation] = useState<IRationalNumber>({
//     numerator: 0, 
//     denominator: 1, 
//   });
//   const [rubikOrientationX, setRubikOrientationX] = useState<IRationalNumber>({
//     numerator: 0, 
//     denominator: 1, 
//   });
//   const [rubikOrientationY, setRubikOrientationY] = useState<IRationalNumber>({
//     numerator: 0, 
//     denominator: 1, 
//   });
//   const [rubikOrientationZ, setRubikOrientationZ] = useState<IRationalNumber>({
//     numerator: 0, 
//     denominator: 1, 
//   });
//   const [cameraPositionX, setCameraPositionX] = useState<number>(9);
//   const [cameraPositionY, setCameraPositionY] = useState<number>(6);
//   const [cameraPositionZ, setCameraPositionZ] = useState<number>(-12);
//   const [cameraLookAtX, setCameraLookAtX] = useState<number>(0);
//   const [cameraLookAtY, setCameraLookAtY] = useState<number>(0);
//   const [cameraLookAtZ, setCameraLookAtZ] = useState<number>(0);
//   const [upAxisX, setUpAxisX] = useState<number>(0);
//   const [upAxisY, setUpAxisY] = useState<number>(1);
//   const [upAxisZ, setUpAxisZ] = useState<number>(0);
//   const [isRenderSticker, setIsRenderSticker] = useState<boolean>(true);
//   const [isRenderInnerOutlineCube, setIsRenderInnerOutlineCube] = 
//     useState<boolean>(true);
//   const [isRenderInnerCube, setIsRenderInnerCube] = useState<boolean>(false);
//   const [isRenderInnerPlane, setIsRenderInnerPlane] = useState<boolean>(false);
//   const [drawMode, setDrawMode] = useState<number>(4);
//   const drawModeOptions: ISelectOption[] = [
//     { label: `Points`, value: `0` }, 
//     { label: `Lines`, value: `1` }, 
//     { label: `Line Loop`, value: `2` }, 
//     { label: `Line Strip`, value: `3` }, 
//     { label: `Triangles`, value: `4` }, 
//     { label: `Triangle Strip`, value: `5` }, 
//     { label: `Triangle Fan`, value: `6` }, 
//   ];
//   const [pointSize, setPointSize] = useState<number>(1);
//   const [topColor, setTopColor] = useState<string>(`#ffffff`);
//   const [bottomColor, setBottomColor] = useState<string>(`#ffff00`);
//   const [frontColor, setFrontColor] = useState<string>(`#00ff00`);
//   const [backColor, setBackColor] = useState<string>(`#0000ff`);
//   const [rightColor, setRightColor] = useState<string>(`#ff0000`);
//   const [leftColor, setLeftColor] = useState<string>(`#ffa700`);
//   const [innerTopColor, setInnerTopColor] = useState<string>(`#121212`);
//   const [innerBottomColor, setInnerBottomColor] = useState<string>(`#121212`);
//   const [innerFrontColor, setInnerFrontColor] = useState<string>(`#121212`);
//   const [innerBackColor, setInnerBackColor] = useState<string>(`#121212`);
//   const [innerRightColor, setInnerRightColor] = useState<string>(`#121212`);
//   const [innerLeftColor, setInnerLeftColor] = useState<string>(`#121212`);
//   const [stickerTransparency, setStickerTransparency] = useState<number>(1);
//   const [innerCubeTransparency, setInnerCubeTransparency] = useState<number>(1);
//   const [fieldOfView, setFieldOfView] = useState<IRationalNumber>({
//     numerator: 1, 
//     denominator: 7
//   });
//   const [nearPlane, setNearPlane] = useState<number>(0.1);
//   const [farPlane, setFarPlane] = useState<number>(100);

//   const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
//   const [controls, setControls] = useState<CControl[]>([]);
//   const [planeMatrix, setPlaneMatrix] = useState<Float32Array<ArrayBuffer>>();
//   const [planeVertexes, setPlaneVertexes] = useState<CVertex[]>([]);
//   const [planeIndexes, setPlaneIndexes] = useState<number[]>([]);

//   const handleChangeRubikSizeX = (e: ChangeEvent<HTMLInputElement>): void => {
//     setRubikSizeX(+e.target.value);
//   }
//   const handleChangeRubikSizeY = (e: ChangeEvent<HTMLInputElement>): void => {
//     setRubikSizeY(+e.target.value);
//   }
//   const handleChangeRubikSizeZ = (e: ChangeEvent<HTMLInputElement>): void => {
//     setRubikSizeZ(+e.target.value);
//   }
//   const handleChangeRubikLength = (e: ChangeEvent<HTMLInputElement>): void => {
//     setRubikLength(+e.target.value);
//   }
//   const handleChangeStickerGap = (e: ChangeEvent<HTMLInputElement>): void => {
//     setStickerGap(+e.target.value);
//   }
//   const handleChangeStickerSize = (e: ChangeEvent<HTMLInputElement>): void => {
//     setStickerSize(+e.target.value);
//   }
//   const handleChangeTranslateX = (e: ChangeEvent<HTMLInputElement>): void => {
//     setTranslateX(+e.target.value);
//   }
//   const handleChangeTranslateY = (e: ChangeEvent<HTMLInputElement>): void => {
//     setTranslateY(+e.target.value);
//   }
//   const handleChangeTranslateZ = (e: ChangeEvent<HTMLInputElement>): void => {
//     setTranslateZ(+e.target.value);
//   }
//   const handleChangeAxisXRotation = (
//     numeratorInputElement: HTMLInputElement | null, 
//     denominatorInputElement: HTMLInputElement | null, 
//   ) => {
//     if ( numeratorInputElement === null || denominatorInputElement === null )
//       return;

//     setAxisXRotation({
//       numerator: +numeratorInputElement.value, 
//       denominator: +denominatorInputElement.value, 
//     });
//   }
//   const handleChangeAxisYRotation = (
//     numeratorInputElement: HTMLInputElement | null, 
//     denominatorInputElement: HTMLInputElement | null, 
//   ) => {
//     if ( numeratorInputElement === null || denominatorInputElement === null )
//       return;

//     setAxisYRotation({
//       numerator: +numeratorInputElement.value, 
//       denominator: +denominatorInputElement.value, 
//     });
//   }
//   const handleChangeAxisZRotation = (
//     numeratorInputElement: HTMLInputElement | null, 
//     denominatorInputElement: HTMLInputElement | null, 
//   ) => {
//     if ( numeratorInputElement === null || denominatorInputElement === null )
//       return;

//     setAxisZRotation({
//       numerator: +numeratorInputElement.value, 
//       denominator: +denominatorInputElement.value, 
//     });
//   }
//   const handleChangeRubikOrientationX = (
//     numeratorInputElement: HTMLInputElement | null, 
//     denominatorInputElement: HTMLInputElement | null, 
//   ) => {
//     if ( numeratorInputElement === null || denominatorInputElement === null )
//       return;

//     setRubikOrientationX({
//       numerator: +numeratorInputElement.value, 
//       denominator: +denominatorInputElement.value, 
//     });
//   }
//   const handleChangeRubikOrientationY = (
//     numeratorInputElement: HTMLInputElement | null, 
//     denominatorInputElement: HTMLInputElement | null, 
//   ) => {
//     if ( numeratorInputElement === null || denominatorInputElement === null )
//       return;

//     setRubikOrientationY({
//       numerator: +numeratorInputElement.value, 
//       denominator: +denominatorInputElement.value, 
//     });
//   }
//   const handleChangeRubikOrientationZ = (
//     numeratorInputElement: HTMLInputElement | null, 
//     denominatorInputElement: HTMLInputElement | null, 
//   ) => {
//     if ( numeratorInputElement === null || denominatorInputElement === null )
//       return;

//     setRubikOrientationZ({
//       numerator: +numeratorInputElement.value, 
//       denominator: +denominatorInputElement.value, 
//     });
//   }
//   const handleChangeCameraPositionX = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setCameraPositionX(+e.target.value);
//   }
//   const handleChangeCameraPositionY = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setCameraPositionY(+e.target.value);
//   }
//   const handleChangeCameraPositionZ = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setCameraPositionZ(+e.target.value);
//   }
//   const handleChangeCameraLookAtX = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setCameraLookAtX(+e.target.value);
//   }
//   const handleChangeCameraLookAtY = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setCameraLookAtY(+e.target.value);
//   }
//   const handleChangeCameraLookAtZ = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setCameraLookAtZ(+e.target.value);
//   }
//   const handleChangeUpAxisX = (e: ChangeEvent<HTMLInputElement>): void => {
//     setUpAxisX(+e.target.value);
//   }
//   const handleChangeUpAxisY = (e: ChangeEvent<HTMLInputElement>): void => {
//     setUpAxisY(+e.target.value);
//   }
//   const handleChangeUpAxisZ = (e: ChangeEvent<HTMLInputElement>): void => {
//     setUpAxisZ(+e.target.value);
//   }
//   const handleChangeIsRenderSticker = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setIsRenderSticker(e.target.checked);
//   }
//   const handleChangeIsRenderInnerOutlineCube = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setIsRenderInnerOutlineCube(e.target.checked);
//   }
//   const handleChangeIsRenderInnerCube = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setIsRenderInnerCube(e.target.checked);
//   }
//   const handleChangeIsRenderInnerPlane = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setIsRenderInnerPlane(e.target.checked);
//   }
//   const handleChangeDrawMode = (e: ChangeEvent<HTMLSelectElement>): void => {
//     setDrawMode(+e.target.value);
//   }
//   const handleChangePointSize = (e: ChangeEvent<HTMLInputElement>): void => {
//     setPointSize(+e.target.value);
//   }
//   const handleChangeTopColor = (e: ChangeEvent<HTMLInputElement>): void => {
//     setTopColor(e.target.value);
//   }
//   const handleChangeBottomColor = (e: ChangeEvent<HTMLInputElement>): void => {
//     setBottomColor(e.target.value);
//   }
//   const handleChangeFrontColor = (e: ChangeEvent<HTMLInputElement>): void => {
//     setFrontColor(e.target.value);
//   }
//   const handleChangeBackColor = (e: ChangeEvent<HTMLInputElement>): void => {
//     setBackColor(e.target.value);
//   }
//   const handleChangeRightColor = (e: ChangeEvent<HTMLInputElement>): void => {
//     setRightColor(e.target.value);
//   }
//   const handleChangeLeftColor = (e: ChangeEvent<HTMLInputElement>): void => {
//     setLeftColor(e.target.value);
//   }
//   const handleChangeInnerTopColor = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setInnerTopColor(e.target.value);
//   }
//   const handleChangeInnerBottomColor = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setInnerBottomColor(e.target.value);
//   }
//   const handleChangeInnerFrontColor = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setInnerFrontColor(e.target.value);
//   }
//   const handleChangeInnerBackColor = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setInnerBackColor(e.target.value);
//   }
//   const handleChangeInnerRightColor = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setInnerRightColor(e.target.value);
//   }
//   const handleChangeInnerLeftColor = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setInnerLeftColor(e.target.value);
//   }
//   const handleChangeStickerTransparency = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setStickerTransparency(+e.target.value);
//   }
//   const handleChangeInnerCubeTransparency = (
//     e: ChangeEvent<HTMLInputElement>
//   ): void => {
//     setInnerCubeTransparency(+e.target.value);
//   }
//   const handleChangeFieldOfView = (
//     numeratorInputElement: HTMLInputElement | null, 
//     denominatorInputElement: HTMLInputElement | null, 
//   ) => {
//     if ( numeratorInputElement === null || denominatorInputElement === null )
//       return;

//     setFieldOfView({
//       numerator: +numeratorInputElement.value, 
//       denominator: +denominatorInputElement.value, 
//     })
//   }
//   const handleChangeNearPlane = ( e: ChangeEvent<HTMLInputElement>): void => {
//     setNearPlane(+e.target.value);
//   }
//   const handleChangeFarPlane = ( e: ChangeEvent<HTMLInputElement>): void => {
//     setFarPlane(+e.target.value);
//   }

//   const canvasRef: RefObject<null | HTMLCanvasElement> = 
//     useRef<null | HTMLCanvasElement>(null);
//   const backgroundColor: CColor = useMemo(() => new CColor(
//     0 / MAX_HEX_COLOR_TO_DECIMAL, 
//     0 / MAX_HEX_COLOR_TO_DECIMAL, 
//     0 / MAX_HEX_COLOR_TO_DECIMAL, 
//     1.0, 
//   ), []);

//   useEffect((): void => {
//     const init = async (): Promise<void> => {
//       const canvas: null | HTMLCanvasElement = canvasRef.current;
//       setCanvas(canvas);

//       if ( !canvas ) {
//         console.error(`Error null canvas`);
//         return;
//       }

//       resetCanvasDimension(canvas);

//       const context: WebGL2RenderingContext | WebGLRenderingContext | null = 
//         canvas.getContext(`webgl2`, {premultipliedAlpha: false}) || 
//         canvas.getContext(`webgl`, {premultipliedAlpha: false});

//       setGl(context);
//       if ( !context ) {
//         console.error(`Error null WebGL`);
//         return;
//       }

//       context.viewport(0, 0, canvas.width, canvas.height);
//       context.clearColor(
//         backgroundColor.getR(), 
//         backgroundColor.getG(), 
//         backgroundColor.getB(), 
//         backgroundColor.getA(), 
//       );
//       context.clear(
//         context.COLOR_BUFFER_BIT | 
//         context.DEPTH_BUFFER_BIT | 
//         context.STENCIL_BUFFER_BIT
//       );
//       context.enable(context.DEPTH_TEST);
//       context.enable(context.CULL_FACE);
//       context.enable(context.BLEND);
//       context.frontFace(context.CCW);
//       context.cullFace(context.BACK);
//       context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);

//       const vertextShader: WebGLShader | null = 
//         context.createShader(context.VERTEX_SHADER);
//       const fragmentShader: WebGLShader | null = 
//         context.createShader(context.FRAGMENT_SHADER);

//       if ( !vertextShader || !fragmentShader )
//         return;

//       const vertexShaderResponse: Response = 
//         await fetch(`/shaders/vertex.glsl`);
//       const vertexShaderText: string = await vertexShaderResponse.text();

//       const fragmentShaderResponse: Response = 
//         await fetch(`/shaders/fragment.glsl`);
//       const fragmentShaderText: string = await fragmentShaderResponse.text();

//       context.shaderSource(vertextShader, vertexShaderText);
//       context.shaderSource(fragmentShader, fragmentShaderText);

//       context.compileShader(vertextShader);
//       if ( !context.getShaderParameter(vertextShader, context.COMPILE_STATUS) ) {
//         console.error(
//           `Error compiling vertex shader`, 
//           context.getShaderInfoLog(vertextShader)
//         );
//         return;
//       }

//       context.compileShader(fragmentShader);
//       if ( !context.getShaderParameter(fragmentShader, context.COMPILE_STATUS) ) {
//         console.error(
//           `Error compiling fragment shader`, 
//           context.getShaderInfoLog(fragmentShader)
//         );
//         return;
//       }

//       const program: WebGLProgram = context.createProgram();
//       setProgram(program);

//       if ( !program ) {
//         console.error(`Error null program`);
//         return;
//       }

//       context.attachShader(program, vertextShader);
//       context.attachShader(program, fragmentShader);

//       context.linkProgram(program);

//       if ( !context.getProgramParameter(program, context.LINK_STATUS) ) {
//         console.error(`Error linking program`, context.getProgramInfoLog(program));
//         return;
//       }

//       context.validateProgram(program);

//       if ( !context.getProgramParameter(program, context.VALIDATE_STATUS) ) {
//         console.error(`Error validating program`, context.getProgramInfoLog(program));
//         return;
//       }
//     } 

//     init();
//   }, [backgroundColor, gl]);

//   const createRubikControl = (
//     start: number = 0, 
//     end: number = 0, 
//     size: number[] = [0, 0, 0], 
//     directions: number[] = [0, 0, 0], 
//     rotationNames: string[] = [``, ``, ``], 
//     axis: string = `x`, 
//     haveAllCubies: boolean = false, 
//     distance: number = 0.5, 
//     maxDistance: number = 2, 
//   ): void => {
//     if (start === end && haveAllCubies === false)
//       return;

//     for (let i = start; i <= end; i++) {
//       const mean: number = (start + end) / 2;
//       let stickerStart: number = 0;
//       let stickerEnd: number = 0;
//       const layer: number = (size[0] - Math.abs(i * 2) - 1) / 2 + 1;
      
//       if (i === start && i !== end) 
//         stickerStart = maxDistance;
//       else if (i !== start && i === end) 
//         stickerEnd = maxDistance;
//       else if (i === start && i === end) {
//         stickerStart = maxDistance;
//         stickerEnd = maxDistance;
//       }

//       let plane1: CPlane;
//       let plane2: CPlane;

//       const planeUpperLimit: number = i - distance - stickerStart;
//       const planeLowerLimit: number = i + distance + stickerEnd;

//       switch (axis) {
//         case `x`:
//           plane1 = createPlaneFrom3Points(
//             new CPosition(planeUpperLimit, 0, 0), 
//             new CPosition(planeUpperLimit, 0, 1), 
//             new CPosition(planeUpperLimit, 1, 1), 
//           );
//           plane2 = createPlaneFrom3Points(
//             new CPosition(planeLowerLimit, 0, 0), 
//             new CPosition(planeLowerLimit, 0, 1), 
//             new CPosition(planeLowerLimit, 1, 1), 
//           )
//           break;
//         case `y`:
//           plane1 = createPlaneFrom3Points(
//             new CPosition(0, planeUpperLimit, 0), 
//             new CPosition(0, planeUpperLimit, 1), 
//             new CPosition(1, planeUpperLimit, 1), 
//           );
//           plane2 = createPlaneFrom3Points(
//             new CPosition(0, planeLowerLimit, 0), 
//             new CPosition(0, planeLowerLimit, 1), 
//             new CPosition(1, planeLowerLimit, 1), 
//           )
//           break;
//         case `z`:
//           plane1 = createPlaneFrom3Points(
//             new CPosition(0, 0, planeUpperLimit), 
//             new CPosition(0, 1, planeUpperLimit), 
//             new CPosition(1, 1, planeUpperLimit), 
//           );
//           plane2 = createPlaneFrom3Points(
//             new CPosition(0, 0, planeLowerLimit), 
//             new CPosition(0, 1, planeLowerLimit), 
//             new CPosition(1, 1, planeLowerLimit), 
//           )
//           break;
//         default:
//           return;
//       }

//       let suffix: string = layer + '';
//       if (layer === size[0] || layer === 0 || layer === 1 || i === mean)
//         suffix = ``;

//       let rotationName: string = ``;
//       let direction: number = 0;

//       if (i < mean) {
//         rotationName = rotationNames[0];
//         direction = directions[0];
//       }
//       else if (i > mean) {
//         rotationName = rotationNames[1];
//         direction = directions[1];
//       } else {
//         rotationName = rotationNames[2];
//         direction = directions[2];
//       }

//       if ( size[1] === size[2] ) {
//         setControls((prev: CControl[]): CControl[] => [
//           ...prev, 
//           new CControl(
//             suffix + rotationName, 
//             new CPosition(plane1.getA(), plane1.getB(), plane1.getC()), 
//             QUARTER_OF_CIRCLE * direction, 
//             plane1.getD(), 
//             plane2.getD(), 
//             i
//           ), 
//           new CControl(
//             suffix + rotationName + ROTATE_QUARTER_OF_CIRCLE_REVERSE_SYMBOL, 
//             new CPosition(plane1.getA(), plane1.getB(), plane1.getC()), 
//             -QUARTER_OF_CIRCLE * direction, 
//             plane1.getD(), 
//             plane2.getD(), 
//             i
//           ), 
//         ]);
//       }

//       setControls((prev: CControl[]): CControl[] => [
//         ...prev, 
//         new CControl(
//           suffix + rotationName + `2`, 
//           new CPosition(plane1.getA(), plane1.getB(), plane1.getC()), 
//           HALF_OF_CIRCLE * direction, 
//           plane1.getD(), 
//           plane2.getD(), 
//           i
//         ), 
//       ]);
//     }
//   }

//   const createVertexesBasedOnPlanes = (): void => {
//     const quat: Float32Array<ArrayBuffer> = eulerToQuat(
//       axisXRotation.numerator * Math.PI / axisXRotation.denominator, 
//       axisYRotation.numerator * Math.PI / axisYRotation.denominator, 
//       axisZRotation.numerator * Math.PI / axisZRotation.denominator, 
//     );

//     const invertedQuat: Float32Array<ArrayBuffer> = invertQuat(quat);

//     const xAxisVector: Float32Array<ArrayBuffer> = new Float32Array(4);
//     xAxisVector[0] = 1;
//     xAxisVector[1] = 0;
//     xAxisVector[2] = 0;
//     xAxisVector[3] = 1;

//     const yAxisVector: Float32Array<ArrayBuffer> = new Float32Array(4);
//     yAxisVector[0] = 0;
//     yAxisVector[1] = 1;
//     yAxisVector[2] = 0;
//     yAxisVector[3] = 1;

//     const zAxisVector: Float32Array<ArrayBuffer> = new Float32Array(4);
//     zAxisVector[0] = 0;
//     zAxisVector[1] = 0;
//     zAxisVector[2] = 1;
//     zAxisVector[3] = 1;

//     const rotatedXAxisVector: Float32Array<ArrayBuffer> = multiplyQuat(
//       multiplyQuat(quat, xAxisVector), 
//       invertedQuat, 
//     );
//     const rotatedYAxisVector: Float32Array<ArrayBuffer> = multiplyQuat(
//       multiplyQuat(quat, yAxisVector), 
//       invertedQuat, 
//     );
//     const rotatedZAxisVector: Float32Array<ArrayBuffer> = multiplyQuat(
//       multiplyQuat(quat, zAxisVector), 
//       invertedQuat, 
//     );

//     const matrix: Float32Array<ArrayBuffer> = new Float32Array(9);
//     matrix[0] = rounding( rotatedXAxisVector[0] );
//     matrix[1] = rounding( rotatedXAxisVector[1] );
//     matrix[2] = rounding( rotatedXAxisVector[2] );
//     matrix[3] = rounding( rotatedYAxisVector[0] );
//     matrix[4] = rounding( rotatedYAxisVector[1] );
//     matrix[5] = rounding( rotatedYAxisVector[2] );
//     matrix[6] = rounding( rotatedZAxisVector[0] );
//     matrix[7] = rounding( rotatedZAxisVector[1] );
//     matrix[8] = rounding( rotatedZAxisVector[2] );

//     setPlaneMatrix(matrix);
//   }

//   const createRubikControls = (
//     startX: number = 0, 
//     endX: number = 0, 
//     startY: number = 0, 
//     endY: number = 0, 
//     startZ: number = 0, 
//     endZ: number = 0
//   ): void => {
//     createRubikControl(
//       startX, 
//       endX, 
//       [rubikSizeX, rubikSizeY, rubikSizeZ], 
//       [1, -1, -1], 
//       [`R`, `L`, `M`], 
//       `x`, 
//     );
//     createRubikControl(
//       startY, 
//       endY, 
//       [rubikSizeY, rubikSizeX, rubikSizeZ], 
//       [-1, 1, -1], 
//       [`D`, `U`, `E`], 
//       `y`, 
//     );
//     createRubikControl(
//       startZ, 
//       endZ, 
//       [rubikSizeZ, rubikSizeX, rubikSizeY], 
//       [1, -1, 1], 
//       [`F`, `B`, `S`], 
//       `z`, 
//     );

//     createRubikControl(
//       0, 
//       0, 
//       [rubikSizeX, rubikSizeY, rubikSizeZ], 
//       [0, 0, 1], 
//       [``, ``, `x`], 
//       `x`, 
//       true, 
//       rubikSizeX / 2, 
//     );
//     createRubikControl(
//       0, 
//       0, 
//       [rubikSizeY, rubikSizeX, rubikSizeZ], 
//       [0, 0, 1], 
//       [``, ``, `y`], 
//       `y`, 
//       true, 
//       rubikSizeY / 2, 
//     );
//     createRubikControl(
//       0, 
//       0, 
//       [rubikSizeZ, rubikSizeX, rubikSizeY], 
//       [0, 0, 1], 
//       [``, ``, `z`], 
//       `z`, 
//       true, 
//       rubikSizeZ / 2, 
//     );
//   }

//   const createVertexFromThreeIntersectedPlanes = (
//     i: number = 0, 
//     j: number = 0, 
//     k: number = 0, 
//     planeXs: CPlane[] = [], 
//     planeYs: CPlane[] = [], 
//     planeZs: CPlane[] = [], 
//     plane: CPlane = new CPlane(), 
//   ): CVertex => {
//     const planeEquation: Float32Array<ArrayBuffer> = new Float32Array(9);

//     planeEquation[0] = planeXs[i].getA();
//     planeEquation[3] = planeXs[i].getB();
//     planeEquation[6] = planeXs[i].getC();

//     planeEquation[1] = planeYs[j].getA();
//     planeEquation[4] = planeYs[j].getB();
//     planeEquation[7] = planeYs[j].getC();

//     planeEquation[2] = planeZs[k].getA();
//     planeEquation[5] = planeZs[k].getB();
//     planeEquation[8] = planeZs[k].getC();
    
//     const inverse: Float32Array<ArrayBuffer> | null = invert(planeEquation);

//     if ( !inverse )
//       return new CVertex();

//     const dVector: Float32Array<ArrayBuffer> = new Float32Array(3);
//     dVector[0] = -planeXs[i].getD();
//     dVector[1] = -planeYs[j].getD();
//     dVector[2] = -planeZs[k].getD();

//     const resultVector: Float32Array<ArrayBuffer> = 
//       transformMat3(dVector, inverse);

//     return new CVertex(
//       new CPosition(
//         resultVector[0], 
//         resultVector[1], 
//         resultVector[2], 
//       ), 
//       plane.getColor(), 
//       plane.getColorName(), 
//       new CPosition(), 
//     );
//   }

//   const createOutlinedPlanes = (
//     startX: number = 0, 
//     endX: number = 0, 
//     startY: number = 0, 
//     endY: number = 0, 
//     startZ: number = 0, 
//     endZ: number = 0
//   ): void => {
//     const HALF = 1 / 2;
//     const planeXs = [];
//     const planeYs = [];
//     const planeZs = [];

//     planeXs.push(
//       // Left
//       createPlaneFrom3Points(
//         new CPosition(startX - HALF, startY - HALF, startZ - HALF), 
//         new CPosition(startX - HALF, startY - HALF, endZ   + HALF), 
//         new CPosition(startX - HALF, endY   + HALF, endZ   + HALF), 
//         hexaToRgba(leftColor), 
//         `left`, 
//         0, 
//       ), 
//       // Right
//       createPlaneFrom3Points(
//         new CPosition(endX + HALF, startY - HALF, startZ - HALF), 
//         new CPosition(endX + HALF, startY - HALF, endZ   + HALF), 
//         new CPosition(endX + HALF, endY   + HALF, endZ   + HALF), 
//         hexaToRgba(rightColor), 
//         `right`, 
//         0, 
//       ), 
//     );

//     planeYs.push(
//       // Bottom
//       createPlaneFrom3Points(
//         new CPosition(startX - HALF, startY - HALF, startZ - HALF), 
//         new CPosition(startX - HALF, startY - HALF, endZ   + HALF), 
//         new CPosition(endX   + HALF, startY - HALF, endZ   + HALF), 
//         hexaToRgba(bottomColor), 
//         `bottom`, 
//         0, 
//       ), 
//       // Top
//       createPlaneFrom3Points(
//         new CPosition(startX - HALF, endY + HALF, startZ - HALF), 
//         new CPosition(startX - HALF, endY + HALF, endZ   + HALF), 
//         new CPosition(endX   + HALF, endY + HALF, endZ   + HALF), 
//         hexaToRgba(topColor), 
//         `top`, 
//         0, 
//       ), 
//     );

//     planeZs.push(
//       // Back
//       createPlaneFrom3Points(
//         new CPosition(startX - HALF, startY - HALF, startZ - HALF), 
//         new CPosition(startX - HALF, endY   + HALF, startZ - HALF), 
//         new CPosition(endX   + HALF, endY   + HALF, startZ - HALF), 
//         hexaToRgba(backColor), 
//         `back`, 
//         0, 
//       ), 
//       // Front
//       createPlaneFrom3Points(
//         new CPosition(startX - HALF, startY - HALF, endZ + HALF), 
//         new CPosition(startX - HALF, endY   + HALF, endZ + HALF), 
//         new CPosition(endX   + HALF, endY   + HALF, endZ + HALF), 
//         hexaToRgba(frontColor), 
//         `front`, 
//         0, 
//       ), 
//     )

//     for (let i = 0; i < planeXs.length; i++) {
//       for (let j = 0; j < planeYs.length; j++) {
//         for (let k = 0; k < planeZs.length; k++) {
//           console.log(
//             createVertexFromThreeIntersectedPlanes(
//               i, j, k, planeXs, planeYs, planeZs
//             )
//           );
//         }
//       }
//     }
//   }

//   const handleCreateRubik = (): void => {
//     if ( !canvas ) {
//       console.error(`Error null canvas`);
//       return;
//     }

//     if ( !gl ) {
//       console.error(`Error null WebGL`);
//       return;
//     }

//     if ( !program ) {
//       console.error(`Error null program`);
//       return;
//     }

//     const endX = (rubikSizeX - 1) / 2;
//     const startX = -endX;
//     const endY = (rubikSizeY - 1) / 2;
//     const startY = -endY;
//     const endZ = (rubikSizeZ - 1) / 2;
//     const startZ = -endZ;
//     // const vertexes = [];
//     const vertexIndexes = [];

//     createOutlinedPlanes(startX, endX, startY, endY, startZ, endZ);
//     createRubikControls(startX, endX, startY, endY, startZ, endZ);
//     createVertexesBasedOnPlanes();

//     const vertexes = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertexes);
//     gl.bufferData(
//       gl.ARRAY_BUFFER, 
//       new Float32Array( DEFAULT_BOX_VERTEXES, ), 
//       gl.STATIC_DRAW, 
//     );

//     const indexes = gl.createBuffer();
//     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexes);
//     gl.bufferData(
//       gl.ELEMENT_ARRAY_BUFFER, 
//       new Uint16Array( DEFAULT_BOX_INDEXES, ), 
//       gl.STATIC_DRAW, 
//     );

//     const POSITION_ATTRIBUTE_LOCATION = gl.getAttribLocation(
//       program, `vecPosition`
//     );
//     const COLOR_ATTRIBUTE_LOCATION = gl.getAttribLocation(
//       program, `vecColor`
//     );

//     gl.vertexAttribPointer(
//       POSITION_ATTRIBUTE_LOCATION,
//       3, // Number of element per attribute
//       gl.FLOAT, // Type of elements, 
//       false,
//       7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
//       0 * Float32Array.BYTES_PER_ELEMENT, // Offset from the beginning of a single vertex to this attribute
//     );
//     gl.vertexAttribPointer(
//       COLOR_ATTRIBUTE_LOCATION,
//       4, // Number of element per attribute
//       gl.FLOAT, // Type of elements, 
//       false,
//       7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
//       3 * Float32Array.BYTES_PER_ELEMENT, // Offset from the beginning of a single vertex to this attribute
//     );

//     gl.enableVertexAttribArray(POSITION_ATTRIBUTE_LOCATION);
//     gl.enableVertexAttribArray(COLOR_ATTRIBUTE_LOCATION);

//     gl.useProgram(program);

//     const UNIFORM_MAT_LOCATION_WORLD: WebGLUniformLocation | null = 
//       gl.getUniformLocation(program, `matWorld`);
//     const UNIFORM_MAT_LOCATION_VIEW: WebGLUniformLocation | null = 
//       gl.getUniformLocation(program, `matView`);
//     const UNIFORM_MAT_LOCATION_PROJECTION: WebGLUniformLocation | null = 
//       gl.getUniformLocation(program, `matProjection`);
//     const UNIFORM_TRANSPARENCY: WebGLUniformLocation | null = 
//       gl.getUniformLocation(program, `transparency`);

//     let MATRIX_WORLD = identity();
//     const MATRIX_VIEW = lookAt(
//       new Float32Array([
//         cameraPositionX, 
//         cameraPositionY, 
//         cameraPositionZ
//       ]), 
//       new Float32Array([
//         cameraLookAtX, 
//         cameraLookAtY, 
//         cameraLookAtZ
//       ]), 
//       new Float32Array([
//         upAxisX, 
//         upAxisY, 
//         upAxisZ
//       ]), 
//     );

//     const MATRIX_PROJECTION = perspective(
//       fieldOfView.numerator * Math.PI / fieldOfView.denominator, 
//       canvas.width / canvas.height, 
//       nearPlane, 
//       farPlane,  
//     );

//     gl.uniformMatrix4fv(UNIFORM_MAT_LOCATION_WORLD, false, MATRIX_WORLD);
//     gl.uniformMatrix4fv(UNIFORM_MAT_LOCATION_VIEW, false, MATRIX_VIEW);
//     gl.uniformMatrix4fv(
//       UNIFORM_MAT_LOCATION_PROJECTION, 
//       false, 
//       MATRIX_PROJECTION
//     );
//     gl.uniform1f(UNIFORM_TRANSPARENCY, 0.5);

//     let MATRIX_ROTATION_X: Float32Array<ArrayBuffer>;
//     let MATRIX_ROTATION_Y: Float32Array<ArrayBuffer>;

//     let angle = 0;
//     let loopId: number;

//     const loop = () => {
//       if ( !canvasRef.current ) {
//         console.error(`Error null canvas`);
//         cancelAnimationFrame(loopId);
//         return;
//       }

//       angle = performance.now() / 1000 / 6 * 2 * Math.PI * 1;

//       MATRIX_ROTATION_X = rotate(
//         identity(), 
//         angle * 0 / 1, 
//         new Float32Array([1, 0, 0])
//       );
//       MATRIX_ROTATION_Y = rotate(
//         identity(), 
//         angle * 1 / 1, 
//         new Float32Array([0, 1, 0])
//       );

//       MATRIX_WORLD = multiply(MATRIX_ROTATION_X, MATRIX_ROTATION_Y);
//       gl.uniformMatrix4fv(UNIFORM_MAT_LOCATION_WORLD, false, MATRIX_WORLD);

//       resetCanvasDimension(canvas);

//       gl.clearColor(
//         backgroundColor.getR(), 
//         backgroundColor.getG(), 
//         backgroundColor.getB(), 
//         backgroundColor.getA(), 
//       );
//       gl.clear(
//         gl.COLOR_BUFFER_BIT | 
//         gl.DEPTH_BUFFER_BIT | 
//         gl.STENCIL_BUFFER_BIT
//       );
//       gl.drawElements(
//         drawMode, 
//         DEFAULT_BOX_INDEXES.length, 
//         gl.UNSIGNED_SHORT, 
//         0, 
//       );

//       loopId = requestAnimationFrame(loop);
//     }

//     loop();
//   }

//   const minRubikSize: number = 1;
//   const maxRubikSize: number = 20;
//   const minRubikLength: number = 0.001;
//   const maxRubikLength: number = 0.999;
//   const minStickerGap: number = 0;
//   const maxStickerGap: number = 1;
//   const minStickerSize: number = 0;
//   const maxStickerSize: number = 1;
//   const minNumberInputWidth: number = 20;

//   const pageStyle: CSSProperties = {
//     gridTemplateColumns: `${isControlExpand ? '1fr' : ''} 3fr`, 
//   }
//   const inputStyle: CSSProperties = {
//     gridTemplateColumns: `7fr 2fr`, 
//   }

//   const handleChangeIsControlExpand = (): void => {
//     setIsControlExpand((prev: boolean): boolean => !prev);
//   }

//   return (
//     <div className={`grid gap-2 h-full`} style={pageStyle}>
//       <div className={`relative overflow-scroll flex flex-col gap-2 ${
//         isControlExpand ? 'block' : 'hidden'
//       }`}>
//         <Button onClick={handleCreateRubik}>
//           <Text>Create!</Text>
//         </Button>

//         <details className={`w-full flex flex-col gap-2`}>
//           <summary className={`select-none font-bold text-lg`}>
//             Rubik Controls
//           </summary>

//           <div className={`w-full flex flex-col gap-2`}>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Rubik size X:</Text>
//               <NumberInput 
//                 value={rubikSizeX} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeRubikSizeX}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Rubik size Y:</Text>
//               <NumberInput 
//                 value={rubikSizeY} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeRubikSizeY}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Rubik size Z:</Text>
//               <NumberInput 
//                 value={rubikSizeZ} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeRubikSizeZ}
//               >
//               </NumberInput>
//             </div>
            
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Rubik Length:</Text>
//               <NumberInput 
//                 value={rubikLength} 
//                 min={minRubikLength} 
//                 max={maxRubikLength} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeRubikLength}
//               >
//               </NumberInput>
//             </div>
            
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Sticker gap:</Text>
//               <NumberInput 
//                 value={stickerGap} 
//                 min={minStickerGap} 
//                 max={maxStickerGap} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeStickerGap}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Sticker Size (0 to 1):</Text>
//               <NumberInput 
//                 value={stickerSize} 
//                 min={minStickerSize} 
//                 max={maxStickerSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeStickerSize}
//               >
//               </NumberInput>
//             </div>
//           </div>
//         </details>

//         <details className={`w-full flex flex-col gap-2`}>
//           <summary className={`select-none font-bold text-lg`}>
//             Outer Layer Variant
//           </summary>

//           <div className={`w-full flex flex-col gap-2`}>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Translate X:</Text>
//               <NumberInput 
//                 value={translateX} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeTranslateX}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Translate Y:</Text>
//               <NumberInput 
//                 value={translateY} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeTranslateY}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Translate Z:</Text>
//               <NumberInput 
//                 value={translateZ} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeTranslateZ}
//               >
//               </NumberInput>
//             </div>
            
//             <div 
//               className={`grid gap-2 items-center justify-between`} 
//               style={inputStyle}
//             >
//               <Text>Axis X Rotation:</Text>
//               <RationalNumberInput
//                 value={axisXRotation}
//                 onInputChange={handleChangeAxisXRotation}
//               >
//               </RationalNumberInput>
//             </div>
            
//             <div 
//               className={`grid gap-2 items-center justify-between`} 
//               style={inputStyle}
//             >
//               <Text>Axis Y Rotation:</Text>
//               <RationalNumberInput
//                 value={axisYRotation}
//                 onInputChange={handleChangeAxisYRotation}
//               >
//               </RationalNumberInput>
//             </div>

//             <div 
//               className={`grid gap-2 items-center justify-between`} 
//               style={inputStyle}
//             >
//               <Text>Axis Z Rotation:</Text>
//               <RationalNumberInput
//                 value={axisZRotation}
//                 onInputChange={handleChangeAxisZRotation}
//               >
//               </RationalNumberInput>
//             </div>
//           </div>
//         </details>

//         <details className={`w-full flex flex-col gap-2`}>
//           <summary className={`select-none font-bold text-lg`}>
//             Rubik Orientation
//           </summary>

//           <div className={`w-full flex flex-col gap-2`}>
//             <div 
//               className={`grid gap-2 items-center justify-between`} 
//               style={inputStyle}
//             >
//               <Text>Rubik Orientation X:</Text>
//               <RationalNumberInput
//                 value={rubikOrientationX}
//                 onInputChange={handleChangeRubikOrientationX}
//               >
//               </RationalNumberInput>
//             </div>
            
//             <div 
//               className={`grid gap-2 items-center justify-between`} 
//               style={inputStyle}
//             >
//               <Text>Rubik Orientation Y:</Text>
//               <RationalNumberInput
//                 value={rubikOrientationY}
//                 onInputChange={handleChangeRubikOrientationY}
//               >
//               </RationalNumberInput>
//             </div>

//             <div 
//               className={`grid gap-2 items-center justify-between`} 
//               style={inputStyle}
//             >
//               <Text>Rubik Orientation Z:</Text>
//               <RationalNumberInput
//                 value={rubikOrientationZ}
//                 onInputChange={handleChangeRubikOrientationZ}
//               >
//               </RationalNumberInput>
//             </div>
//           </div>
//         </details>

//         <details className={`w-full flex flex-col gap-2`}>
//           <summary className={`select-none font-bold text-lg`}>
//             Camera
//           </summary>

//           <div className={`w-full flex flex-col gap-2`}>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Camera Position X:</Text>
//               <NumberInput 
//                 value={cameraPositionX} 
//                 min={-100} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeCameraPositionX}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Camera Position Y:</Text>
//               <NumberInput 
//                 value={cameraPositionY} 
//                 min={-100} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeCameraPositionY}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Camera Position Z:</Text>
//               <NumberInput 
//                 value={cameraPositionZ} 
//                 min={-100} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeCameraPositionZ}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Camera Loot at X:</Text>
//               <NumberInput 
//                 value={cameraLookAtX} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeCameraLookAtX}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Camera Look at Y:</Text>
//               <NumberInput 
//                 value={cameraLookAtY} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeCameraLookAtY}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Camera Look at Z:</Text>
//               <NumberInput 
//                 value={cameraLookAtZ} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeCameraLookAtZ}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Up axis X:</Text>
//               <NumberInput 
//                 value={upAxisX} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeUpAxisX}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Up axis Y:</Text>
//               <NumberInput 
//                 value={upAxisY} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeUpAxisY}
//               >
//               </NumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Up axis Z:</Text>
//               <NumberInput 
//                 value={upAxisZ} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangeUpAxisZ}
//               >
//               </NumberInput>
//             </div>
//           </div>
//         </details>

//         <details className={`w-full flex flex-col gap-2`}>
//           <summary className={`select-none font-bold text-lg`}>
//             Rendering
//           </summary>

//           <div className={`w-full flex flex-col gap-2`}>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Render Stickers:</Text>
//               <Checkbox 
//                 isChecked={isRenderSticker}
//                 onInputChange={handleChangeIsRenderSticker}
//               >
//               </Checkbox>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Render Inner Outline Cubes:</Text>
//               <Checkbox 
//                 isChecked={isRenderInnerOutlineCube}
//                 onInputChange={handleChangeIsRenderInnerOutlineCube}
//               >
//               </Checkbox>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Render Inner Cubes:</Text>
//               <Checkbox 
//                 isChecked={isRenderInnerCube}
//                 onInputChange={handleChangeIsRenderInnerCube}
//               >
//               </Checkbox>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Render Inner Planes:</Text>
//               <Checkbox 
//                 isChecked={isRenderInnerPlane}
//                 onInputChange={handleChangeIsRenderInnerPlane}
//               >
//               </Checkbox>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Draw Mode:</Text>
//               <SelectDropdown 
//                 options={drawModeOptions}
//                 defaultOption={drawModeOptions[4]}
//                 onInputChange={handleChangeDrawMode}
//               >
//               </SelectDropdown>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Point Size:</Text>
//               <NumberInput 
//                 value={pointSize} 
//                 min={minRubikSize} 
//                 max={maxRubikSize} 
//                 minWidth={minNumberInputWidth}
//                 onInputChange={handleChangePointSize}
//               >
//               </NumberInput>
//             </div>
//           </div>
//         </details>

//         <details className={`w-full flex flex-col gap-2`}>
//           <summary className={`select-none font-bold text-lg`}>
//             Rubik Colors
//           </summary>

//           <div className={`w-full flex flex-col gap-2`}>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Top Color:</Text>
//               <ColorInput
//                 value={topColor} 
//                 onInputChange={handleChangeTopColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Bottom Color:</Text>
//               <ColorInput
//                 value={bottomColor} 
//                 onInputChange={handleChangeBottomColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Front Color:</Text>
//               <ColorInput
//                 value={frontColor} 
//                 onInputChange={handleChangeFrontColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Back Color:</Text>
//               <ColorInput
//                 value={backColor} 
//                 onInputChange={handleChangeBackColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Right Color:</Text>
//               <ColorInput
//                 value={rightColor} 
//                 onInputChange={handleChangeRightColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Left Color:</Text>
//               <ColorInput
//                 value={leftColor} 
//                 onInputChange={handleChangeLeftColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Inner Top Color:</Text>
//               <ColorInput
//                 value={innerTopColor} 
//                 onInputChange={handleChangeInnerTopColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Inner Bottom Color:</Text>
//               <ColorInput
//                 value={innerBottomColor} 
//                 onInputChange={handleChangeInnerBottomColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Inner Front Color:</Text>
//               <ColorInput
//                 value={innerFrontColor} 
//                 onInputChange={handleChangeInnerFrontColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Inner Back Color:</Text>
//               <ColorInput
//                 value={innerBackColor} 
//                 onInputChange={handleChangeInnerBackColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Inner Right Color:</Text>
//               <ColorInput
//                 value={innerRightColor} 
//                 onInputChange={handleChangeInnerRightColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Inner Left Color:</Text>
//               <ColorInput
//                 value={innerLeftColor} 
//                 onInputChange={handleChangeInnerLeftColor}
//               >
//               </ColorInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Sticker Transparency:</Text>
//               <NumberInput 
//                 value={stickerTransparency}
//                 onInputChange={handleChangeStickerTransparency}
//               >
//               </NumberInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Inner Cube Transparency:</Text>
//               <NumberInput 
//                 value={innerCubeTransparency}
//                 onInputChange={handleChangeInnerCubeTransparency}
//               >
//               </NumberInput>
//             </div>
//           </div>
//         </details>

//         <details className={`w-full flex flex-col gap-2`}>
//           <summary className={`select-none font-bold text-lg`}>
//             Scene
//           </summary>

//           <div className={`w-full flex flex-col gap-2`}>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Field of View:</Text>
//               <RationalNumberInput 
//                 value={fieldOfView}
//                 onInputChange={handleChangeFieldOfView}
//               >
//               </RationalNumberInput>
//             </div>

//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Near Plane:</Text>
//               <NumberInput 
//                 value={nearPlane}
//                 onInputChange={handleChangeNearPlane}
//               >
//               </NumberInput>
//             </div>
//             <div className={`grid gap-2 items-center`} style={inputStyle}>
//               <Text>Far Plane:</Text>
//               <NumberInput 
//                 value={farPlane}
//                 onInputChange={handleChangeFarPlane}
//               >
//               </NumberInput>
//             </div>
//           </div>
//         </details>
//       </div>

//       <div className={`relative w-full h-full`}>
//         <div 
//           className={`absolute left-0 h-full`}
//           title={`Toggle Rubik Control`}
//         >
//           <Button 
//             background={TRANSPARENT_BUTTON} 
//             onClick={handleChangeIsControlExpand}
//             className={`h-full`}
//           >
//             <IconContainer 
//               iconLink={isControlExpand ? chevronLeftIcon : chevronRightIcon}
//             >
//             </IconContainer>
//             <></>
//           </Button>
//         </div>

//         <canvas ref={canvasRef} className={`rounded-xl bg-black w-full h-full`}>
//           Your browser does not support WebGL
//         </canvas>
//       </div>
//     </div>
//   )
// }
import React from 'react'

export default function RubikSimulator() {
  return (
    <div>RubikSimulator</div>
  )
}
