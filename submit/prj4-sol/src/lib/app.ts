import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import { Err, Result, okResult, errResult, ErrResult } from 'cs544-js-utils';

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

  private courseIdSelect: HTMLSelectElement;
  private studentIdSelect : HTMLInputElement;
  private showStatsCheckbox : HTMLInputElement;
  private gradesForm : HTMLFormElement; 
  private webService : WebServices
  constructor(wsUrl: string) {
    //TODO
    //cache form HTMLElements as instance vars, set up handlers, web services

    this.webService = new WebServices(wsUrl);

    this.courseIdSelect = document.querySelector('#course-id') as HTMLSelectElement;
    this.courseIdSelect.append(...coursesOptions())

    

    this.gradesForm = document.querySelector('#grades-form') as HTMLFormElement;
    this.gradesForm.addEventListener('submit', (ev: Event) => {
      ev.preventDefault(); 
    });
    

    const changeHandler = (ev: Event) => {
      //ev.preventDefault()
      console.log(ev);
    };
    this.studentIdSelect = document.querySelector('#student-id') as HTMLInputElement;
    this.showStatsCheckbox = document.querySelector('#show-stats') as HTMLInputElement;
    this.courseIdSelect.addEventListener('change', this.handlerChange)
    this.courseIdSelect.addEventListener('change', this.handlerChange);
    this.studentIdSelect.addEventListener('change', this.handlerChange);

    this.gradesForm.addEventListener('change', changeHandler);

  }
  //TODO: add methods/data as necessary.
  async initialize(){
    const r = await this.webService.getCourseGrades('cs220');
    console.log(r);
  }

  handlerChange(){
    const changeHandler = (ev: Event) => {
      console.log(ev);
    };
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





