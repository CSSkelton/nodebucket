/**
 * title: employee-route.js
 * author: Cody Skelton
 * date: 06.09.2024
 */

"use strict";

const express = require("express");
const { mongo } = require("../utils/mongo");
const createError = require("http-errors");

const router = express.Router();

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
 *          type: int32
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

  try {
    let { empId } = req.params;
    empId = parseInt(empId, 10);

    // early return design pattern
    if (isNaN(empId)) {
      console.error("Input must be a number");
      return next(createError(400, "Input must be a number"));
    }

    // database query is handled here
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

module.exports = router;