import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"
import { toast } from "sonner"

export interface AttendanceRecord {
  attendance_id: number
  employee_id: number
  date: string
  clock_in_time: string | null
  clock_out_time: string | null
  break_start_time: string | null
  break_end_time: string | null
  total_hours: number
  overtime_hours: number
  status: "present" | "absent" | "late" | "half_day" | "on_leave"
  notes: string | null
  created_at: string
  updated_at: string
  employee: {
    employee_id: number
    employee_name: string
    position: string
    department?: {
      department_id: number
      name: string
    }
  }
}

export interface AttendanceSummary {
  employee_id: number
  employee_name: string
  total_days: number
  present_days: number
  absent_days: number
  late_days: number
  total_hours: number
  overtime_hours: number
  attendance_percentage: number
}

interface AttendanceState {
  attendanceRecords: AttendanceRecord[]
  myAttendance: AttendanceRecord[]
  attendanceSummary: AttendanceSummary[]
  currentRecord: AttendanceRecord | null
  isLoading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    perPage: number
  }
}

const initialState: AttendanceState = {
  attendanceRecords: [],
  myAttendance: [],
  attendanceSummary: [],
  currentRecord: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  },
}

// Attendance Thunks
export const fetchAttendanceRecords = createAsyncThunk(
  "attendance/fetchAttendanceRecords",
  async (
    params: {
      page?: number
      limit?: number
      employee_id?: number
      department_id?: number
      date_from?: string
      date_to?: string
      status?: string
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.get("/attendance/records", { params })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const fetchMyAttendance = createAsyncThunk(
  "attendance/fetchMyAttendance",
  async (params: { limit?: number; date_from?: string; date_to?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance/my-records", { params })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const clockIn = createAsyncThunk("attendance/clockIn", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/attendance/clock-in")
    toast.success("Clocked in successfully")
    return response.data.data
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to clock in")
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const clockOut = createAsyncThunk("attendance/clockOut", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/attendance/clock-out")
    toast.success("Clocked out successfully")
    return response.data.data
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to clock out")
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const updateAttendanceRecord = createAsyncThunk(
  "attendance/updateAttendanceRecord",
  async ({ id, recordData }: { id: number; recordData: Partial<AttendanceRecord> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/attendance/records/${id}`, recordData)
      toast.success("Attendance record updated successfully")
      return response.data.data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update attendance record")
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

export const fetchAttendanceSummary = createAsyncThunk(
  "attendance/fetchAttendanceSummary",
  async (params: { department_id?: number; month?: string; year?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendance/summary", { params })
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
)

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null
    },
    clearCurrentRecord: (state) => {
      state.currentRecord = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.isLoading = false
        state.attendanceRecords = action.payload.attendanceRecords || action.payload
        if (action.payload.pagination) {
          state.pagination = {
            currentPage: action.payload.pagination.page,
            totalPages: action.payload.pagination.totalPages,
            totalItems: action.payload.pagination.total,
            perPage: action.payload.pagination.limit,
          }
        }
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchMyAttendance.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.isLoading = false
        state.myAttendance = action.payload.attendanceRecords || action.payload
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.attendanceRecords.unshift(action.payload)
        state.myAttendance.unshift(action.payload)
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        const index = state.attendanceRecords.findIndex(
          (record) => record.attendance_id === action.payload.attendance_id,
        )
        if (index !== -1) {
          state.attendanceRecords[index] = action.payload
        }
        const myIndex = state.myAttendance.findIndex((record) => record.attendance_id === action.payload.attendance_id)
        if (myIndex !== -1) {
          state.myAttendance[myIndex] = action.payload
        }
      })
      .addCase(updateAttendanceRecord.fulfilled, (state, action) => {
        const index = state.attendanceRecords.findIndex(
          (record) => record.attendance_id === action.payload.attendance_id,
        )
        if (index !== -1) {
          state.attendanceRecords[index] = action.payload
        }
      })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        state.attendanceSummary = action.payload.attendanceSummary || action.payload
      })
  },
})

export const { clearAttendanceError, clearCurrentRecord } = attendanceSlice.actions
export default attendanceSlice.reducer
