
export type Task = {
    id: string;
    title: string;
    priority: "High" | "Medium" | "Low";
    status: "To Do" | "In Progress" | "Done";
    customFields?: Record<string, CustomFieldValue>;
    order?: number;

  };

  export type CustomFieldType = 'text' | 'number' | 'checkbox';

export type CustomFieldValue = string | number | boolean;

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
}