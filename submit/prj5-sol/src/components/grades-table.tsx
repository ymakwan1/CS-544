// import React from 'react';

// import { GradesWs } from '../lib/grades-ws.js';

// import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
//   from 'cs544-prj1-sol';

// import { Result, errResult } from 'cs544-js-utils';

// type GradesTableProps = {
//   ws: GradesWs,
//   courseId: string,
//   courseInfo: C.CourseInfo,
//   grades: G.Grades,
//   setResult: (result: Result<G.Grades>) => void,
// };

// export default function GradesTable(props: GradesTableProps) {
//   const { ws, courseId, courseInfo, grades, setResult } = props;
//   const dataRows = props.grades.getFullTable();
//   if (!dataRows.length) {
//     return (
//       <table>
//         <tbody></tbody>
//       </table>
//     )
//   }
//   const hdrs = Object.keys(dataRows[0]);
//   const changeGrade = async (rowId: string, colId: string, val: string) => {
//     const numVal = parseFloat(val);
//     if (!isNaN(numVal) || val === '') {
//       const patches:G.Patches = { [rowId]: { [colId]: val } };
//     const result = await ws.updateCourseGrades(courseId, patches);
//     //console.log(result);
//     if(result.isOk){
//       setResult(result);
//     } else {
//       console.log(result.errors);
//       return errResult(result.errors);
//     }
//     }
//   };
//   return (
//     <table>
//       <tbody>
//         <Header hdrs = {hdrs}/>
//         <DataTable data={dataRows} courseInfo={courseInfo} changeGrade={changeGrade}/>
//       </tbody>
//     </table>
//   );
// }

// /* The following sub-components are based on the visual layout of
//    a GradesTable:

//      + A GradesTable will contain a Header and a DataTable.

//      + A Header simply consists of a <tr> row containing <th> entries
//        for each header.

//      + A DataTable consists of a sequence of DataRow's.

//      + A DataRow is a <tr> containing a sequence of <td> entries.
//        Each <td> entry contains a GradeInput component or plain data
//        depending on whether or not the entry should be editable.

//      + A GradeInput will be a <input> widget which displays the current
//        data and has change and blur handlers.  The change handler is
//        used to reflect the DOM state of the <input> in the react state
//        and the blur handler is used to trigger changes in the overall
//        Grades component via the changeGrade prop.  
  
//   Note that all the following sub-components are set up to return
//   an empty fragment as a placeholder to keep TS happy.

// */

// type HeaderProps = {
//   hdrs: string[],
// };

// function Header(props: HeaderProps) {
//   return (
//     <tr>
//       {
//         props.hdrs.map(hdr =>
//           <th key={hdr}>{hdr}</th>
//         )
//       }
//     </tr>
//   );
// }

// type DataTableProps = {
//   data: G.GradeRow[],
//   courseInfo: C.CourseInfo,
//   changeGrade: (rowId: string, colId: string, val: string) => void,
// };

// function DataTable(props: DataTableProps) {
//   const { data, courseInfo, changeGrade } = props;
//   return <>
//     {data.map((row, id) =>
//       <DataRow key={id} dataRow={row} courseInfo={courseInfo} changeGrade={changeGrade}/>
//     )}
//   </>;
// }

// type DataRowProps = {
//   dataRow: G.GradeRow,
//   courseInfo: C.CourseInfo,
//   changeGrade: (rowId: string, colId: string, val: string) => void,
// };

// // function DataRow(props: DataRowProps) {
// //   const {dataRow, courseInfo, changeGrade} = props;
// //   const roundVal = (val: number) => val.toFixed(1);
// //   const cells = Object.entries(dataRow).map(([colId, val]) => (
// //     <td key={colId}>{String(courseInfo.id === 'cs544' && typeof val === 'number' ? roundVal(Number(val)) : val)}</td>
// //   ));
// //   return <tr>{cells}</tr>;
// // }
// function DataRow(props: DataRowProps) {
//   const { dataRow, courseInfo, changeGrade } = props;
//   const roundVal = (val: number) => val.toFixed(1);
//   const cells = Object.entries(dataRow).map(([colId, val]) => {
//     const isEditable = dataRow[courseInfo.rowIdColId] !== '' && courseInfo.cols[colId]?.kind === 'score';
//       return (
//         <td key={colId}>
//           {isEditable ? (
//             <GradeInput
//               rowId={dataRow[courseInfo.rowIdColId].toString()}
//               colId={colId}
//               val={String(val)}
//               changeGrade={changeGrade}
//             />
//           ) : typeof val === "number" ? (
//             roundVal(val)
//           ) : (typeof val === 'object' ? JSON.stringify(val) : val)
//           }
//         </td>
//       );
//   });
//   return <tr>{cells}</tr>;
// }


// type GradeInputProps = {
//   rowId: string,
//   colId: string,
//   val: string,
//   changeGrade: (rowId: string, colId: string, val: string) => void,
// };

