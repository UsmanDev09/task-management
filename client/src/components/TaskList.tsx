import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

import { Task } from "../types/Task"
import TaskFilter from "./TaskFilter"
import { toast } from "react-toastify"

const TaskList = () => {
    const [tasks, setTasks] = useState<Task[]>()

    const fetchTasks = async () => {
        return fetch(`${import.meta.env.VITE_SERVER_URL}/api/tasks`, {
            method: 'GET'
        }).then((res) => res.json())
          .then((res) => {
            setTasks(res.data)
        })
    }  
    
    const handleStatusChange = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
        event.preventDefault()
        return fetch(`${import.meta.env.VITE_SERVER_URL}/api/tasks/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({status: 'completed'})
        }).then((res) => {
            if (res.ok) {
                toast.success('Task status updated successfully');
            } else {
                res.json().then((data) => {
                  toast.error(`Error: ${data.message}`); // Assuming the error message is sent by the server in the response body
                }).catch(() => {
                  toast.error('Unknown error occurred'); // Fallback error message
                });
            }
            return res.json()
        })
          .then((res) => {
            setTasks(res.data)
        })
    }
    
    const handleDeleteTask = (event: React.MouseEvent<HTMLButtonElement>, id: number) => {
        event.preventDefault()
        return fetch(`${import.meta.env.VITE_SERVER_URL}/api/tasks/${id}`, {
            method: 'DELETE',
        }).then((res) => {
            if (res.ok) {
                toast.success('Task deleted successfully');
            } 
            return res.json()
        })
          .then((res) => {
            setTasks(res.data)
        })
    }
    
    useEffect(() => {
        fetchTasks()
    }, []) 

    useEffect(() => {
      }, [tasks]);
    
    return (
        <div className="flex relative top-32 dark:bg-gray-700">
            <TaskFilter setTasks={setTasks} />

            <div className="flex flex-wrap gap-8 p-8">
                {tasks &&
                tasks.map((task: Task) => (
                    <div
                    key={task._id}
                    className="w-64 max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
                    >
                    <Link to={`/tasks/${task._id}`} className="flex justify-between flex-col h-full">
                        <div>
                            <h5 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            {task.title}
                            </h5>
                            <p className="text-sm text-gray-700 dark:text-gray-400 h-12">
                            {task.description}
                            </p>
                        </div>
                        <p className="text-sm text-gray-400 dark:text-gray-400">
                        Status: {task.status}
                        </p>
                        <div className="flex flex-col">
                            {task.status !== 'completed' && (
                            <button onClick={(e) => handleStatusChange(e, task._id)} className="border rounded p-2 text-center bg-gray-200 dark:text-white dark:bg-gray-700 mt-2">
                                Mark as completed
                            </button>
                            )}
                            <button onClick={(e) => handleDeleteTask(e, task._id)} className="border rounded p-2 text-center bg-red-200 dark:text-white dark:bg-red-900 mt-2">
                            Delete Task
                            </button>
                        </div>
                    </Link>

                    </div>
                ))}
            </div>
        </div>
    )
}

export default TaskList;