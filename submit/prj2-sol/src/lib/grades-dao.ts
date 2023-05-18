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
    this.#client = params.client;
    this.#grades = params.grades;
  }

  /** Factory method for constructing a GradesDao.
   */
  static async make(dbUrl: string) : Promise<Result<GradesDao>> {
    const params: { [key: string]: any } = {};
    try {
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
    try {
      await this.#client.close();
      return okResult(undefined);
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
  }
  
  /**
   * This is updating the grades collection with the new rawTable
   * @param {string} courseId - The courseId of the course that the grades are being updated for.
   * @param rawTable - This is the raw table that is being passed in.
   * @returns The grades are being returned.
   */
  async #write(courseId:string, rawTable : G.RawTable): Promise<Result<G.Grades>>{

/* This is updating the grades collection with the new rawTable. */
    try {
      const collection = this.#grades;
      
      const filter = {courseId};
      //const update = {$set : {[courseId]: courseId, rawTable}};
      const update = {$set : {rawTable}};
      const options = {returnDocument: mongo.ReturnDocument.AFTER, upsert : true};

      const updateResult =  await collection.findOneAndUpdate(filter, update, options);
      
      /* This is checking if the update was successful or not. If the update was successful, it will
      return the grades. If the update was not successful, it will return an error. */
      if(!updateResult){
        return errResult(`Wrong update for courseId : ${courseId}`, 'DB');
      } 
      else if (!updateResult.value) {
        return errResult(`No grades found for courseId : ${courseId}`, 'NOT_FOUND');
      } 
      else{
      /* This is taking the rawTable from the updateResult and returning the grades. */
        const grades = {...updateResult.value.rawTable};
        return GradesImpl.makeGradesWithData(courseId, Object.values(grades));
      }
    } catch(e){
      return errResult(e.message, 'DB');
    }
  }

  /**
   * It reads the grades for a course from the database
   * @param {string} courseId - string
   * @returns A promise that resolves to a result object.
   */
  async #read(courseId : string){
    /* This is checking if the courseId is valid or not. If the courseId is not valid, it will return
    an error. */
    const courseCheck = checkCourseId(courseId);
    if (!courseCheck.isOk) {
      return errResult(`unknown courseId ${courseId}`, 'BAD_ARG');
    }
    /* This is reading the grades for a course from the database. */
    try {
      const collection = this.#grades;
      const gradeEntry = await collection.findOne({courseId});
      if (gradeEntry) {
        const grades = {...gradeEntry};
        delete grades._id;
        return GradesImpl.makeGradesWithData(courseId, grades.rawTable);
      } else{
        return GradesImpl.makeGrades(courseId);
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
    /* This is checking if the courseId is valid or not. If the courseId is not valid, it will return
        an error. */
    const courseCheck = checkCourseId(courseId);
    if (!courseCheck.isOk) {
      return errResult(`unknown courseId ${courseId}`, 'BAD_ARG');
    }
/* This is reading the grades for a course from the database. */
    const getGradesRead = this.#read(courseId);
    return getGradesRead;
  }

  /** Remove all course grades stored by this DAO */
  async clear() : Promise<Result<void>> {
    /* This is deleting all the grades from the database. */
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
    /* This is checking if the courseId is valid or not. If the courseId is not valid, it will return an error. */
    const courseCheck = checkCourseId(courseId);
    if(!courseCheck.isOk){
      return errResult(`unknown course id ${courseId}`, 'BAD_ARG');
    }

    /* This is reading the grades for a course from the database. */
    const upsertRowsReadResults = await this.getGrades(courseId);

    /* This is checking if the upsertRowsReadResults is ok or not. If the upsertRowsReadResults is ok,
    it will upsert the rows to the grades. If the upsertRowsResults is ok, it will write the grades to the
    database. */
    if (upsertRowsReadResults.isOk) {
      let readData = [...upsertRowsReadResults.val.getRawTable(), ...rows];
      const upsertRowsResults = upsertRowsReadResults.val.upsertRows(readData);
      if (upsertRowsResults.isOk) {
        await this.#write(courseId, upsertRowsResults.val.getRawTable());
        return okResult(upsertRowsResults.val);
      } else {
        return upsertRowsResults;
      }
    } else {
      return upsertRowsReadResults;
    }
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
    /* This is checking if the courseId is valid or not. If the courseId is not valid, it will return an error. */
    const courseCheck = checkCourseId(courseId);
    if(!courseCheck.isOk){
      return errResult(`unknown courseId '${courseId}'`, 'BAD_ARG');
    }

    /* This is reading the grades for a course from the database. */
    const addColumnsReadResults = await this.getGrades(courseId);

    /* This is checking if the addColumnsReadResults is ok or not. If the addColumnsReadResults is ok,
    it will add the columns to the grades. If the addColumnsResults is ok, it will write the grades
    to the database. */
    if(addColumnsReadResults.isOk){
      const addColumnsResults = addColumnsReadResults.val.addColumns(...colIds);

      if (addColumnsResults.isOk) {
        await this.#write(courseId, addColumnsResults.val.getRawTable())
        return okResult(addColumnsResults.val);
      } else {
        return addColumnsResults;
      }

    } else{
      return addColumnsReadResults;
    }
  }
  
  /** Apply patches to table, returning the patched table.
   *  Errors:
   *    BAD_ARG: A patch rowId or colId is not in table.
   *    RANGE: Patch data is out-of-range.
   */
  async patch(courseId: string, patches: G.Patches)
    : Promise<Result<G.Grades>> 
  { 
    /* This is checking if the courseId is valid or not. If the courseId is not valid, it will return an error. */
    const courseCheck = checkCourseId(courseId);
    if(!courseCheck.isOk){
      return errResult(`unknown course id ${courseId}`, 'BAD_ARG');
    }

    /* This is reading the grades for a course from the database. */
    const patchReadDataResults = await this.getGrades(courseId);

    /* This is checking if the patchReadDataResults is ok or not. If the patchReadDataResults is ok, it
    will patch the grades. If the patchResults is ok, it will write the grades to the database. */
    if(patchReadDataResults.isOk){
      const patchResults = patchReadDataResults.val.patch(patches);
      if (patchResults.isOk) {
        await this.#write(courseId, patchResults.val.getRawTable());
        return okResult(patchResults.val);
      } else {
        return patchResults;
      }
    } else {
      return patchReadDataResults;
    }
  }
}

/** Return an error result if courseId is unknown */
function checkCourseId(courseId: string) : Result<void> {
  return (COURSES[courseId])
    ? okResult(undefined)
    : errResult(`unknown course id ${courseId}`);
}

//TODO: add more local functions, constants, etc.

const GRADES_COLLECTION = 'grades';