import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import { Err, Result, okResult, errResult, ErrResult, OkResult } from 'cs544-js-utils';
import { Grades } from 'cs544-prj1-sol/dist/lib/grade-table';

/** factory function to create an App and take care of any
 *  asynchronous initialization.
 */
export default async function makeApp(url: string) {
  const app = new App(url);
  // TODO: add any async initialization

}

/* The `WebServices` class is a class that defines a private property `baseUrl` and an
asynchronous function `getCourseGrades` for retrieving course grades data from a specified URL. */
class WebServices {

  /* This code defines a private property `baseUrl` of type string in the `WebServices` class and
  initializes it with the value passed as an argument to the constructor. The constructor takes a
  string parameter `baseUrl` and assigns it to the `baseUrl` property of the class instance using
  the `this` keyword. This property is used to store the base URL of the web service that the
  `WebServices` class will interact with. */
  private baseUrl:string
  constructor(baseUrl : string) {
    this.baseUrl = baseUrl;
  }

  /**
   * This is an asynchronous function that retrieves course grades data from a specified URL and
   * returns either an error or a result object.
   * @param {string} courseId - A string representing the ID of the course for which the grades are
   * being retrieved.
   * @param {string} [rowId] - The rowId parameter is an optional string parameter that represents the
   * ID of a specific row in the grades table for a particular course. If provided, the function will
   * retrieve the grades for that specific row only. If not provided, the function will retrieve the
   * grades for all rows in the grades table for the
   * @param {string} [full] - The "full" parameter is an optional parameter that can be passed to the
   * function. If it is set to "true", it will include all the details of the grades for the specified
   * course and row. If it is not set or set to any other value, it will only include basic information
   * about
   * @returns a Promise that resolves to either an error result or a success result containing the
   * grades data for a given course. The error result is returned if there is an issue with the request
   * or if the data returned from the server is not in the expected format. The success result contains
   * the grades data for the course, which is parsed from the JSON response returned by the server.
   */
  async getCourseGrades(courseId:string, rowId?:string, full?:string){
    try {
      let url = `${this.baseUrl}/grades/${courseId}`;
      if (rowId && rowId !== '' ) {
      url += `/${rowId}`;
      }
      if (full) {
      url += '?full=true';
      }
      const response = await fetch(url)
      if(response.ok){
        const data  =  await response.json();
        if (!data.isOk) {
          return errResult(data);
        } else {
          const d = GradesImpl.makeGradesWithData(courseId, data.result);
          return okResult(data);
        }
      } else {
        const data = await response.json();
        return (data);
      }
    } catch (error) {
      return errResult;
    }
  }
}

/* The `App` class is a class that initializes properties and event listeners, makes API
calls to retrieve data from a web service, and generates a table of grades for a specific course
based on user input. */
class App {
  private wsUrl : string;
  private courseIdSelect: HTMLSelectElement;
  private studentIdSelect : HTMLInputElement;
  private showStatsCheckbox : HTMLInputElement;
  private gradesForm : HTMLFormElement; 
  private webService : WebServices
  private table : HTMLElement
  private errors : HTMLElement
  /**
   * This is a constructor function that initializes various properties and event listeners, and makes
   * an API call to generate a table of grades for a specific course.
   * @param {string} wsUrl - The `wsUrl` parameter is a string that represents the URL of a web
   * service. It is used to create a new instance of the `WebServices` class.
   */
  constructor(wsUrl: string) {
    /* These lines of code are initializing properties of the `App` class. */
    this.webService = new WebServices(wsUrl);
    this.wsUrl = wsUrl;
    this.courseIdSelect = document.querySelector('#course-id') as HTMLSelectElement;
    this.courseIdSelect.append(...coursesOptions())

    /* These lines of code are selecting specific HTML elements from the DOM using their IDs and
    assigning them to properties of the `App` class. */
    this.studentIdSelect = document.querySelector('#student-id') as HTMLInputElement;
    this.showStatsCheckbox = document.querySelector('#show-stats') as HTMLInputElement;
    this.gradesForm = document.querySelector('#grades-form') as HTMLFormElement;
    this.table = document.querySelector('#grades') as HTMLElement;
    this.errors = document.querySelector('#errors') as HTMLElement;

    /* These lines of code are adding event listeners to various HTML elements in the DOM. When the
    user interacts with these elements (e.g. changes the selected option in the `courseIdSelect`
    dropdown), the corresponding event (e.g. `change`) is triggered, and the event listener function
    (`handlerChange` or `changeHandler`) is executed. These event listener functions are responsible
    for updating the UI based on the user's input and making API calls to retrieve data from the web
    service. */
    this.courseIdSelect.addEventListener('change', this.handlerChange)
    this.showStatsCheckbox.addEventListener('change', this.handlerChange);
    this.studentIdSelect.addEventListener('change', this.handlerChange);
    this.gradesForm.addEventListener('change', (ev:Event) => this.changeHandler(ev));
    
    /* This code is making an API call to the `getCourseGrades` method of the `WebServices` class with
    the argument `'cs220'`. It then waits for the response using the `then` method, which takes a
    callback function that is executed when the response is received. If the response is successful
    (`isOk` property is true), it calls the `generateTable` method of the `App` class with the
    `result` property of the response. If the response is not successful, it calls the
    `generateErrors` method of the `App` class with the error message from the first error in the
    `errors` property of the response. */
    this.webService.getCourseGrades('cs220').then((response:OkResult<any>|ErrResult)=>{
      if (response.isOk) {
        this.generateTable(response.val.result);
      } else {
        this.generateErrors(response.errors[0].message)
      }
    });
  }

