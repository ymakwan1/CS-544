# GradesWs API

This code provides an API implementation for managing course grades. It includes functions for retrieving and updating grades for specific courses using a web service.

## `makeGradesWs(url: string)`

This function is a factory function that creates an instance of the `GradesWs` class. It takes a `url` parameter, which represents the base URL for the web service, and returns a new `GradesWs` object.

## `GradesWs` Class

The `GradesWs` class represents the API for managing course grades. It has the following methods:

### `constructor(url: string)`

The constructor of the `GradesWs` class takes a `url` parameter and initializes the `url` property of the instance.

### `getCourseGrades(courseId: string): Promise<Result<G.Grades>>`

This method retrieves the grades for a specific course identified by the `courseId` parameter. It makes an asynchronous request to the web service using the constructed URL, and returns a `Promise` that resolves to a `Result` object. If the request is successful and returns data, the `Result` object will contain the grades data. If there is an error or no data is returned, the `Result` object will contain an error message.

### `updateCourseGrades(courseId: string, patches: G.Patches): Promise<Result<G.Grades>>`

This method updates the grades for a specific course identified by the `courseId` parameter. It sends a patch request to the web service with the provided `patches` object, which represents the changes to be made to the grades. It returns a `Promise` that resolves to a `Result` object. If the update is successful and returns data, the `Result` object will contain the updated grades data. If there is an error or no data is returned, the `Result` object will contain an error message.

## `doFetchJson<T>(method: string, url: string, jsonBody: object|null=null): Promise<Result<T|null>>`

This function is a utility function used by the `GradesWs` class to perform HTTP requests and handle the responses. It takes the HTTP `method`, `url`, and an optional `jsonBody` parameter, which represents the request payload in JSON format. It returns a `Promise` that resolves to a `Result` object. If the request is successful and the response body is not empty, the `Result` object will contain the parsed JSON data. If the response body is empty, the `Result` object will contain `null`. If there is an error or the response contains errors, the `Result` object will contain an error message.
