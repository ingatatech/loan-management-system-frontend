// @ts-nocheck
import { Shield, Plus, Trash2 } from "lucide-react"
import { CollateralData, CollateralType } from "@/lib/features/auth/loanApplicationSlice"
import FileUpload from "@/components/ui/file-upload"

const CollateralStep: React.FC<{
  collaterals: CollateralData[]
  onAdd: () => void
  onUpdate: (index: number, data: Partial<CollateralData>) => void
  onRemove: (index: number) => void
  onFileChange: (collateralIndex: number, fileType: string, file: File) => void
  onFileRemove: (collateralIndex: number, fileType: string) => void
  errors: Record<string, string>
}> = ({ collaterals, onAdd, onUpdate, onRemove, onFileChange, onFileRemove, errors }) => {

const handleFileSelect = (collateralIndex: number, fileType: string, file: File) => {
  console.log(`📁 File selected for collateral ${collateralIndex}, type ${fileType}:`, {
    name: file.name,
    size: file.size,
    type: file.type
  })
  
  // Call the Redux action to store the file
  onFileChange(collateralIndex, fileType, file)
}

const handleFileRemove = (collateralIndex: number, fileType: string) => {
  console.log(`🗑️ File removed for collateral ${collateralIndex}, type ${fileType}`)
  
  // Call the Redux action to remove the file
  onFileRemove(collateralIndex, fileType)
}


  // Get file from the FileManager using the helper function
  const getFileFromCollateral = (collateralIndex: number, fileType: string): File | null => {
    // return getCollateralFile(collateralIndex, fileType)
  }

  const hasRequiredFiles = (collateralIndex: number): boolean => {
    const proofFile = getFileFromCollateral(collateralIndex, 'proofOfOwnership')
    const idFile = getFileFromCollateral(collateralIndex, 'ownerIdentification')
    return !!(proofFile && idFile)
  }

  const getUploadedFilesCount = (collateralIndex: number): number => {
    const fileTypes = ['proofOfOwnership', 'ownerIdentification', 'legalDocument', 'physicalEvidence']
    return fileTypes.filter(fileType => getFileFromCollateral(collateralIndex, fileType)).length
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center text-gray-800">
              <Shield className="w-7 h-7 mr-3 text-red-600" />
              Collateral Management
            </h3>
            <p className="text-gray-600">Add and manage collateral items for this loan</p>
          </div>
          <button
            onClick={onAdd}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Collateral
          </button>
        </div>
      </div>

      {collaterals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Collateral Added</h4>
          <p className="text-gray-500 mb-6">Add collateral items to secure this loan</p>
          <button
            onClick={onAdd}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add First Collateral
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {collaterals.map((collateral, index) => (
            <div key={collateral.id || index} className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <h4 className="text-lg font-semibold text-gray-800">Collateral #{index + 1}</h4>
                  
                  {/* Status indicators */}
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      hasRequiredFiles(index)
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {hasRequiredFiles(index) ? 'Complete' : 'Incomplete'}
                    </span>
                    
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {getUploadedFilesCount(index)}/4 files
                    </span>
                  </div>
                </div>
                
                {collaterals.length > 1 && (
                  <button
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Basic Collateral Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collateral Type *</label>
                  <select
                    value={collateral.collateralType}
                    onChange={(e) => onUpdate(index, { collateralType: e.target.value as CollateralType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={CollateralType.MOVABLE}>Movable</option>
                    <option value={CollateralType.IMMOVABLE}>Immovable</option>
                    <option value={CollateralType.FINANCIAL}>Financial</option>
                    <option value={CollateralType.GUARANTEE}>Guarantee</option>
                  </select>
                  {errors[`collateralType_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`collateralType_${index}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collateral Value (RWF) *</label>
                  <input
                    type="number"
                    value={collateral.collateralValue || ""}
                    onChange={(e) => onUpdate(index, { collateralValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter value"
                    min="0"
                  />
                  {errors[`collateralValue_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`collateralValue_${index}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valuation Date</label>
                  <input
                    type="date"
                    value={collateral.valuationDate || ""}
                    onChange={(e) => onUpdate(index, { valuationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={collateral.description}
                    onChange={(e) => onUpdate(index, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Detailed description of the collateral"
                  />
                  {errors[`description_${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`description_${index}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valued By</label>
                  <input
                    type="text"
                    value={collateral.valuedBy || ""}
                    onChange={(e) => onUpdate(index, { valuedBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Valuer name"
                  />
                </div>
              </div>

              {/* Guarantor Information */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h5 className="text-md font-semibold mb-4 text-gray-800">Guarantor Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guarantor Name</label>
                    <input
                      type="text"
                      value={collateral.guarantorName || ""}
                      onChange={(e) => onUpdate(index, { guarantorName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter guarantor name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guarantor Phone</label>
                    <input
                      type="tel"
                      value={collateral.guarantorPhone || ""}
                      onChange={(e) => onUpdate(index, { guarantorPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+250 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guarantor Address</label>
                    <input
                      type="text"
                      value={collateral.guarantorAddress || ""}
                      onChange={(e) => onUpdate(index, { guarantorAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads - Enhanced Section */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h5 className="text-md font-semibold mb-6 text-gray-800">Required Documents</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    label="Proof of Ownership"
                    onFileSelect={(file) => handleFileSelect(index, "proofOfOwnership", file)}
                    onFileRemove={() => handleFileRemove(index, "proofOfOwnership")}
                    currentFile={getFileFromCollateral(index, "proofOfOwnership")}
                    required
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    maxSize={10}
                    error={errors[`proofOfOwnership_${index}`]}
                    showFileInfo={true}
                  />

                  <FileUpload
                    label="Owner Identification"
                    onFileSelect={(file) => handleFileSelect(index, "ownerIdentification", file)}
                    onFileRemove={() => handleFileRemove(index, "ownerIdentification")}
                    currentFile={getFileFromCollateral(index, "ownerIdentification")}
                    required
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    maxSize={10}
                    error={errors[`ownerIdentification_${index}`]}
                    showFileInfo={true}
                  />

                  <FileUpload
                    label="Legal Documents"
                    onFileSelect={(file) => handleFileSelect(index, "legalDocument", file)}
                    onFileRemove={() => handleFileRemove(index, "legalDocument")}
                    currentFile={getFileFromCollateral(index, "legalDocument")}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    maxSize={10}
                    error={errors[`legalDocument_${index}`]}
                    showFileInfo={true}
                  />

                  <FileUpload
                    label="Physical Evidence"
                    onFileSelect={(file) => handleFileSelect(index, "physicalEvidence", file)}
                    onFileRemove={() => handleFileRemove(index, "physicalEvidence")}
                    currentFile={getFileFromCollateral(index, "physicalEvidence")}
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    maxSize={10}
                    error={errors[`physicalEvidence_${index}`]}
                    showFileInfo={true}
                  />
                </div>

                {/* Enhanced Upload Summary */}
                <div className="mt-6 p-4 bg-white rounded border">
                  <div className="flex justify-between items-center mb-3">
                    <h6 className="text-sm font-medium text-gray-700">Document Upload Status</h6>
                    <span className={`text-sm font-semibold ${
                      hasRequiredFiles(index) ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {getUploadedFilesCount(index)}/4 uploaded
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'proofOfOwnership', label: 'Proof of Ownership', required: true },
                      { key: 'ownerIdentification', label: 'Owner ID', required: true },
                      { key: 'legalDocument', label: 'Legal Documents', required: false },
                      { key: 'physicalEvidence', label: 'Physical Evidence', required: false }
                    ].map(({ key, label, required }) => {
                      const hasFile = getFileFromCollateral(index, key) !== null
                      return (
                        <div key={key} className={`flex items-center justify-between p-2 rounded border ${
                          hasFile
                            ? 'bg-green-50 border-green-200'
                            : required
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <span className="text-xs font-medium truncate">{label}</span>
                          <span className={`text-xs font-bold ${
                            hasFile
                              ? 'text-green-600'
                              : required
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}>
                            {hasFile ? '✓' : required ? '!' : '○'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          hasRequiredFiles(index) ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${(getUploadedFilesCount(index) / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {hasRequiredFiles(index) 
                        ? 'All required documents uploaded' 
                        : 'Missing required documents'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  value={collateral.notes || ""}
                  onChange={(e) => onUpdate(index, { notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional notes about this collateral..."
                />
              </div>

              {/* Collateral Summary Card */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collateral ID:</span>
                    <span className="font-mono text-gray-800 text-xs">{collateral.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Document Status:</span>
                    <span className={`font-semibold ${
                      hasRequiredFiles(index) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {hasRequiredFiles(index) ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-semibold text-blue-600">
                      RWF {collateral.collateralValue?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Summary Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h4 className="text-lg font-semibold mb-4 text-gray-800">Collateral Portfolio Summary</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{collaterals.length}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  RWF {collaterals.reduce((sum, col) => sum + (col.collateralValue || 0), 0).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Complete Items</p>
                <p className="text-2xl font-bold text-purple-600">
                  {collaterals.filter((_, index) => hasRequiredFiles(index)).length}/{collaterals.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollateralStep