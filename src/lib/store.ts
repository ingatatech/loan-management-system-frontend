import authReducer from "./features/auth/user-slice"
import shareholderReducer from "./features/auth/shareholderSlice"
import adminReducer from "./features/admin/admin-slice"
import reportsReducer from "./features/reports/reports-slice"
import organizationsReducer from "./features/auth/organization-slice"
import systemUsersReducer from "./features/system-users/system-users-slice"
import fundingReducer from "./features/auth/funding-Slice"
import managementReducer from "./features/auth/management-slice"
import borrowersReducer from "./features/auth/borrowerSlice"
import loanApplicationReducer from "./features/auth/loanApplicationSlice"
import repaymentTransactionReducer from "./features/repayment/repaymentTransactionSlice"
import repaymentScheduleReducer from "./features/repayment/repaymentScheduleSlice"
import loanClassificationReducer from "./features/repayment/loanClassificationSlice"
import BouncedChequeReducer from "./features/auth/bouncedChequeSlice"
import userReducer from "./features/users/userSlice";
import workflowReducer from "./features/workflow/workflowSlice";
import { configureStore } from "@reduxjs/toolkit"
export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      admin: adminReducer,
 
      reports: reportsReducer,
      organizations: organizationsReducer,
      systemUsers: systemUsersReducer,
      
      shareholders: shareholderReducer,
      funding: fundingReducer,
      management: managementReducer,
      borrowers: borrowersReducer,
      loanApplication: loanApplicationReducer,
      repaymentTransaction: repaymentTransactionReducer,
      repaymentSchedule: repaymentScheduleReducer,
      loanClassification: loanClassificationReducer,
       user: userReducer,
      workflow: workflowReducer,
      bouncedCheque: BouncedChequeReducer
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
