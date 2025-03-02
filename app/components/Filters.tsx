import { Filter, Search, X, Undo2, Redo2, Plus } from "lucide-react";
import { CustomField } from "../types/task";
import { useState, useRef, useEffect } from "react";
import { Tooltip } from "./ui/Tooltip";

type FilterValue = string | boolean | string[];
type FilterOption = {
  value: string;
  label: string;
};

interface FilterProps {
  filters: Record<string, FilterValue>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, FilterValue>>>;
  customFields: CustomField[];
  setIsCustomFieldsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedView: string;
  setSelectedView: (view: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Filters({
  filters,
  setFilters,
  customFields,
  setIsCustomFieldsModalOpen,
  selectedView,
  setSelectedView,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: FilterProps) {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<string>("priority");
  const [multiSelectFilters, setMultiSelectFilters] = useState<Record<string, string[]>>({
    priority: [],
    status: [],
    ...customFields.reduce((acc, field) => ({
      ...acc,
      [`custom_${field.id}`]: []
    }), {})
  });
  
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Priority options
  const priorityOptions: FilterOption[] = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" }
  ];

  // Status options
  const statusOptions: FilterOption[] = [
    { value: "To Do", label: "To Do" },
    { value: "In Progress", label: "In Progress" },
    { value: "Done", label: "Done" }
  ];

  // Get custom field options
  const getCustomFieldOptions = (field: CustomField): FilterOption[] => {
    if (field.type === 'checkbox') {
      return [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" }
      ];
    }
    return [
      { value: "filled", label: "Has value" },
      { value: "empty", label: "No value" }
    ];
  };

  // Initialize multiSelectFilters from existing filters on first render
  useEffect(() => {
    const initialMultiSelect: Record<string, string[]> = {
      priority: [],
      status: [],
      ...customFields.reduce((acc, field) => ({
        ...acc,
        [`custom_${field.id}`]: []
      }), {})
    };

    // Convert existing filters to multiselect format
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'title' && value !== '') {
        if (typeof value === 'string' && value.includes(',')) {
          initialMultiSelect[key] = value.split(',');
        } else if (Array.isArray(value)) {
          initialMultiSelect[key] = value;
        } else if (value !== '') {
          initialMultiSelect[key] = [String(value)];
        }
      }
    });

    setMultiSelectFilters(initialMultiSelect);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Convert multiselect values to filter format
  useEffect(() => {
    const newFilters = { ...filters };
    
    Object.entries(multiSelectFilters).forEach(([key, values]) => {
      if (values.length === 0) {
        newFilters[key] = '';
      } else if (values.length === 1) {
        newFilters[key] = values[0];
      } else {
        // For multiple values, store as array instead of comma-separated string
        newFilters[key] = values;
      }
    });
    
    setFilters(newFilters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiSelectFilters]);

  const toggleFilterOption = (filterKey: string, value: string) => {
    setMultiSelectFilters(prev => {
      const currentValues = prev[filterKey] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [filterKey]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [filterKey]: [...currentValues, value]
        };
      }
    });
  };

  const resetFilters = () => {
    const resetMultiSelect: Record<string, string[]> = {
      priority: [],
      status: [],
      ...customFields.reduce((acc, field) => ({
        ...acc,
        [`custom_${field.id}`]: []
      }), {})
    };
    
    setMultiSelectFilters(resetMultiSelect);
    
    const resetObj: Record<string, FilterValue> = {
      title: '',
      priority: '',
      status: ''
    };
    
    // Reset custom field filters
    customFields.forEach(field => {
      resetObj[`custom_${field.id}`] = '';
    });
    
    setFilters(resetObj);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => {
      if (typeof value === 'string') return value !== '';
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return false;
    }) || Object.values(multiSelectFilters).some(values => values.length > 0);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    
    Object.values(multiSelectFilters).forEach(values => {
      count += values.length;
    });
    
    if (filters.title && typeof filters.title === 'string' && filters.title !== '') {
      count += 1;
    }
    
