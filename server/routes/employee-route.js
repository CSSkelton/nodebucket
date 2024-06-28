/**
 * title: employee-route.js
 * author: Cody Skelton
 * date: 06.09.2024
 */

"use strict";

const express = require("express");
const { mongo } = require("../utils/mongo");
const createError = require("http-errors");
const Ajv = require('ajv');
const { ObjectId } = require('mongodb');
const router = express.Router();

const ajv = new Ajv(); // create new instance of AJV object from the npm package

// http:localhost:3000/api/employees/:empId
// Valid: http:localhost:3000/api/employees/1008

// Invalid: http:localhost:3000/api/employees/foo      NaN            Error code 400: Bad request (Incorrect data type)
// Invalid: http:localhost:3000/api/employees/9999     1007-1012      Error code 404: Resource not found

/**
 * findEmployeeById
 * @openapi
 * /api/employees/{empId}:
 *  get:
 *    summary: Search for employee document in database
 *    description: Validate employee existence for login
 *    parameters:
 *      - name: empId
 *        in: path
 *        required: true
 *        description: employee ID
 *        schema:
 *          type: number
 *    responses:
 *      '200':
 *        description: Employee object
 *      '400':
 *        description: Bad Request
 *      '404':
 *        description: Resource not found
 *      '500':
 *        description: Server Error
 *    tags:
 *      - Employee
 */
router.get("/:empId", (req, res, next) => {

  console.log("We got this far");
  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // early return design pattern
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // database query is handled here
    console.log("Made it here");
    mongo(async db => {
      const employee = await db.collection("employees").findOne({ empId });

      if (!employee) {
        console.error("Employee not found:", empId);
        return next(createError(404, "Employee not found"));
      }

      res.send(employee);
    }, next)

  } catch(err) {
    console.log("Error:", err);
    next(err);
  }
});

/**
 * findAllTasks
 * @returns JSON array of all tasks
 * @throws { 500 error } - if there is a server error
 * @throws { 400 error } - if the employee id is not a number
 * @throws { 404 error } - if the tasks are not found
 * @openapi
 * /api/employees/{empId}/tasks:
 *  get:
 *    summary: Search for employee document in database
 *    description: Validate employee existence for login
 *    parameters:
 *      - name: empId
 *        in: path
 *        required: true
 *        description: employee ID
 *        schema:
 *          type: number
 *    responses:
 *      '200':
 *        description: Employee object
 *      '400':
 *        description: Bad Request
 *      '404':
 *        description: Resource not found
 *      '500':
 *        description: Server Error
 *    tags:
 *      - Employee
 */
