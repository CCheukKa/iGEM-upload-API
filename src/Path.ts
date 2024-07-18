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
     * @returns The sanitized PathArrayable object.
     */
    public sanitise(): PathArrayable {
        if (typeof this.path === 'string') { this.expand().sanitise().condense(); }
        if (typeof this.path === 'object') {
            this.path = this.path.map(pathElement => pathElement.toString().trim()).filter(pathElement => pathElement.length !== 0);
        }
        return this;
    }
    /**
     * Condenses the path by joining the elements with a forward slash ("/").
     * If the path is already an object, it is converted to a string by joining its elements.
     * 
     * @returns The condensed path.
     */
    public condense(): PathArrayable {
        if (typeof this.path === 'object') { this.path = this.path.join('/'); }
        return this;
    }
    /**
     * Returns the condensed path as a string.
     * @returns The condensed path as a string.
     */
    public condenseEnd(): string { return this.condense().path as string; }
    /**
     * Expands the path by splitting it into an array of path segments.
     * If the path is a string, it will be split using the '/' delimiter.
     * @returns The expanded path as an array.
     */
    public expand(): PathArrayable {
        if (typeof this.path === 'string') { this.path = this.path.split('/'); }
        return this;
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
     * @returns The updated Path object.
     */
    public append(path: PathArrayableType): PathArrayable {
        this.path = this.expandEnd().concat(new PathArrayable(path).expandEnd());
        return this;
    }
    /**
     * Creates a new instance of the `PathArrayable` class based on the current `Path` instance.
     * @returns A new `PathArrayable` instance.
     */
    public new(): PathArrayable {
        return new PathArrayable(this.path);
    }
}