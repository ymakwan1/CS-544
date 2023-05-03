import React, { useRef } from 'react';

import { GradesWs } from '../lib/grades-ws.js';

import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import { Result, errResult } from 'cs544-js-utils';

/**
 * The type `GradesTableProps` defines the props for a React component that displays grades for a
 * course.
 * @property {GradesWs} ws - GradesWs is a type that represents the web service used to retrieve grades
 * data.
 * @property {string} courseId - The ID of the course for which the grades are being displayed.
 * @property courseInfo - The `courseInfo` property is of type `C.CourseInfo` and contains information
 * about a course. It could include details such as the course name, course code, instructor name, and
 * other relevant information.
 * @property grades - The `grades` property is an object of type `G.Grades` which contains the grades
 * of students in a course. It likely includes information such as the student's name, their grade for
 * each assignment or exam, and their overall grade in the course.
 * @property setResult - `setResult` is a function that takes a `Result` object of type `G.Grades` as
 * its argument and does not return anything. It is likely used to update the state of the component or
 * parent component with the new grades data.
 */
type GradesTableProps = {
  ws: GradesWs,
  courseId: string,
  courseInfo: C.CourseInfo,
  grades: G.Grades,
  setResult: (result: Result<G.Grades>) => void,
};

/* This is a default export of a function component called `GradesTable`. It takes in a set of props of
type `GradesTableProps` and returns a JSX element representing a table of grades for a particular
course. */
export default function GradesTable(props: GradesTableProps) {
  const { ws, courseId, courseInfo, grades, setResult } = props;
  const dataRows = grades.getFullTable();
  if (dataRows.length === 0) {
    return (
      <table>
        <tbody></tbody>
      </table>
    );
  }
  const hdrs = Object.keys(dataRows[0]);
  const changeGrade = async (rowId : string, colId : string, val : string) => {
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && !/[a-zA-Z]/.test(val)) {
      
      const patches : G.Patches = {
        [rowId] : { [colId] : numVal}
      }

      const getPatchResults = await ws.updateCourseGrades(courseId, patches);
      setResult(getPatchResults);
    } else {
      setResult(errResult(`value ${val} for ${colId} contains a letter`));
    }
  };
  return (
    <table>
      <tbody>
        <Header hdrs={hdrs}/>
        <DataTable data={dataRows} courseInfo={courseInfo} changeGrade={changeGrade} />
      </tbody>
    </table>
  );
}

/* The following sub-components are based on the visual layout of
   a GradesTable:

     + A GradesTable will contain a Header and a DataTable.

     + A Header simply consists of a <tr> row containing <th> entries
       for each header.

     + A DataTable consists of a sequence of DataRow's.

     + A DataRow is a <tr> containing a sequence of <td> entries.
       Each <td> entry contains a GradeInput component or plain data
       depending on whether or not the entry should be editable.

     + A GradeInput will be a <input> widget which displays the current
       data and has change and blur handlers.  The change handler is
       used to reflect the DOM state of the <input> in the react state
       and the blur handler is used to trigger changes in the overall
       Grades component via the changeGrade prop.  
  
  Note that all the following sub-components are set up to return
  an empty fragment as a placeholder to keep TS happy.

*/

/**
 * The type HeaderProps is a TypeScript interface for a React component's props that includes an array
 * of strings called hdrs.
 * @property {string[]} hdrs - The `HeaderProps` type defines a single property `hdrs` which is an
 * array of strings. This type can be used as a prop type for a component that expects an array of
 * strings as a prop.
 */
type HeaderProps = {
  hdrs: string[],
};

/**
 * This is a TypeScript React function that renders a table header row with columns based on an array
 * of header strings passed as props.
 * @param {HeaderProps} props - The parameter `props` is an object that contains the properties passed
 * to the `Header` component. These properties are defined by the `HeaderProps` interface, which
 * specifies the `hdrs` property as an array of strings. The `hdrs` array contains the headers that
 * will be displayed in
 * @returns The `Header` function is returning a table row (`<tr>`) containing table header cells
 * (`<th>`) for each header in the `hdrs` array passed as a prop. The `key` prop is set to the value of
 * each header to help React efficiently update the DOM when the array changes.
 */
function Header(props: HeaderProps) {
  return (
    <tr>
      {props.hdrs.map((hdr) => (
        <th key={hdr}>{hdr}</th>
      ))}
    </tr>
  );
}

/**
 * The DataTableProps type defines the props for a React component that displays grade data for a
 * course and allows for changing grades.
 * @property {G.GradeRow[]} data - An array of objects representing rows of grades. Each object should
 * have properties corresponding to the columns of the table.
 * @property courseInfo - `courseInfo` is a property of type `C.CourseInfo` that contains information
 * about a course. It is likely used to display information about the course in the UI or to provide
 * context for the data being displayed in the table.
 * @property changeGrade - `changeGrade` is a function that takes in three parameters: `rowId` (a
 * string representing the ID of the row being changed), `colId` (a string representing the ID of the
 * column being changed), and `val` (a string representing the new value being assigned to the
 */
