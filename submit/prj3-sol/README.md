# Grades API Server

This is an Express.js server implementation of a Grades API. It provides endpoints for managing grades for different courses.

## Endpoints

The server provides the following endpoints:

### GET /grades/:courseId

This endpoint retrieves the grades for a specific course.

#### Parameters

- `courseId` (required): The ID of the course.

#### Query Parameters

- `full` (optional): If set to `"true"`, the response will include the full table of grades. Otherwise, it will include the raw table of grades.

### GET /grades/:courseId/:rowId

This endpoint retrieves a specific row from the grades table for a course.

#### Parameters

- `courseId` (required): The ID of the course.
- `rowId` (required): The ID of the row.

#### Query Parameters

- `full` (optional): If set to `"true"`, the response will include the full table row. Otherwise, it will include the raw table row.

### POST /grades/:courseId

This endpoint loads grades for a course.

#### Parameters

- `courseId` (required): The ID of the course.

#### Query Parameters

- `full` (optional): If set to `"true"`, the response will include the full table of grades. Otherwise, it will include the raw table of grades.

#### Request Body

The request body should contain the data to be loaded for the course grades.

### PATCH /grades/:courseId

This endpoint updates grades for a course.

#### Parameters

- `courseId` (required): The ID of the course.

#### Query Parameters

- `full` (optional): If set to `"true"`, the response will include the full table of grades. Otherwise, it will include the raw table of grades.

#### Request Body

The request body should contain the patches to be applied to the course grades.

## Error Handling

The server handles errors by returning appropriate HTTP error envelopes. If an error occurs, the server will respond with a JSON object containing the error message and the corresponding HTTP status code.