// function GradeInput(props: GradeInputProps) {
//   const { rowId, colId, val, changeGrade } = props;
//   const [value, setValue] = React.useState(val);

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setValue(event.target.value);
//   };
//   const handleBlur = () => {
//     if (value !== val) {
//       changeGrade(rowId, colId, value);
//     }
//   };
//   return (
//     <input
//       type="text"
//       size={3}
//       value={props.val}
//       onChange={handleChange}
//       onBlur={handleBlur}
//     />
//   );
// }

import React from 'react';

import { GradesWs } from '../lib/grades-ws.js';

import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import { Result, errResult } from 'cs544-js-utils';

type GradesTableProps = {
  ws: GradesWs,
  courseId: string,
  courseInfo: C.CourseInfo,
  grades: G.Grades,
  setResult: (result: Result<G.Grades>) => void,
};

export default function GradesTable(props: GradesTableProps) {
  const { ws, courseId, courseInfo, grades, setResult } = props;
  const dataRows = grades.getFullTable();
  //const dataRows : any = [];
 // console.log(dataRows);
  if (!dataRows.length) {
    return (
      <table>
        <tbody></tbody>
      </table>
    );
  }
  //console.log(props.courseId);
  const hdrs = Object.keys(dataRows[0]);
  const changeGrade = async (rowId: string, colId: string, val: string) => {
    const numVal = parseFloat(val);
    if (!isNaN(numVal) || val === '') {
      const patches:G.Patches = { [rowId]: { [colId]: numVal } };
    const result = await ws.updateCourseGrades(courseId, patches);
    console.log(result);
    if(result.isOk){
      setResult(result);
    } else {
      console.log(result.errors);
      return setResult(result);
    }
    }
  };
  return (
    <table>
      <tbody>
        <Header hdrs={hdrs} />
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

type HeaderProps = {
  hdrs: string[],
};

function Header(props: HeaderProps) {
  //console.log(props.hdrs);
  return (
    <tr>
      {props.hdrs.map((hdr) => (
        <th key={hdr}>{hdr}</th>
      ))}
    </tr>
  );
}

type DataTableProps = {
  data: G.GradeRow[],
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function DataTable(props: DataTableProps) {
  const { data, courseInfo, changeGrade } = props;
  return(
    <>
      {data.map((row, idx) => (
        <DataRow key={idx} dataRow={row} courseInfo={courseInfo} changeGrade={changeGrade} />
      ))}
    </>
  );
}

type DataRowProps = {
  dataRow: G.GradeRow,
  courseInfo: C.CourseInfo,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

function DataRow(props: DataRowProps) {
  const {dataRow, courseInfo, changeGrade} = props;
  return(
    <tr>
      {Object.entries(dataRow).map(([colId, val]) => {
        //console.log(courseInfo.cols[colId]?.kind === 'score');
        if (courseInfo.id === 'cs544' && typeof val === 'number') {
          val = val.toFixed(1);
        }
        if (props.courseInfo.cols[colId]?.kind === 'score' && dataRow[courseInfo.rowIdColId] !== '') {
          return (
            <td key={colId}>
            {/* <GradeInput rowId={dataRow[courseInfo.rowIdColId]} colId={colId} val={val} changeGrade={changeGrade} /> */}
            <GradeInput rowId={dataRow[courseInfo.rowIdColId].toString()} colId={colId} val={String(val)} changeGrade={changeGrade} />
            </td>
            );
        } else {
        return (
          <td key={colId}>
            {typeof val === 'object' ? JSON.stringify(val) : val}
          </td>
        );}
      })}
    </tr>
  );
}


type GradeInputProps = {
  rowId: string,
  colId: string,
  val: string,
  changeGrade: (rowId: string, colId: string, val: string) => void,
};

// function GradeInput(props: GradeInputProps) {
//   const { rowId, colId, val, changeGrade } = props;
//   return <></>;
// }
// function GradeInput(props: GradeInputProps) {
//   const { rowId, colId, val, changeGrade } = props;
//   const [value, setValue] = React.useState(val);
//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setValue(event.target.value);
//   };
//   const handleBlur = async () => {
//     if (value !== val) {
//       await changeGrade(rowId, colId, value);
//     }
//   };
//   return (
//     <input type="text" value={value} onChange={handleChange} onBlur={handleBlur} />
//   );
// }
function GradeInput(props: GradeInputProps) {
  const { rowId, colId, val, changeGrade } = props;
  const [value, setValue] = React.useState(val);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    //changeGrade(rowId, colId, value);
  };

  const handleBlur = () => {
    if (value !== val) {
      changeGrade(rowId, colId, value);
    }
  };

  return (
    <input
      type="text"
      size={3}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}

// function GradeInput(props: GradeInputProps) {
//   const { rowId, colId, val, changeGrade } = props;
//   const [value, setValue] = React.useState(val);
  
//   const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
//     // ignore any input typed into the input widget
//     event.preventDefault();
//   }

//   const handleBlur = async () => {
//     if (val !== value) {
//       await changeGrade(rowId, colId, value);
//     }
//   };

//   return (
//     <input
//       type="text"
//       value={value}
//       size={3}
//       onChange={(event) => setValue(event.target.value)}
//       onBlur={handleBlur}
//       onInput={handleInput}
//     />
//   );
// }