import { RequestHandler } from "express";

import { TaskInterface } from '../types/task';
import { StatusCodes } from "http-status-codes";
import { Constants } from "../utility/constants";
import logger from "../config/logger";
import { handleTaskCreationRequest, handleTaskDeletionRequest, handleTaskUpdationRequest, handleTasksFetchingRequest, handleTaskFetchingRequest } from "../services/task";

export const createTaskInDatabase : RequestHandler<unknown, unknown, TaskInterface , unknown> = async (req, res, next) => {
  try {
    const task = await handleTaskCreationRequest(req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      data: task,
      message: Constants.createdTaskSuccessfully
    })

  } catch (error: unknown) {
    if(error instanceof Error) {
      logger.error(error.message)
      next(error.message)
    }
  }
}


export const updateTaskInDatabase : RequestHandler<{ id: number }, unknown, TaskInterface , unknown> = async (req, res, next) => {
  try {
      const { id } = req.params;

      const { status } = req.body;
      console.log(id, 'body',req.body)

      const task = await handleTaskUpdationRequest(id, status)
      
      
      const tasks = await handleTasksFetchingRequest({})

      res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        data: tasks,
        message: Constants.updatedTaskSuccessfully
      })

  } catch (error: unknown) {
    if(error instanceof Error) {
      logger.error(error.message)
      next(error.message)
    }
  }
}

export const deleteTaskFromDatabase : RequestHandler<{ id: number }, unknown, TaskInterface , unknown> = async (req, res, next) => {
  try {
      const { id } = req.params;

      const task = await handleTaskDeletionRequest(id);

      const tasks = await handleTasksFetchingRequest({});

      res.status(StatusCodes.OK).json({
        success: true,
        data: tasks,
        message: Constants.deletedTaskSuccessfully
      })

  } catch (error:unknown) {
    if(error instanceof Error) {
      logger.error(error.message)
      next(error.message)
    }
  }
}

export const getTasksFromDatabase : RequestHandler<{ _id: number }, unknown, TaskInterface , { status: string }> = async (req, res, next) => {
  try {
    const { status } = req.query
    

    const filters: { [key: string]: RegExp  } = {}; 

    if (status) 
        filters.status = new RegExp(status, 'i') 

    const tasks = await handleTasksFetchingRequest(filters)
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: tasks,
      message: Constants.fetchedAllTasksSuccessfully
    })

  } catch (error: unknown) {
    if(error instanceof Error) {
      logger.error(error.message)
      next(error.message)
    }
  }
}

export const getTaskFromDatabase : RequestHandler<{ id: number }, unknown, TaskInterface , unknown > = async (req, res, next) => {
  try {
    
    const { id } = req.params
    console.log(id)
    const task = await handleTaskFetchingRequest(id)

    res.status(StatusCodes.OK).json({
      success: true,
      data: task,
      message: Constants.fetchedAllTasksSuccessfully
    })

  } catch (error: unknown) {
    if(error instanceof Error) {
      logger.error(error.message)
      next(error.message)
    }
  }

}