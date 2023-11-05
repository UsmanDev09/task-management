import express from 'express';

const task = express.Router();

import { getTasksFromDatabase, updateTaskInDatabase, deleteTaskFromDatabase, createTaskInDatabase, getTaskFromDatabase } from '../controllers/task';

task
  .route('/')
  .get(getTasksFromDatabase)
  .post(createTaskInDatabase)

task
  .route('/:id')
  .put(updateTaskInDatabase)
  .delete(deleteTaskFromDatabase)
  .get(getTaskFromDatabase)

export default task;
