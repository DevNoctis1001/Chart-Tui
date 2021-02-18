import { ChartSizeInput } from "../../types/options";
export declare function isExist(value: unknown): boolean;
export declare function isDate(value: unknown): value is Date;
export declare function isUndefined(value: unknown): value is undefined;
export declare function isNull(value: unknown): value is null;
export declare function isBoolean(value: unknown): value is boolean;
export declare function isNumber(value: unknown): value is number;
export declare function isString(value: unknown): value is string;
export declare function isInteger(value: unknown): value is number;
export declare function isObject(obj: unknown): obj is object;
export declare function isFunction(value: unknown): value is Function;
export declare function forEach<T extends object, K extends Extract<keyof T, string>, V extends T[K]>(obj: T, cb: (item: V, key: K) => void): void;
export declare function range(start: number, stop?: number, step?: number): number[];
export declare function includes<T>(arr: T[], searchItem: T, searchIndex?: number): boolean;
export declare function pick<T extends object, K extends keyof T>(obj: T, ...propNames: K[]): Pick<T, K>;
export declare function omit<T extends object, K extends keyof T>(obj: T, ...propNames: K[]): Pick<T, Exclude<keyof T, K>>;
export declare function pickProperty(target: Record<string, any>, keys: string[]): Record<string, any> | null;
export declare function pickPropertyWithMakeup(target: Record<string, any>, args: string[]): Record<string, any>;
export declare function debounce(fn: Function, delay?: number): (...args: any[]) => void;
export declare function merge(target: Record<string, any>, ...args: Record<string, any>[]): Record<string, any>;
export declare function throttle(fn: Function, interval?: number): {
    (...args: any[]): void;
    reset: () => void;
};
export declare function deepMergedCopy<T1 extends Record<string, any>, T2 extends Record<string, any>>(targetObj: T1, obj: T2): T1 & T2;
export declare function deepCopyArray<T extends Array<any>>(items: T): T;
export declare function deepCopy<T extends Record<string, any>>(obj: T): T;
export declare function sortCategories(x: number | string, y: number | string): number;
export declare function sortNumber(x: number, y: number): number;
export declare function first<T>(items: T[]): T | undefined;
export declare function last<T>(items: T[]): T | undefined;
export declare function hasNegative(values?: (number | string)[]): boolean;
export declare function sum(items: number[]): number;
export declare function hasPositiveOnly(values: (number | string)[]): boolean;
export declare function hasNegativeOnly(values: (number | string)[]): boolean;
export declare function getFirstValidValue(values: any): any;
export declare function getPercentageValue(text: string): number;
export declare function calculateSizeWithPercentString(size: number, value: string | number): number;
export declare function getInitialSize(size?: ChartSizeInput): number;
export declare function isAutoValue(value?: ChartSizeInput): boolean;
