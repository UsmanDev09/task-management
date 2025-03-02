import { CustomField } from "../types/task";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface CustomFieldsDrawerProps {
  customFields: CustomField[];
  onAddField: (field: CustomField) => void;
  onRemoveField: (fieldId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomFieldsDrawer({
  customFields,
  onAddField,
  onRemoveField,
  isOpen,
  onClose,
}: CustomFieldsDrawerProps) {
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
  });

  // Add ESC key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newField.name.trim()) {
      onAddField({
        id: Date.now().toString(),
        name: newField.name.trim(),
        type: newField.type as "text" | "number" | "checkbox",
      });
      setNewField({ name: "", type: "text" });
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-background border border-[var(--table-border)] shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--table-border)]">
          <h2 className="text-lg text-white font-semibold">Custom Fields</h2>
          <button
            onClick={onClose}
            className="p-1 text-white hover:text-gray-400 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Field Name
                </label>
                <input
                  type="text"
                  value={newField.name}
                  onChange={(e) =>
                    setNewField({ ...newField, name: e.target.value })
                  }
                  required
                  className="w-full text-white px-3 py-2 bg-background border border-[var(--table-border)] focus:outline-none"
                  placeholder="Enter field name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Field Type
                </label>
                <select
                  value={newField.type}
                  onChange={(e) =>
                    setNewField({ ...newField, type: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background text-gray-400 border border-[var(--table-border)] focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 hover:bg-green-700"
              >
                Add Field
              </button>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="font-medium text-white">Existing Fields</h3>
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 bg-background text-gray-400 border border-[var(--table-border)] "
              >
                <div>
                  <p className="">{field.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{field.type}</p>
                </div>
                <button
                  onClick={() => onRemoveField(field.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}