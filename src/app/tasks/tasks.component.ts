/**
 * Title: tasks.component.ts
 * Author: Cody Skelton
 * Date: 06.09.2024
 */


import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export interface Item {
  _id: string;
  text: string
}

export interface Employee {
  empId: number;
  todo: Item[];
  done: Item[];
}

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  // Local variables
  empId: number;
  employee: Employee;
  todo: Item[];
  done: Item[];

  constructor(private cookieService: CookieService, private http: HttpClient) {
    this.empId = parseInt(this.cookieService.get('session_user'), 10);
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];

    this.http.get(`/api/employees/${this.empId}/tasks`).subscribe({
      next: (emp: any) => {
        this.employee = emp;
      },
      error: () => {
        console.error('Unable to get employee data for employee ID: ', this.empId);
      },
      complete: () => {
        // ?? = null operator (if this property is null, initialize to an empty array)
        this.todo = this.employee.todo ?? [];
        this.done = this.employee.done ?? [];
      }
    });
  }

  createTask(form: NgForm) {
    if (form.valid) {
      const todoTask = form.value.task;
      this.http.post(`/api/employees/${this.empId}/tasks`, {
        text: todoTask
      }).subscribe({
        next: (result: any) => {
          const newTodoItem = {
            _id: result.id,
            text: todoTask
          }
          this.todo.push(newTodoItem);
        },
        error: (err) => {
          console.error('Unable to create task for employee: ' + this.empId, err);
        }
      })
    }
  }

  deleteTask(taskId: string) {
    console.log(`Task item: ${taskId}`);

    //confirm dialog
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    this.http.delete(`/api/employees/${this.empId}/tasks/${taskId}`).subscribe({
      next: (result: any) => {
        console.log('Task deleted with id', taskId);

        if (!this.todo) this.todo = []
        if (!this.done) this.done = []

        this.todo = this.todo.filter(t => t._id.toString() !== taskId)
        this.done = this.done.filter(t => t._id.toString() !== taskId)
      },
      error: (err) => {
        console.error('Unable to delete task for employee: ' + this.empId, err);
      }
    })
  }

  // Drop event for todo and done lists using cdkDragDrop directive from drag and drop module
  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      // If item dropped in same container, move to new index
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)

      console.log('Moved item in array', event.container.data)
      // Call the updateTaskList() function and pass in the empId, todo, and done arrays
      this.updateTaskList(this.empId, this.todo, this.done)
    } else {
      // If item is dropped in different container, move to new container
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      )

      console.log('Moved item in array', event.container.data) // Log new array to console

      // Call the updateTaskList() function and pass in empId, todo, and done arrays
      this.updateTaskList(this.empId, this.todo, this.done)
    }
  }

  /**
   * @description Updates task list for employee with specific empId and passes in the todo and done arrays
   * @param empId
   * @param todo
   * @param done
   * @returns void
   */
  updateTaskList(empId: number, todo: Item[], done: Item[]) {
    this.http.put(`/api/employees/${this.empId}/tasks`, {
      todo: todo,
      done: done
    }).subscribe({
      next: (result: any) => {
        console.log('Task updated successfully')
      },
      error: (err) => {
        console.log('error', err) // Log error to console
      }
    })
  }
}
