# GradesDao

The `GradesDao` class is responsible for handling database operations related to course grades. It provides methods for loading, retrieving, updating, and manipulating grades data in a MongoDB collection.

## GradesDao Class

### `makeGradesDao(mongodbUrl: string): Promise<Result<GradesDao>>`
A factory function that creates a new instance of the `GradesDao` class by connecting to the MongoDB database specified by the `mongodbUrl`. It returns a promise that resolves to a `Result` object indicating whether the creation was successful or not.

### `constructor(params: { [key: string]: any })`
The private constructor of the `GradesDao` class. It initializes the `mongo.MongoClient` and `mongo.Collection` objects used for database operations.

### `static async make(dbUrl: string): Promise<Result<GradesDao>>`
A static factory method for constructing a `GradesDao` instance. It connects to the MongoDB database specified by the `dbUrl`, creates a collection, and returns a `Result` object indicating the success or failure of the creation.

### `async close(): Promise<Result<void>>`
Closes the database connection. It returns a promise that resolves to a `Result` object indicating whether the closing was successful or not.

### `async load(courseId: string, rawTable: G.RawTable): Promise<Result<G.Grades>>`
Sets the grades for the specified `courseId` using the `rawTable` data. It returns a promise that resolves to a `Result` object containing the updated grades or an error if the operation failed.

### `async #write(courseId: string, rawTable: G.RawTable): Promise<Result<G.Grades>>`
Private method that updates the grades collection with the new `rawTable` data. It returns a promise that resolves to a `Result` object containing the updated grades or an error if the operation failed.

### `async #read(courseId: string)`
Private method that reads the grades for a course from the database. It returns a promise that resolves to a `Result` object containing the grades or an error if the operation failed.

### `async getGrades(courseId: string): Promise<Result<G.Grades>>`
Returns a `Result` object containing the grades for the specified `courseId` or an error if the operation failed.

### `async clear(): Promise<Result<void>>`
Removes all course grades stored in the database. It returns a promise that resolves to a `Result` object indicating whether the operation was successful or not.

### `async upsertRow(courseId: string, row: G.RawRow): Promise<Result<G.Grades>>`
Upserts (inserts or replaces) a single row in the grades table and returns the updated grades or an error if the operation failed.

### `async upsertRows(courseId: string, rows: G.RawRow[]): Promise<Result<G.Grades>>`
Upserts multiple rows in the grades table and returns the updated grades or an error if the operation failed.

### `async addColumn(courseId: string, colId: string): Promise<Result<G.Grades>>`
Adds an empty column with the specified `colId` to the grades table and returns the updated grades or an error if the operation failed.

### `async addColumns(courseId: string, ...colIds: string[]): Promise<Result<G.Grades>>`
Adds empty columns with the specified `colIds` to the grades table and returns the updated grades or an error if the operation failed.

### `async patch(courseId: string, patches: G.Patches): Promise<Result<G.Grades>>`
Applies patches to the grades table and returns the patched grades or an error if the operation failed.

### `checkCourseId(courseId: string): Result<void>`
A helper function that checks if the provided `courseId` is valid.

