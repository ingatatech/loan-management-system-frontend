import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "@/lib/api"

interface ReportsState {
  dashboardStats: any
  employeeReports: any[]
  attendanceReports: any[]
  payrollReports: any[]
  leaveReports: any[]
  loading: boolean
  error: string | null
}

const initialState: ReportsState = {
  dashboardStats: null,
  employeeReports: [],
  attendanceReports: [],
  payrollReports: [],
  leaveReports: [],
  loading: false,
  error: null,
}

// Dashboard Statistics
export const fetchDashboardStats = createAsyncThunk("reports/fetchDashboardStats", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/reports/dashboard-stats")
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard stats")
  }
})

// Employee Reports
export const fetchEmployeeReports = createAsyncThunk(
  "reports/fetchEmployeeReports",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/employees", { params })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch employee reports")
    }
  },
)

// Attendance Reports
export const fetchAttendanceReports = createAsyncThunk(
  "reports/fetchAttendanceReports",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/attendance", { params })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch attendance reports")
    }
  },
)

// Payroll Reports
export const fetchPayrollReports = createAsyncThunk(
  "reports/fetchPayrollReports",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/payroll", { params })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payroll reports")
    }
  },
)

// Leave Reports
export const fetchLeaveReports = createAsyncThunk(
  "reports/fetchLeaveReports",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/leave", { params })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch leave reports")
    }
  },
)

// Export Report
export const exportReport = createAsyncThunk(
  "reports/exportReport",
  async ({ type, format, params }: { type: string; format: string; params: any }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/export/${type}`, {
        params: { ...params, format },
        responseType: "blob",
      })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to export report")
    }
  },
)

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false
        state.dashboardStats = action.payload
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Employee Reports
      .addCase(fetchEmployeeReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEmployeeReports.fulfilled, (state, action) => {
        state.loading = false
        state.employeeReports = action.payload
      })
      .addCase(fetchEmployeeReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Attendance Reports
      .addCase(fetchAttendanceReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAttendanceReports.fulfilled, (state, action) => {
        state.loading = false
        state.attendanceReports = action.payload
      })
      .addCase(fetchAttendanceReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Payroll Reports
      .addCase(fetchPayrollReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPayrollReports.fulfilled, (state, action) => {
        state.loading = false
        state.payrollReports = action.payload
      })
      .addCase(fetchPayrollReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Leave Reports
      .addCase(fetchLeaveReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLeaveReports.fulfilled, (state, action) => {
        state.loading = false
        state.leaveReports = action.payload
      })
      .addCase(fetchLeaveReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = reportsSlice.actions
export default reportsSlice.reducer
