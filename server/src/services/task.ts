import Task from '../models/task';
import { TaskInterface } from '../types/task';

export const handleTaskCreationRequest = (task: TaskInterface) => {
    return Task.create(task)
}

export const handleTaskUpdationRequest = ( _id: number, status: string ) => {
    return Task.updateOne({ _id }, { status: status })
}

export const handleTaskDeletionRequest = (_id: number) => {
    return Task.deleteOne({ _id })
}

export const handleTasksFetchingRequest = (filters: { [key: string]: RegExp  }) => {
    return Task.find(filters).lean()
}

export const handleTaskFetchingRequest = (id: number) => {
    return Task.findById(id).lean()
}