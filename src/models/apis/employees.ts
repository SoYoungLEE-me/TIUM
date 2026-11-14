export type EmployeeRole = "employee" | "hr_admin";

export type Employee = {
  id: string;
  full_name: string;
  email: string;
  role: EmployeeRole;
  department: string | null;
  created_at: string;
};
