import { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TaskForm = () => {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      try {
          fetch(`${import.meta.env.VITE_SERVER_URL}/api/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          })
            .then((response) => {
              if (response.ok) {
                setFormSubmitted(true)
                toast.success('Task created successfully');
              } else {
                response.json().then((data) => {
                  toast.error(`Error: ${data.message}`); 
              }).catch(() => {
                  toast.error('Unknown error occurred'); 
                });
              }
            })
            .catch((error) => {
              toast.error(error)
            })
        
      } catch (err: unknown) {
          if(err instanceof Error)
              toast(err.message);
      }
    }

    if (formSubmitted) {
      setFormData({
        title: '',
        description: ''
      });
      setFormSubmitted(false);
    }

    return (
        <div
      className={`flex place-content-center bg-white dark:bg-gray-700`}
    >
      <form
        className="flex flex-col items-center dark:bg-dark rounded justify-center h-screen w-screen"
        onSubmit={submitForm}
      >
        <section className=" dark:bg-dark-green sm:w-1/2">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-lg xl:p-0 dark:bg-gray-700 dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Add Tasks
                </h1>
                <div>
                  <label
                    id="text"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Title
                  </label>
                  <input
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="1 hour gym"
                    value={formData.title}
                  />
                </div>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <input
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Go to gym at 5am"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={formData.description}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-gray-700 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-primary-800"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
    )

}

export default TaskForm;