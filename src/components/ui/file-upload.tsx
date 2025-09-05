// @ts-nocheck
"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  accept?: string
  maxSize?: number // in MB
  currentFile?: File | null
  label?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  accept = ".jpg,.jpeg,.png,.pdf,.doc,.docx",
  maxSize = 10,
  currentFile,
  label = "Upload File",
  required = false,
  className,
  disabled = false,
  collateralIndex, 
  fileType,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    const acceptedTypes = accept.split(",").map((type) => type.trim().toLowerCase())

    if (!acceptedTypes.includes(fileExtension)) {
      setError(`File type not supported. Accepted types: ${accept}`)
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      // Add collateral index and file type to the file object for identification
      const enhancedFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Add metadata to identify which collateral and file type this belongs to
      Object.defineProperty(enhancedFile, 'collateralIndex', { value: collateralIndex });
      Object.defineProperty(enhancedFile, 'fileType', { value: fileType });
      
      onFileSelect(enhancedFile);
    }
  }


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onFileRemove) {
      onFileRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setError(null)
  }

  const getFileIcon = (fileName: string) => {
    if (!fileName) {
      return <File className="w-6 h-6" />
    }

    const extension = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <ImageIcon className="w-6 h-6" />
    }
    if (["pdf"].includes(extension || "")) {
      return <FileText className="w-6 h-6" />
    }
    return <File className="w-6 h-6" />
  }

  return (
    <div className={cn("w-full", className)}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400 hover:bg-blue-50",
          error ? "border-red-300 bg-red-50" : "",
          currentFile ? "bg-green-50 border-green-300" : "",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {currentFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(currentFile.name || "")}
              <div>
                <p className="text-sm font-medium text-gray-900">{currentFile.name || "Unknown file"}</p>
                <p className="text-xs text-gray-500">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!disabled && (
              <button
                onClick={handleRemove}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Upload className={cn("mx-auto h-12 w-12 mb-4", error ? "text-red-400" : "text-gray-400")} />
            <div className="text-sm">
              <span className="font-medium text-blue-600">Click to upload</span>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {accept.replace(/\./g, "").toUpperCase()} up to {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FileUpload
