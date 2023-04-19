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

  async getCourseGrades(courseId:string){
    try {
      const response = await fetch(`${this.baseUrl}/grades/${courseId}`)
      if(response.ok){
        const data  =  await response.json();
        console.log(data);
        if (!data.ok) {
          return errResult(data);
        } else {
          const d = GradesImpl.makeGradesWithData(courseId, data.result);
          console.log(d);
          return okResult(data);
        }
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
  constructor(wsUrl: string) {
    //TODO
    //cache form HTMLElements as instance vars, set up handlers, web services

    //this.webService = new WebServices(wsUrl);

    this.wsUrl = wsUrl;

    this.courseIdSelect = document.querySelector('#course-id') as HTMLSelectElement;
    this.courseIdSelect.append(...coursesOptions())

    this.studentIdSelect = document.querySelector('#student-id') as HTMLInputElement;
    this.showStatsCheckbox = document.querySelector('#show-stats') as HTMLInputElement;
    this.gradesForm = document.querySelector('#grades-form') as HTMLFormElement;
    this.table = document.querySelector('#grades') as HTMLElement;

    this.courseIdSelect.addEventListener('change', this.handlerChange)
    this.showStatsCheckbox.addEventListener('change', this.handlerChange);
    this.studentIdSelect.addEventListener('change', this.handlerChange);
    //this.gradesForm.addEventListener('submit', this.changeHandler);
    this.gradesForm.addEventListener('change', (ev:Event) => this.changeHandler(ev));
    
    const r = this.getCourseGrades('cs220').then((response:OkResult<any>|ErrResult)=>{
      if (response.isOk) {
        console.log(response);
        this.generateTable(response.val.result);
      }
      
    });
    // console.log("From const" + );
    // changeHandler(ev:Event) {
    //   ev.preventDefault()
    //   this.initialize();
    //   console.log(getFormData(this.gradesForm.form))
    //   console.log(ev);
    // };
    

    //this.gradesForm.addEventListener('change', changeHandler);

  }
  removeAllChildNodes(parent:HTMLElement) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
  }
}

  async getCourseGrades(courseId:string, rowId?:string, full?:string){
    try {
      let url = `${this.wsUrl}/grades/${courseId}`;
      if (rowId && rowId !== '' ) {
      url += `/${rowId}`;
      }
      if (full) {
      url += '?full=true';
      }
      const response = await fetch(url)
      if(response.ok){
        const data  =  await response.json();
        //console.log(data);
        if (!data.isOk) {
          return errResult(data);
        } else {
          const d = GradesImpl.makeGradesWithData(courseId, data.result);
          //console.log(d);
          return okResult(data);
        }
      } else {
        const data = await response.json();
        console.log(data);
      }
    } catch (error) {
      return errResult;
    }
  }



  changeHandler = async(ev:Event) =>{
    ev.preventDefault()
    // const r = await this.getCourseGrades('cs220');
    // // if (r.) {
      
    // // }
    // console.log(r);
    const formData = getFormData(this.gradesForm);
    const afterChangeData : any = await this.getCourseGrades(formData.courseId, formData.rowId, formData.full);
    if (afterChangeData.isOk) {
      this.generateTable(afterChangeData.val.result)
    }
    console.log(afterChangeData);
    // console.log(formData);
    // console.log(ev);
  };
  //TODO: add methods/data as necessary.

  handlerChange(ev : Event){
    console.log(ev)
  }

  generateTable(data:any){
    console.log(data)
    this.removeAllChildNodes(this.table)
    const headerRow = makeElement("tr");
    const headers = Object.keys(data[0])
// Create table header columns
    for (const header of headers) {
      const th = makeElement("th", {}, header);
      headerRow.append(th);
    }

// Append header row to the table
    this.table.append(headerRow);

// Create table data rows
  for (const row of data) {
    console.log(row);
    const tr = makeElement("tr");
    for (const header of headers) {
      console.log(row[header]);
      let val = row[header];
      if (typeof val === 'number') {
        val = val.toFixed(1);
      }
      const td = makeElement("td", {}, val.toString());
      tr.append(td);
    }
    this.table.append(tr);
  }

// Append the table to the DOM
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





