import { FormControl, MenuItem, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

const ALL_VALUE = "all";

type DepartmentSelectProps = {
  value: string;
  departments: string[];
  onChange: (value: string) => void;
  /** 기본: 전체 부서 */
  allLabel?: string;
  size?: "small" | "medium";
  minWidth?: number | { xs?: number; sm?: number; md?: number };
  disabled?: boolean;
};

/**
 * 부서 필터 Select — 「전체 부서」+ 전달받은 departments 목록
 */
const DepartmentSelect = ({
  value,
  departments,
  onChange,
  allLabel = "전체 부서",
  size = "small",
  minWidth = 140,
  disabled = false,
}: DepartmentSelectProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl size={size} sx={{ minWidth }} disabled={disabled}>
      <Select value={value} onChange={handleChange} displayEmpty>
        <MenuItem value={ALL_VALUE}>{allLabel}</MenuItem>
        {departments.map((department) => (
          <MenuItem key={department} value={department}>
            {department}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default DepartmentSelect;
export { ALL_VALUE as DEPARTMENT_SELECT_ALL };
