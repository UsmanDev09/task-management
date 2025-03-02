import { useState, useCallback } from 'react';
// types/undoredo.ts
export interface Command {
    execute: () => void;
    undo: () => void;
  }
  
  export interface UndoableState {
    tasks: Task[];
    customFields: CustomField[];
  }

  // hooks/useHistory.ts


export function useHistory(initialState: any) {
  const [currentState, setCurrentState] = useState(initialState);
  const [history, setHistory] = useState<Command[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Execute a command and add it to history
  const execute = useCallback((command: Command) => {
    // Execute the command
    command.execute();
    
    // If we're not at the end of history, remove future states
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1));
    }
    
    // Add command to history
    setHistory(prev => [...prev, command]);
    setHistoryIndex(prev => prev + 1);
  }, [history, historyIndex]);

  // Undo the last command
  const undo = useCallback(() => {
    if (historyIndex >= 0) {
      const command = history[historyIndex];
      command.undo();
      setHistoryIndex(prev => prev - 1);
    }
  }, [history, historyIndex]);

  // Redo the previously undone command
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const command = history[historyIndex + 1];
      command.execute();
      setHistoryIndex(prev => prev + 1);
    }
  }, [history, historyIndex]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    currentState,
    canUndo: historyIndex >= 0,
    canRedo: historyIndex < history.length - 1,
    execute,
    undo,
    redo,
    clearHistory
  };
}