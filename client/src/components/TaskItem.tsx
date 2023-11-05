import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import { Task } from "../types/Task"

const TaskItem = () => {
    const [task, setTask] = useState<Task>()

    const { id } = useParams()

    const fetchTask = () => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/api/tasks/${id}`, {
            method: 'GET'
        }).then((res) => res.json())
          .then((res) => setTask(res.data))
    }
    
    useEffect(() => {
        fetchTask()
    }, []) 
    
    return (
        <div className="flex flex-wrap items-center w-full gap-8 p-8 relative top-20">
        {task &&
            <div
                key={task._id}
                className="w-64 max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
            >
                <h5 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {task.title}
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                    {task.description}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-400">
                    {task.status}
                </p>
            </div>
        }
    </div>
    )
}

export default TaskItem;