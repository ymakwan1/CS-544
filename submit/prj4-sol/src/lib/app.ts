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

class WebServices {

  private baseUrl:string
  constructor(baseUrl : string) {
    this.baseUrl = baseUrl;
  }

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
    this.webService = new WebServices(wsUrl);
    this.wsUrl = wsUrl;
    this.courseIdSelect = document.querySelector('#course-id') as HTMLSelectElement;
    this.courseIdSelect.append(...coursesOptions())

    this.studentIdSelect = document.querySelector('#student-id') as HTMLInputElement;
    this.showStatsCheckbox = document.querySelector('#show-stats') as HTMLInputElement;
    this.gradesForm = document.querySelector('#grades-form') as HTMLFormElement;
    this.table = document.querySelector('#grades') as HTMLElement;
    this.errors = document.querySelector('#errors') as HTMLElement;

    this.courseIdSelect.addEventListener('change', this.handlerChange)
    this.showStatsCheckbox.addEventListener('change', this.handlerChange);
    this.studentIdSelect.addEventListener('change', this.handlerChange);
    this.gradesForm.addEventListener('change', (ev:Event) => this.changeHandler(ev));
    
    this.webService.getCourseGrades('cs220').then((response:OkResult<any>|ErrResult)=>{
      if (response.isOk) {
        this.generateTable(response.val.result);
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