router.get('/:empId/tasks', (req, res, next) => {
  try {

    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // check to determine if the returned value from parseInt is NaN
    if (isNaN(empId)) {
      return next(createError(400, "Employee ID must be a number"));
    }

    // Call mongo module and return list of tasks by employee ID
    mongo(async db => {

      const tasks = await db.collection('employees').findOne( { empId: empId }, { projection: { empId: 1, todo: 1, done: 1 } } );

      console.log('tasks', tasks);

      // If there are no tasks found for the employee ID; return a 404 error object to our middleware error handler
      if (!tasks) {
        return next(createError(404, `Tasks not found for Employee ID ${empId}`));
      }

      res.send(tasks);
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

/**
 * createTask
 * @openapi
 * /api/employees/{empId}/tasks:
 *  post:
 *    summary: Create a task for an employee
 *    description: Create a task object and add it to employee todo list
 *    parameters:
 *      - name: empId
 *        in: path
 *        required: true
 *        description: employee ID
 *        schema:
 *          type: number
 *    requestBody:
 *      description: Task information
 *      content:
 *        application/json:
 *          schema:
 *            required:
 *              - text
 *            properties:
 *              text:
 *                type: string
 *                description: Description of task
 *    responses:
 *      '200':
 *        description: Employee object
 *      '400':
 *        description: Bad Request
 *      '404':
 *        description: Resource not found
 *      '500':
 *        description: Server Error
 *    tags:
 *      - Employee
 */

const taskSchema = {
  type: 'object',
  properties: {
    text: { type: 'string' }
  },
  required: ['text'],
  additionalProperties: false
};

router.post('/:empId/tasks', (req, res, next) => {

  try{

    // Check if the empId from the req params is a number
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // Check to see if the parseInt function returns a number or NaN; if NaN it means the empId is not a number.
    if (isNaN(empId)) {
      return next(createError(400, 'Employee ID must be a number'));
    }

    mongo(async db => {

      const employee = await db.collection('employees').findOne( { empId: empId } );

      // if the employee is not found return a 404 error
      if (!employee) {
        return next(createError(404, 'Employee not found with empId', empId));
      }

      // compile the task schema and validate it against the body of the request
      const validator = ajv.compile(taskSchema);
      const valid = validator( req.body );

      // if the payload is not valid return a 400 error and append the errors to the err.errors property
      if (!valid) {
        return next(createError(400, 'Invalid task payload', validator.errors));
      }

      // create the object literal to add to the employee collection
      const newTask = {
        _id: new ObjectId(),
        text: req.body.text
      }

      // call the mongo module and update the employee collection with the new task in the todo column
      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $push: { todo: newTask }
      })

      // check to see if the modified count is updated; if so then the task was added to the employee field
      if (!result.modifiedCount) {
        return next(createError(400, 'Unable to create task'));
      }

      res.status(201).send( { id: newTask._id } );
    }, next);
  } catch (err) {
    console.error('err', err);
    next(err);
  }
})

/**
 * updateTask
 * @openapi
 * /api/employees/{empId}/tasks:
 *  put:
 *    summary: Update task for employee
 *    description: Updates tasks in employee todo and done lists using new information
 *    parameters:
 *      - name: empId
 *        in: path
 *        required: true
 *        description: employee ID
 *        schema:
 *          type: number
 *    requestBody:
 *      description: Task information
 *      content:
 *        application/json:
 *          schema:
 *            required:
 *              - todo
 *              - done
 *            properties:
 *              todo:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                    text:
 *                      type: string
 *              done:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                    text:
 *                      type: string
 *    responses:
 *      '200':
 *        description: Employee object
 *      '400':
 *        description: Bad Request
 *      '404':
 *        description: Resource not found
 *      '500':
 *        description: Server Error
 *    tags:
 *      - Employee
 */

const tasksSchema = {
  type: 'object',
  required: ['todo', 'done'],
  additionalProperties: false,
  properties: {
    todo: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
        required: [ '_id', 'text' ],
        additionalProperties: false
      }
    },
    done: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          text: { type: 'string' }
        },
        required: [ '_id', 'text' ],
        additionalProperties: false
      }
    }
  }
}

router.put('/:empId/tasks', (req, res, next) => {
  try {

    let { empId } = req.params;
    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      return next(createError(400, 'Employee ID must be a number'));
    }

    mongo(async db => {
      const employee = await db.collection('employees').findOne( { empId: empId } );

      if (!employee) {
        return next(createError(404, `Employee not found with Employee ID ${empId}`));
      }

      const tasks = req.body;

      const validator = ajv.compile(tasksSchema);
      const valid = validator(tasks);

      if (!valid) {
        return next(createError(400, 'Invalid task payload', validator.errors));
      }

      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $set: {todo: tasks.todo, done: tasks.done }}
      )

      res.status(204).send(tasks);
    }, next);

  } catch (err) {
    console.error('err', err);
    next(err);
  }
});

/**
 * deleteTask
 * @openapi
 * /api/employees/{empId}/tasks/{taskId}:
 *  delete:
 *    summary: Delete task for employee
 *    description: Delete a task in todo or done array for employee
 *    parameters:
 *      - name: empId
 *        in: path
 *        required: true
 *        description: employee ID
 *        schema:
 *          type: number
 *      - name: taskId
 *        in: path
 *        required: true
 *        description: task ID
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: Employee object
 *      '400':
 *        description: Bad Request
 *      '404':
 *        description: Resource not found
 *      '500':
 *        description: Server Error
 *    tags:
 *      - Employee
 */
router.delete('/:empId/tasks/:taskId', (req, res, next) => {

  try {
    let { empId } = req.params;
    let { taskId } = req.params;

    empId = parseInt(empId, 10);

    if (isNaN(empId)) {
      return next(createError(400, 'Employee ID must be a number'));
    }

    mongo(async db => {
      let emp = await db.collection('employees').findOne({ empId: empId });

      if (!emp) {
        return next(createError(404, `Employee not found with Employee ID ${empId}`));
      }

      // check if todo or done array are empty
      // if so, initialize as empty array
      if (!emp.todo) emp.todo = [];
      if (!emp.done) emp.done = [];

      const todo = emp.todo.filter(t => t._id.toString() !== taskId.toString());
      const done = emp.done.filter(t => t._id.toString() !== taskId.toString());

      const result = await db.collection('employees').updateOne(
        { empId: empId },
        { $set: { todo: todo, done: done } }
      )

      res.status(204).send( { taskId } );

    }, next);

  } catch(err) {
    console.error('err', err);
    next(err);
  }
});

module.exports = router;