type DataTableProps = {
  data: G.GradeRow[],
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

/* The `DataTable` function is a React component that takes in an object of type `DataTableProps` as
its props. It renders a table body containing multiple `DataRow` components, each representing a row
of grade data for a student in a course. The `data` prop is an array of `G.GradeRow` objects, which
contain the grade data for each student. The `courseInfo` prop is an object of type `C.CourseInfo`
that contains information about the course being displayed. The `changeGrade` prop is a function
that takes in three parameters: `rowId`, `colId`, and `val`, and is used to update the grade data
for a specific cell in the table. */
function DataTable(props: DataTableProps) {
  const { data, courseInfo, changeGrade } = props;
  return (
    <>
    {data.map((row, idx) => (
      <DataRow key={idx} dataRow={row} courseInfo={courseInfo} changeGrade={changeGrade}/>
    ))}
    </>
  );
}

/**
 * The DataRowProps type defines the props for a component that displays a row of grade data and allows
 * for changing grades.
 * @property dataRow - This property is an object of type GradeRow from the G module. It likely
 * contains information about a specific row of grades for a student in a course.
 * @property courseInfo - `courseInfo` is an object of type `CourseInfo` which contains information
 * about a course. It is likely used to provide context for the `dataRow` object, which represents a
 * row of grades for a particular student in that course.
 * @property changeGrade - `changeGrade` is a function that takes in three parameters: `rowId` (a
 * string representing the ID of the row), `colId` (a string representing the ID of the column), and
 * `val` (a string representing the new value to be set in the specified cell).
 */
type DataRowProps = {
  dataRow: G.GradeRow,
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

/* The `DataRow` function is a React component that takes in an object of type `DataRowProps` as its
props. It renders a table row (`<tr>`) containing multiple table data cells (`<td>`) based on the
data in the `dataRow` prop. Each cell in the row may contain either a `GradeInput` component or
plain data, depending on whether or not the cell should be editable. The `courseInfo` prop is an
object of type `C.CourseInfo` that contains information about the course being displayed, and the
`changeGrade` prop is a function that takes in three parameters: `rowId`, `colId`, and `val`, and is
used to update the grade data for a specific cell in the table. The `roundVal` function is a helper
function that takes in a number and returns a string representation of that number rounded to one
decimal place. The `Object.entries` method is used to iterate over the properties of the `dataRow`
object and create a new array of cells based on the data in each property. The `isEditable` variable
is used to determine whether or not a cell should be editable based on the ` */
function DataRow(props: DataRowProps) {
  const {dataRow, courseInfo, changeGrade} = props;
  const roundVal = (val : number) => val.toFixed(1);
  const cells = Object.entries(dataRow).map(([colId, val]) =>{
    const isEditable = dataRow[courseInfo.rowIdColId] !== '' && courseInfo.cols[colId]?.kind === 'score';
    return (
      <td key={colId}>
        {
          isEditable ? (
            <GradeInput 
              rowId={dataRow[courseInfo.rowIdColId].toString()}
              colId={colId} 
              val={val.toString()} 
              changeGrade={changeGrade}
            />
          ) : typeof val === 'number' ? (
            roundVal(val)
          ) : (typeof val === 'object' ? JSON.stringify(val) : val)
        }
      </td>
    );
  });
  return <tr>{cells}</tr>;
}

/**
 * The GradeInputProps type defines the props for a component that allows for changing a grade value.
 * @property {string} rowId - A string representing the unique identifier of a row in a table or grid.
 * @property {string} colId - The `colId` property is a string that represents the identifier of a
 * column in a table or grid. It is used in conjunction with the `rowId` property to uniquely identify
 * a cell in the table or grid.
 * @property {string} val - The current value of the grade input field.
 * @property changeGrade - `changeGrade` is a function that takes in three parameters: `rowId`,
 * `colId`, and `val`. It is used to update the grade value of a specific cell in a table. The `rowId`
 * and `colId` parameters are used to identify the cell that needs
 */
type GradeInputProps = {
  rowId: string,
  colId: string,
  val: string,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

/**
 * This is a TypeScript React component that renders an input field for a grade, with the ability to
 * change and save the grade value.
 * @param {GradeInputProps} props - an object containing the following properties:
 */
function GradeInput(props: GradeInputProps) {
  const { rowId, colId, val, changeGrade } = props;
  const [value , setValue] = React.useState(val);

  const num = useRef(val);
  
  const handleChange = ( e : React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setValue(e.target.value);
  };

  const handleBlur = async () => {
    if (num.current !== value) {
      num.current = value;
      await changeGrade(rowId, colId, value);
    }
  }
  return (
    <input type = "text" size={3} value={value} onChange={handleChange} onBlur={handleBlur}></input>
  );
}