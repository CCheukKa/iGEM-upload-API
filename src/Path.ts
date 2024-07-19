/**
 * Represents an array of strings or numbers that represents a path.
 */
type PathArray = (string | number)[];
/**
 * Represents a type that can be either a `PathArray` or a string.
 */
export type PathArrayableType = PathArray | string;

/**
 * Represents a path that can be converted to an array or a string.
 */
export default class PathArrayable {
    constructor(public path: PathArrayableType) { }

    /**
     * Sanitises the path by expanding, trimming, and filtering its elements.
     * If the path is a string, it expands it and then sanitises it.
     * If the path is an object, it trims and filters each element.
     * @returns A new sanitized PathArrayable object.
     * @throws {Error} If the path is of an invalid type.
     */
    public sanitise(): PathArrayable {
        if (typeof this.path === 'string') { return this.expand().sanitise().condense(); }
        if (typeof this.path === 'object') {
            return new PathArrayable(
                this.path
                    .map(pathElement => pathElement.toString().trim())
                    .filter(pathElement => pathElement.length !== 0)
            );
        }
        throw new Error('Invalid PathArrayableType!');
    }
    /**
     * Condenses the path into a PathArrayable object.
     * If the path is an array, it joins the elements with '/' separator.
     * If the path is a string, it returns a new PathArrayable object with the same path.
     * 
     * @returns A new PathArrayable object with the condensed path.
     */
    public condense(): PathArrayable {
        if (typeof this.path === 'object') { return new PathArrayable(this.path.join('/')); }
        return new PathArrayable(this.path);
    }
    /**
     * Returns the condensed path as a string.
     * @returns The condensed path as a string.
     */
    public condenseEnd(): string { return this.condense().path as string; }
    /**
     * Expands the path into a PathArrayable object.
     * If the path is a string, it splits it by '/' and returns a new PathArrayable object.
     * If the path is already an array, it returns a new PathArrayable object with the same path.
     * @returns A new PathArrayable object representing the expanded path.
     */
    public expand(): PathArrayable {
        if (typeof this.path === 'string') { return new PathArrayable(this.path.split('/')); }
        return new PathArrayable(this.path);
    }
    /**
     * Expands the path and returns the expanded path as an array.
     * @returns The expanded path as an array.
     */
    public expandEnd(): PathArray { return this.expand().path as PathArray; }
    /**
     * Returns the path as an array if it is not empty, otherwise returns null.
     * @returns The path as an array or null.
     */
    public getNullablePath(): PathArrayableType | null {
        return this.path.length !== 0 ? this.path : null;
    }
    /**
     * Appends the given path to the current path.
     * 
     * @param path - The path to append.
     * @returns A new `PathArrayable` instance with the appended path.
     */
    public append(path: PathArrayableType): PathArrayable {
        return new PathArrayable(this.expandEnd().concat(new PathArrayable(path).expandEnd()));
    }
}