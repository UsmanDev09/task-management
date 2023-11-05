import { useState, useEffect, ChangeEvent } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import TaskForm from "./components/TaskForm"
import { ThemeProvider } from "./context/ThemeContext"

import TaskList from "./components/TaskList"
import TaskItem from "./components/TaskItem"
import { ToastContainer } from "react-toastify"
import Navbar from "./components/Navbar"

function App() {
  const [themeMode, setThemeMode] = useState('light');

  const darkTheme = () => {
    setThemeMode('dark');
  }

  const lightTheme = () => {
    setThemeMode('light')
  }

  const onChangeMode = (event: ChangeEvent<HTMLInputElement>) => {
    const darkModeStatus = event.currentTarget.checked;

    if(darkModeStatus) {
      darkTheme()
    } else {
      lightTheme()
    }
  }

  useEffect(() => {
    document.querySelector('html')?.classList.remove('dark', 'light')
    document.querySelector('html')?.classList.add(themeMode)
  }, [themeMode])

  return (
    <ThemeProvider value={{ themeMode, darkTheme, lightTheme }}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        />
        <ToastContainer />
      <Router>
        <div className="dark:bg-gray-700 h-[100vh]">
          <Navbar onChangeMode={onChangeMode} themeMode={themeMode}/>

          <Routes>
            <Route path="/" element={<TaskForm />} /> {/* Specify a path for TaskForm */}
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/:id" element={<TaskItem />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