    return count;
  };

  const renderFilterOptions = (filterKey: string, options: FilterOption[]) => {
    const selectedValues = multiSelectFilters[filterKey] || [];
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => toggleFilterOption(filterKey, option.value)}
            className={`px-3 py-1 text-sm rounded-full flex items-center ${
              selectedValues.includes(option.value)
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option.label}
            {selectedValues.includes(option.value) && (
              <X className="w-3 h-3 ml-1" />
            )}
          </button>
        ))}
      </div>
    );
  };
  
  // Helper function to format filter value for display
  const formatFilterValue = (key: string, value: string): string => {
    if (key.startsWith("custom_")) {
      const fieldId = key.replace("custom_", "");
      const field = customFields.find(f => f.id === fieldId);
      if (field) {
        if (field.type === "checkbox") {
          return value === "true" ? "Yes" : "No";
        } else {
          return value === "filled" ? "Has value" : "No value";
        }
      }
    }
    return value;
  };

  // Helper function to get filter name for display
  const getFilterName = (key: string): string => {
    if (key === "priority") return "Priority";
    if (key === "status") return "Status";
    if (key.startsWith("custom_")) {
      const fieldId = key.replace("custom_", "");
      const field = customFields.find(f => f.id === fieldId);
      if (field) return field.name;
    }
    return key;
  };
  
  return (
    <div className="my-4">
      <div className="flex justify-between items-center mb-4">
        {/* Left side - View selector */}
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button 
            onClick={() => setSelectedView('Table')} 
            className={`px-4 py-2 text-sm font-medium border ${
              selectedView === 'Table' 
                ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-200'
            }`}
          >
            Table
          </button>
          <button 
            onClick={() => setSelectedView('Kanban')} 
            className={`px-4 py-2 text-sm font-medium border-y border-r  ${
              selectedView === 'Kanban' 
                ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' 
                : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-200'
            }`}
          >
            Kanban
          </button>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <div className={`flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-64' : 'w-10'}`}>
              {isSearchExpanded ? (
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full p-1 pl-10 bg-background text-gray-400 border border-[var(--table-border)] focus:outline-none"
                    placeholder="Search by title"
                    value={typeof filters.title === 'string' ? filters.title : ''}
                    onChange={e => setFilters({ ...filters, title: e.target.value })}
                    autoFocus
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              ) : (
                <Tooltip text="Search tasks">
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 text-gray-600 hover:text-gray-400 rounded-lg"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Filter */}
          <div className="relative" ref={filterMenuRef}>
            <Tooltip text="Filter tasks">
              <button
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`p-2 hover:text-gray-400 flex items-center ${
                  hasActiveFilters() ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                {getActiveFilterCount() > 0 && (
                  <span className="ml-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* Filter Dropdown Menu */}
            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-background border border-[var(--table-border)] z-50 shadow-xl rounded-md overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-medium">Filters</h3>
                    {hasActiveFilters() && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                      >
                        <X className="w-3 h-3" />
                        Clear all
                      </button>
                    )}
                  </div>
                  
                  {/* Filter tabs */}
                  <div className="border-b border-gray-700 mb-3">
                    <div className="flex space-x-1 overflow-x-auto pb-2">
                      <button
                        onClick={() => setActiveFilterTab("priority")}
                        className={`px-3 py-1 text-sm rounded-t-md ${
                          activeFilterTab === "priority" 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Priority
                        {multiSelectFilters.priority.length > 0 && (
                          <span className="ml-1 bg-white text-green-600 text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                            {multiSelectFilters.priority.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveFilterTab("status")}
                        className={`px-3 py-1 text-sm rounded-t-md ${
                          activeFilterTab === "status" 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Status
                        {multiSelectFilters.status.length > 0 && (
                          <span className="ml-1 bg-white text-green-600 text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                            {multiSelectFilters.status.length}
                          </span>
                        )}
                      </button>
                      
                      {customFields.map(field => (
                        <button
                          key={field.id}
                          onClick={() => setActiveFilterTab(`custom_${field.id}`)}
                          className={`px-3 py-1 text-sm rounded-t-md whitespace-nowrap ${
                            activeFilterTab === `custom_${field.id}` 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {field.name}
                          {multiSelectFilters[`custom_${field.id}`]?.length > 0 && (
                            <span className="ml-1 bg-white text-green-600 text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                              {multiSelectFilters[`custom_${field.id}`].length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Active tab content */}
                  <div className="py-2">
                    {activeFilterTab === "priority" && (
                      <div>
                        <div className="font-medium text-sm text-white mb-2">Select priority:</div>
                        {renderFilterOptions("priority", priorityOptions)}
                      </div>
                    )}
                    
                    {activeFilterTab === "status" && (
                      <div>
                        <div className="font-medium text-sm text-white mb-2">Select status:</div>
                        {renderFilterOptions("status", statusOptions)}
                      </div>
                    )}
                    
                    {customFields.map(field => (
                      activeFilterTab === `custom_${field.id}` && (
                        <div key={field.id}>
                          <div className="font-medium text-sm text-white mb-2">Select {field.name}:</div>
                          {renderFilterOptions(`custom_${field.id}`, getCustomFieldOptions(field))}
                        </div>
                      )
                    ))}
                  </div>
                  
                  {/* Selected filters summary */}
                  {hasActiveFilters() && (
                    <div className="mt-4 pt-3 border-t border-gray-700">
                      <div className="text-sm text-white font-medium mb-2">Active filters:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(multiSelectFilters).map(([key, values]) => (
                          values.map(value => (
                            <div 
                              key={`${key}-${value}`} 
                              className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center"
                            >
                              <span className="font-medium mr-1">{getFilterName(key)}:</span> {formatFilterValue(key, value)}
                              <button 
                                onClick={() => toggleFilterOption(key, value)}
                                className="ml-1 p-1 hover:bg-green-700 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ))}
                        
                        {filters.title && typeof filters.title === 'string' && filters.title !== '' && (
                          <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            <span className="font-medium mr-1">Search:</span> {filters.title}
                            <button 
                              onClick={() => setFilters({...filters, title: ''})}
                              className="ml-1 p-1 hover:bg-green-700 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Undo/Redo */}
          <Tooltip text="Undo">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-lg ${
                canUndo ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400'
              }`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text="Redo">
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-lg ${
                canRedo ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400'
              }`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Manage Fields button */}
          <button
            onClick={() => setIsCustomFieldsModalOpen(true)}
            className="px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" />
            Manage Fields
          </button>
        </div>
      </div>
      
      {/* Display active filters on the main UI */}
      {hasActiveFilters() && (
        <div className="mb-4 mt-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(multiSelectFilters).map(([key, values]) => (
              values.map(value => (
                <div 
                  key={`${key}-${value}`} 
                  className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center"
                >
                  <span className="font-medium mr-1">{getFilterName(key)}:</span> {formatFilterValue(key, value)}
                  <button 
                    onClick={() => toggleFilterOption(key, value)}
                    className="ml-1 p-1 hover:bg-green-700 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            ))}
            
            {filters.title && typeof filters.title === 'string' && filters.title !== '' && (
              <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <span className="font-medium mr-1">Search:</span> {filters.title}
                <button 
                  onClick={() => setFilters({...filters, title: ''})}
                  className="ml-1 p-1 hover:bg-green-700 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {hasActiveFilters() && (
              <button
                onClick={resetFilters}
                className="flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}