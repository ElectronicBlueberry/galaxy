/*

    This module contains runtime typechecking and assertion utilities,
    to help in quickly narrowing down a type in a typesafe manner.

*/

/**
 * Asserts that a value is not undefined or null
 * @param value value to test
 * @param error optional error message, or Error object
 */
export function assertDefined<T>(value: T, error?: string | Error): asserts value is NonNullable<T> {
    if (value === undefined || value === null) {
        const message = error ?? TypeError(`Value is undefined or null`);
        throw message instanceof Error ? message : TypeError(message);
    }
}

/**
 * Asserts that a value is not undefined or null, then returns said value.
 * Can be used inline
 *
 * @param value value to test
 * @param error optional error message, or Error object
 * @returns NonNullable value
 *
 * @see assertDefined
 */
export function ensureDefined<T>(value: T, error?: string | Error): NonNullable<T> {
    assertDefined(value, error);
    return value;
}

export function assertArray(value: unknown, error?: string | Error): asserts value is Array<unknown> {
    if (!(typeof value === "object" && Array.isArray(value))) {
        const message = error ?? TypeError(`Value is not an Array`);
        throw message instanceof Error ? message : TypeError(message);
    }
}

type Property = string | number | symbol;

/**
 * Returns whether or not a value has a specific property
 *
 * @param value Potentially an object, which may have `property`
 * @param property property to search for
 * @returns `true` if property is in value
 */
export function hasProperty<T>(value: T, property: Property): boolean {
    return typeof value === "object" && value !== null && property in value;
}

/**
 * Assert version of the `hasProperty` utility
 *
 * @param value Potentially an object, which may have `property`
 * @param property property to search for
 * @param error optional error message, or Error object
 *
 * @see hasProperty
 */
export function assertProperty<T>(
    value: T,
    property: Property,
    error?: string | Error
): asserts value is T & Record<typeof property, unknown> {
    if (!hasProperty(value, property)) {
        const propertyString = typeof property === "symbol" ? "Symbol" : `${property}`;
        const message = error ?? TypeError(`Property "${propertyString}" does not exist on value "${value}"`);
        throw message instanceof Error ? message : TypeError(message);
    }
}

/**
 * Uses the `assertProperty` assertion to return the value of a property only if it exists.
 *
 * Use the type parameter to type the return appropriately.
 *
 * @param value Potentially an object, which may have `property`
 * @param property property to search for
 * @returns Value of property or `undefined`
 *
 * @see assertProperty
 */
export function maybeGetProperty<R = unknown>(value: unknown, property: Property): R | undefined {
    try {
        assertProperty(value, property);
        return value[property] as R;
    } catch (e) {
        return undefined;
    }
}

/**
 * Uses the `maybeGetProperty` utility to return the value a the end of a chain of properties,
 * only if all properties and child properties exist.
 *
 * Use the type parameter to type the return appropriately.
 *
 * @param value Potentially an object
 * @param property property chain to search
 * @returns Value of property and end of chain or `undefined`
 *
 * @see maybeGetProperty
 */
export function maybeGetPropertyChain<R = unknown>(value: unknown, propertyChain: Property[]): R | undefined {
    let nextValue: unknown = value;

    propertyChain.forEach((property) => {
        nextValue = maybeGetProperty(nextValue, property);
    });

    return nextValue as R | undefined;
}
