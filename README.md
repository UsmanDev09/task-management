# Task Management Application

A modern, feature-rich task management application built with Next.js, TypeScript, and Tailwind CSS. The application offers both table and Kanban views for task management, with support for custom fields, filtering, sorting, and full undo/redo functionality.

## Features

### Task Management
- Create, edit, and delete tasks
- Bulk actions for multiple tasks
- Custom fields support (text, number, checkbox)
- Task priorities (High, Medium, Low)
- Task statuses (To Do, In Progress, Done)

### Views
- **Table View**: 
  - Sortable columns
  - Custom field columns
  - Inline editing
  - Bulk selection and actions
  - Pagination
  
- **Kanban View**:
  - Drag and drop support
  - Priority-based columns
  - Quick task addition
  - Visual task organization

### Advanced Features
- Filtering system with multiple criteria
- Custom fields management
- Undo/Redo functionality
- Persistent storage using Zustand
- Responsive design
- Keyboard accessibility

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Drag and Drop**: @dnd-kit
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

1. Clone the repository:
2. Install dependencies:
3. Run the development server:

## Project Structure

## Key Components

- **Table.tsx**: Implements the table view with sorting, filtering, and inline editing
- **Kanban.tsx**: Implements the Kanban board with drag-and-drop functionality
- **CustomFieldDrawer.tsx**: Manages custom fields creation and deletion
- **Filters.tsx**: Handles filtering and view selection
- **useTaskStore.ts**: Central state management with undo/redo support

## State Management

The application uses Zustand for state management with the following features:
- Task CRUD operations
- Custom fields management
- View state persistence
- Undo/redo history
- Filter and sort configurations

## Styling

The application uses a dark theme by default with custom CSS variables for key colors:
- `--background`: Main background color
- `--foreground`: Text color
- `--kanban-column-bg`: Kanban column background
- `--table-border`: Table border color