  removeAllChildNodes(parent:HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
  }

  // async getCourseGrades(courseId:string, rowId?:string, full?:string){
  //   try {
  //     let url = `${this.wsUrl}/grades/${courseId}`;
  //     if (rowId && rowId !== '' ) {
  //     url += `/${rowId}`;
  //     }
  //     if (full) {
  //     url += '?full=true';
  //     }
  //     const response = await fetch(url)
  //     if(response.ok){
  //       const data  =  await response.json();
  //       if (!data.isOk) {
  //         return errResult(data);
  //       } else {
  //         const d = GradesImpl.makeGradesWithData(courseId, data.result);
  //         return okResult(data);
  //       }
  //     } else {
  //       const data = await response.json();
  //       return (data);
  //     }
  //   } catch (error) {
  //     return errResult;
  //   }
  // }



  changeHandler = async(ev:Event) =>{
    ev.preventDefault()
    this.removeAllChildNodes(this.table);
    this.removeAllChildNodes(this.errors);
    const formData = getFormData(this.gradesForm);
    const afterChangeData : any = await this.webService.getCourseGrades(formData.courseId, formData.rowId, formData.full);
    if (afterChangeData.isOk) {
      this.generateTable(afterChangeData.val.result)
    } else {
      this.generateErrors(afterChangeData.errors[0].message)
    }
  };
  //TODO: add methods/data as necessary.

  handlerChange(ev : Event){
    // this.removeAllChildNodes(this.table);
    // this.removeAllChildNodes(this.errors);
  }

  generateErrors(data:any){
    // this.removeAllChildNodes(this.table);
    // this.removeAllChildNodes(this.errors);
   //for (const error of data) {
      const li = makeElement("li", {}, data); // create a new li element with the error text
      this.errors.append(li); // append the li element to the ul element
    //}
  }

  generateTable(data:any){
    // this.removeAllChildNodes(this.errors);
    // this.removeAllChildNodes(this.table)
    const headerRow = makeElement("tr");
    const headers = Object.keys(data[0])

    for (const header of headers) {
      const th = makeElement("th", {}, header);
      headerRow.append(th);
    }
    this.table.append(headerRow);
    for (const row of data) {
      const tr = makeElement("tr");
      for (const header of headers) {
        let val = row[header];
        if (typeof val === 'number') {
          if (Number.isInteger(val)) {
            val = val;
          } else {
            val = Math.round(val * 10.0) / 10.0;
          }
        }
        const td = makeElement("td", {}, val.toString());
        tr.append(td);
      }
      this.table.append(tr);
  }
  document.body.appendChild(this.table);
  }
}

// TODO: add auxiliary functions / classes.

/** Return list of <option> elements for each course in COURSES with the
 *  value attribute of each element set to the courseId and the
 *  text set to the course name.
 */ 
function coursesOptions() {
  return Object.entries(COURSES).map(([courseId, courseInfo]) => {
    const descr = `${courseId}: ${courseInfo.name}`;
    return makeElement('option', {value: courseId}, descr);
  });
}

/** return object mapping widget names from form to their values */
function getFormData(form: HTMLFormElement) : { [name: string]: string } {
  const data = [... (new FormData(form).entries()) ]
      .map(([k, v]: [string, string]) => [k, v]);
  return Object.fromEntries(data);
}

/** Return a new DOM element with specified tagName, attributes
 *  given by object attrs and contained text.
 */
function makeElement(tagName: string, attrs: {[attr: string]: string} = {},
		     text='')
  : HTMLElement
{
  const element = document.createElement(tagName);
  for (const [k, v] of Object.entries(attrs)) {
    element.setAttribute(k, v);
  }
  if (text.length > 0) element.append(text);
  return element;
}





