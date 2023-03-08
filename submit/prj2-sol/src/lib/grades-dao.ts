import { CourseInfo as C, GradeTable as G, GradesImpl, COURSES }
  from 'cs544-prj1-sol';

import * as mongo from 'mongodb';

import { okResult, errResult, Result } from 'cs544-js-utils';



export async function makeGradesDao(mongodbUrl: string)
  : Promise<Result<GradesDao>> 
{
  return GradesDao.make(mongodbUrl);
}

export class GradesDao {

  #client: mongo.MongoClient;
  #grades: mongo.Collection;

  private constructor(params: { [key: string]: any }) {
    //TODO
    //debugger
    this.#client = params.client;
    this.#grades = params.grades;
  }

  /** Factory method for constructing a GradesDao.
   */
  static async make(dbUrl: string) : Promise<Result<GradesDao>> {
    const params: { [key: string]: any } = {};
    try {
      //TODO
      params.client = await(new mongo.MongoClient(dbUrl)).connect();
      const db = params.client.db();

      const grades = db.collection(GRADES_COLLECTION);
      params.grades = grades;

      await grades.createIndex('courseId');

      return okResult(new GradesDao(params));
    }
    catch (error) {
      return errResult(error.message, 'DB');
    }
  }

  /** Close this DAO. */
  async close() : Promise<Result<void>> {
    //TODO
    //return null;
    try {
      await this.#client.close();
    } catch (e) {
      return errResult(e.message, 'DB');
    }
  }

  /** Set grades for courseId to rawRows. 
   *  Errors:
   *   BAD_ARG: courseId is not a valid course-id.
   */
  async load(courseId: string, rawTable: G.RawTable)
    : Promise<Result<G.Grades>>
  {
    const courseCheck = checkCourseId(courseId);
    if (!courseCheck.isOk) {
      return errResult(`unknown course id ${courseId}`, 'BAD_ARG');
    }
    const result = await this.#write(courseId, rawTable);

    return result;
    //return null;
  }
  
  async #write(courseId:string, rawTable : G.RawTable): Promise<Result<G.Grades>>{

    try {
      const collection = this.#grades;
      
      const filter = {courseId};
      const update = {$set : {[courseId]: courseId, rawTable}};
      //const update = {$set : {rawTable}};
      const options = {returnDocument: mongo.ReturnDocument.AFTER, upsert : true};

      const updateResult =  await collection.findOneAndUpdate(filter, update, options);
      //this.close()
      if(!updateResult){
        return errResult(`Wrong update`, 'DB');
      } else if (!updateResult.value) {
        return errResult(`No grades found for courseId : ${courseId}`, 'NOT_FOUND');
      } else{
        const grades = {...updateResult.value.rawTable};
        return GradesImpl.makeGradesWithData(courseId, Object.values(grades));
      }
    } catch(e){
      return errResult(e.message, 'DB');
    }
  }

  async #read(courseId : string){
    const courseCheck = checkCourseId(courseId);
    if (!courseCheck.isOk) {
      return errResult(`unknown course id ${courseId}`, 'BAD_ARG');
    }
    try {
      const collection = this.#grades;
      const gradeEntry = await collection.findOne({courseId});
      if (gradeEntry) {
        //console.log(gradeEntry.toJSON())
        const grades = {...gradeEntry};
        delete grades._id;
        //console.log(grades);
        //console.log(GradesImpl.makeGrades(courseId));
        // if (GradesImpl.makeGrades(courseId).isOk) {
        //   return grades.grades;
        // }
        return GradesImpl.makeGrades(courseId);
      } else{
        return errResult(`No grades found for courseId : ${courseId}`, 'NOT_FOUND');
      }
    } catch (e) {
      return errResult(e.message, 'DB');
    }
  }
  /** Return a Grades object for courseId. 
   *  Errors:
   *   BAD_ARG: courseId is not a valid course-id.
   */
  async getGrades(courseId: string): Promise<Result<G.Grades>> {
    const courseCheck = checkCourseId(courseId);
    if (!courseCheck.isOk) {
      return errResult(`unknown course id ${courseId}`, 'BAD_ARG');
    }
    const ab = this.#read(courseId);
    return ab;
   // return null;
  }

  /** Remove all course grades stored by this DAO */
  async clear() : Promise<Result<void>> {
    //TODO
    //return null;
    try {
      await this.#grades.deleteMany({});
      return okResult(undefined);
    }
    catch (e) {
      return errResult(e.message, 'DB');
    }
  }

  /** Upsert (i.e. insert or replace) row to table and return the new
   *  table.
   *
   *  Error Codes:
   *
   *   'BAD_ARG': row specifies an unknown colId or a calc colId or
   *              contains an extra/missing colId not already in table,
   *              or is missing an id column identifying the row.
   *   'RANGE':   A kind='score' column value is out of range
   */
  async upsertRow(courseId: string, row: G.RawRow) : Promise<Result<G.Grades>> {
    return this.upsertRows(courseId, [row]);
  }

  /** Upsert zero-or-more rows.  Basically upsertRow() for
   *  multiple rows.   Will detect errors in multiple rows.
   */
  async upsertRows(courseId: string, rows: G.RawRow[])
    : Promise<Result<G.Grades>> 
  {
    //TODO
    const courseCheck = checkCourseId(courseId);
    if(!courseCheck.isOk){
      return errResult(`unknown course id ${courseId}`, 'BAD_ARG');
    }
    return null;
  }

  /** Add an empty column for colId to table.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info/id colId
   *    for course.
   */
  async addColumn(courseId: string, colId: string) : Promise<Result<G.Grades>> {
    return this.addColumns(courseId, colId);
  }
  
  /** Add empty columns for colId in colIds to table.
   *  Errors:
   *    BAD_ARG: colId is already in table or is not a score/info colId
   *    for course.
   */
  async addColumns(courseId: string, ...colIds: string[])
    : Promise<Result<G.Grades>>
  {
    //TODO
    return null;
  }
  
  /** Apply patches to table, returning the patched table.
   *  Errors:
   *    BAD_ARG: A patch rowId or colId is not in table.
   *    RANGE: Patch data is out-of-range.
   */
  async patch(courseId: string, patches: G.Patches)
    : Promise<Result<G.Grades>> 
  { 
    //TODO
    return null;
  }

  //TODO: add private methods  
  
}

/** Return an error result if courseId is unknown */
function checkCourseId(courseId: string) : Result<void> {
  return (COURSES[courseId])
    ? okResult(undefined)
    : errResult(`unknown course id ${courseId}`);
}

//TODO: add more local functions, constants, etc.

const GRADES_COLLECTION = 'grades';