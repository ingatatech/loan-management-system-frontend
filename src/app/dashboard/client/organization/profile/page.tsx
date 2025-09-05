// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Save,
  X,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';

import { 
  updateOrganization, 
  getOrganizationById,
  clearError, 
  Category,
  Service
} from '@/lib/features/auth/organization-slice';
import { AppDispatch, RootState } from '@/lib/store';
import toast from 'react-hot-toast';
import rwandaData from '../../../../../../data.json';

// Helper functions
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

const getOrganizationId = () => {
  if (typeof window !== "undefined") {
    const userString = localStorage.getItem("user")
    const user = userString ? JSON.parse(userString) : null
    return user?.organizationId
  }
  return null
}

const AVAILABLE_CATEGORIES = [
  'Category I - Comprehensive Services',
  'Category II - Limited Financial Services',
  'Category III - Support/Intermediary Services'
];

const servicesByCategory = {
  'Category I - Comprehensive Services': [
    { name: 'Mortgage finance', description: 'Long-term loans for property purchases' },
    { name: 'Refinancing', description: 'Replacing existing debt with new loan terms' },
    { name: 'Development finance', description: 'Funding for property development projects' },
    { name: 'Credit guarantee', description: 'Providing guarantees for borrower credit' },
    { name: 'Asset finance', description: 'Loans for purchasing business assets' },
    { name: 'Finance lease', description: 'Leasing arrangements with purchase option' },
    { name: 'Factoring business', description: 'Purchasing accounts receivable' },
    { name: 'Money lending', description: 'General personal and business loans' },
    { name: 'Pawnshop', description: 'Secured loans using personal property as collateral' },
    { name: 'Debt collection services', description: 'Professional debt recovery services' },
    { name: 'Credit intermediary', description: 'Connecting borrowers with lenders' },
    { name: 'Debt counsellor', description: 'Financial counseling and debt management' },
    { name: 'Performance security', description: 'Financial guarantees for performance' },
    { name: 'Peer-to-peer lending platform', description: 'Platform connecting individual lenders and borrowers' }
  ],
  'Category II - Limited Financial Services': [
    { name: 'Asset finance', description: 'Loans for purchasing business assets' },
    { name: 'Finance lease', description: 'Leasing arrangements with purchase option' },
    { name: 'Factoring business', description: 'Purchasing accounts receivable' },
    { name: 'Money lending', description: 'General personal and business loans' },
    { name: 'Pawnshop', description: 'Secured loans using personal property as collateral' }
  ],
  'Category III - Support/Intermediary Services': [
    { name: 'Debt collection services', description: 'Professional debt recovery services' },
    { name: 'Credit intermediary', description: 'Connecting borrowers with lenders' },
    { name: 'Debt counsellor', description: 'Financial counseling and debt management' },
    { name: 'Peer-to-peer lending platform', description: 'Platform connecting individual lenders and borrowers' }
  ]
};

interface FormData {
  name: string;
  selectedCategories: string[];
  selectedServices: Record<string, string[]>; // category -> array of selected service names
  customServices: Record<string, Array<{name: string, description: string}>>;
  existingServices: Record<string, Array<{id?: number, name: string, description: string, isExisting?: boolean}>>;
  
  address: {
    country: string;
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    street: string;
    houseNumber: string;
    poBox: string;
  };
  tinNumber: string;
  website: string;
  description: string;
  registrationNumber: string;
  registrationDate: string;
  businessSector: string;
  phone: string;
  email: string;
}

const EditOrganizationProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentOrganization, isLoading, error } = useSelector((state: RootState) => state.organizations);

  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  const initialFormData: FormData = {
    name: '',
    selectedCategories: [],
    selectedServices: {},
    customServices: {},
    existingServices: {},
    address: {
      country: 'Rwanda',
      province: '',
      district: '',
      sector: '',
      cell: '',
      village: '',
      street: '',
      houseNumber: '',
      poBox: ''
    },
    tinNumber: '',
    website: '',
    description: '',
    registrationNumber: '',
    registrationDate: '',
    businessSector: '',
    phone: '',
    email: ''
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [originalData, setOriginalData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showServices, setShowServices] = useState<Record<string, boolean>>({});

  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [cells, setCells] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  // Initialize organization ID and load data
  useEffect(() => {
    const orgId = getOrganizationId();
    if (orgId) {
      setOrganizationId(orgId);
      dispatch(getOrganizationById({ id: orgId, includeRelations: true }));
    } else {
      toast.error('Organization ID not found. Please log in again.');
      router.push('/login');
    }
  }, [dispatch, router]);

  // Load provinces data
  useEffect(() => {
    const provinceList = Object.keys(rwandaData);
    setProvinces(provinceList);
  }, []);

// In your EditOrganizationProfile component, update the useEffect:

useEffect(() => {
  if (currentOrganization) {
    console.log('Processing organization data:', currentOrganization);
    
    // Process existing services by category from the categories array
    const existingServices: Record<string, Array<{id?: number, name: string, description: string, isExisting?: boolean}>> = {};
    const selectedServices: Record<string, string[]> = {};
    
    // Process services from categories with proper type checking
    if (currentOrganization.categories && currentOrganization.categories.length > 0) {
      console.log('Found categories:', currentOrganization.categories);
      
      currentOrganization.categories.forEach((category: Category) => {
        const categoryName = category.name;
        console.log(`Processing category: ${categoryName} with ${category.services?.length || 0} services`);
        
        if (category.services && category.services.length > 0) {
          existingServices[categoryName] = category.services.map((service: Service) => ({
            id: service.id,
            name: service.name,
            description: service.description || '',
            isExisting: true
          }));
          
          // Auto-select all existing services
          selectedServices[categoryName] = category.services.map((service: Service) => service.name);
          
          console.log(`Category ${categoryName} has services:`, existingServices[categoryName]);
        } else {
          existingServices[categoryName] = [];
          selectedServices[categoryName] = [];
        }
      });
    } else {
      console.log('No categories found in organization data');
    }

    const orgData: FormData = {
      name: currentOrganization.name || '',
      selectedCategories: currentOrganization.selectedCategories || [],
      selectedServices: selectedServices,
      customServices: {},
      existingServices: existingServices,
      address: {
        country: currentOrganization.address?.country || 'Rwanda',
        province: currentOrganization.address?.province || '',
        district: currentOrganization.address?.district || '',
        sector: currentOrganization.address?.sector || '',
        cell: currentOrganization.address?.cell || '',
        village: currentOrganization.address?.village || '',
        street: currentOrganization.address?.street || '',
        houseNumber: currentOrganization.address?.houseNumber || '',
        poBox: currentOrganization.address?.poBox || ''
      },
      tinNumber: currentOrganization.tinNumber || '',
      website: currentOrganization.website || '',
      description: currentOrganization.description || '',
      registrationNumber: currentOrganization.registrationNumber || '',
      registrationDate: currentOrganization.registrationDate 
        ? new Date(currentOrganization.registrationDate).toISOString().split('T')[0] 
        : '',
      businessSector: currentOrganization.businessSector || '',
      phone: currentOrganization.phone || '',
      email: currentOrganization.email || ''
    };
    
    console.log('Final form data:', orgData);
    setFormData(orgData);
    setOriginalData(orgData);

    // Auto-expand categories that have existing services
    const expandedCats: Record<string, boolean> = {};
    const showServicesState: Record<string, boolean> = {};
    
    Object.keys(existingServices).forEach(categoryName => {
      if (existingServices[categoryName].length > 0) {
        expandedCats[categoryName] = true;
        showServicesState[categoryName] = true;
      }
    });
    
    setExpandedCategories(expandedCats);
    setShowServices(showServicesState);
  }
}, [currentOrganization]);
  useEffect(() => {
    if (formData.address.province) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData];
      const districtList = Object.keys(provinceData);
      setDistricts(districtList);
    }
  }, [formData.address.province]);

  useEffect(() => {
    if (formData.address.province && formData.address.district) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData];
      const districtData = provinceData[formData.address.district as keyof typeof provinceData];
      const sectorList = Object.keys(districtData);
      setSectors(sectorList);
    }
  }, [formData.address.district]);

  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData];
      const districtData = provinceData[formData.address.district as keyof typeof provinceData];
      const sectorData = districtData[formData.address.sector as keyof typeof districtData];
      const cellList = Object.keys(sectorData);
      setCells(cellList);
    }
  }, [formData.address.sector]);

  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector && formData.address.cell) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData];
      const districtData = provinceData[formData.address.district as keyof typeof provinceData];
      const sectorData = districtData[formData.address.sector as keyof typeof districtData];
      const cellData = sectorData[formData.address.cell as keyof typeof sectorData];
      
      if (Array.isArray(cellData)) {
        setVillages(cellData);
      }
    }
  }, [formData.address.cell]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Organization name is required';
        if (formData.selectedCategories.length === 0) newErrors.selectedCategories = 'At least one category must be selected';
        break;
      case 2:
        if (!formData.address.province) newErrors.province = 'Province is required';
        if (!formData.address.district) newErrors.district = 'District is required';
        if (!formData.address.sector) newErrors.sector = 'Sector is required';
        break;
      case 3:
        if (!formData.tinNumber.trim()) newErrors.tinNumber = 'TIN number is required';
        if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
        if (!formData.registrationDate) newErrors.registrationDate = 'Registration date is required';
        if (!formData.businessSector.trim()) newErrors.businessSector = 'Business sector is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: any) => {
    const keys = field.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof FormData],
          [keys[1]]: value
        }
      }));
    }
  };

  const handleCategoryToggle = (category: string) => {
    const isSelected = formData.selectedCategories.includes(category);
    if (isSelected) {
      // Remove category and its services
      setFormData(prev => ({
        ...prev,
        selectedCategories: prev.selectedCategories.filter(c => c !== category),
        selectedServices: Object.fromEntries(
          Object.entries(prev.selectedServices).filter(([key]) => key !== category)
        ),
        customServices: Object.fromEntries(
          Object.entries(prev.customServices).filter(([key]) => key !== category)
        )
      }));
    } else {
      // Add category
      setFormData(prev => ({
        ...prev,
        selectedCategories: [...prev.selectedCategories, category],
        selectedServices: {
          ...prev.selectedServices,
          [category]: []
        },
        customServices: {
          ...prev.customServices,
          [category]: []
        }
      }));
    }
    setExpandedCategories(prev => ({ ...prev, [category]: !isSelected }));
  };

  // Handle default service selection
  const handleServiceToggle = (category: string, serviceName: string) => {
    if (!isEditing) return;
    
    setFormData(prev => {
      const currentSelected = prev.selectedServices[category] || [];
      const isSelected = currentSelected.includes(serviceName);
      
      if (isSelected) {
        return {
          ...prev,
          selectedServices: {
            ...prev.selectedServices,
            [category]: currentSelected.filter(name => name !== serviceName)
          }
        };
      } else {
        return {
          ...prev,
          selectedServices: {
            ...prev.selectedServices,
            [category]: [...currentSelected, serviceName]
          }
        };
      }
    });
  };

  // Add custom service to category
  const addServiceToCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      customServices: {
        ...prev.customServices,
        [category]: [
          ...(prev.customServices[category] || []),
          { name: '', description: '' }
        ]
      }
    }));
  };

  // Remove custom service from category
  const removeServiceFromCategory = (category: string, index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Remove from existing services
      setFormData(prev => ({
        ...prev,
        existingServices: {
          ...prev.existingServices,
          [category]: prev.existingServices[category]?.filter((_, i) => i !== index) || []
        },
        selectedServices: {
          ...prev.selectedServices,
          [category]: prev.selectedServices[category]?.filter((_, i) => i !== index) || []
        }
      }));
    } else {
      // Remove from custom services
      setFormData(prev => ({
        ...prev,
        customServices: {
          ...prev.customServices,
          [category]: prev.customServices[category]?.filter((_, i) => i !== index) || []
        }
      }));
    }
  };

  // Update custom service in category
  const updateServiceInCategory = (category: string, index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      customServices: {
        ...prev.customServices,
        [category]: prev.customServices[category]?.map((service, i) => 
          i === index ? { ...service, [field]: value } : service
        ) || []
      }
    }));
  };

  // Update existing service
  const updateExistingService = (category: string, index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      existingServices: {
        ...prev.existingServices,
        [category]: prev.existingServices[category]?.map((service, i) => 
          i === index ? { ...service, [field]: value } : service
        ) || []
      }
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setErrors({});
  };

const handleSave = async () => {
  if (!validateStep(currentStep) || !organizationId) return;
  
  setIsSubmitting(true);
  
  try {
    // Build categories data including all services
    const categoriesData = formData.selectedCategories.map(category => {
      const defaultServices = servicesByCategory[category as keyof typeof servicesByCategory] || [];
      const selectedServices = formData.selectedServices[category] || [];
      const customServices = formData.customServices[category] || [];
      const existingServices = formData.existingServices[category] || [];
      
      // Build the services array
      const services = [];
      
      // Add existing services
      existingServices.forEach(service => {
        services.push({
          name: service.name,
          description: service.description,
          id: service.id // Include ID for existing services
        });
      });
      
      // Add newly selected default services
      selectedServices.forEach(serviceName => {
        // Only add if not already in existing services
        if (!existingServices.some(existing => existing.name === serviceName)) {
          const defaultService = defaultServices.find(s => s.name === serviceName);
          if (defaultService) {
            services.push({
              name: defaultService.name,
              description: defaultService.description
            });
          }
        }
      });
      
      // Add valid custom services
      customServices.forEach(service => {
        if (service.name.trim() !== '' && service.description.trim() !== '') {
          services.push({
            name: service.name,
            description: service.description
          });
        }
      });
      
      return {
        name: category,
        services: services
      };
    });

    const updateData = {
      name: formData.name,
      selectedCategories: formData.selectedCategories,
      categoriesData: categoriesData,
      address: formData.address,
      tinNumber: formData.tinNumber,
      website: formData.website || undefined,
      description: formData.description || undefined,
      registrationNumber: formData.registrationNumber,
      registrationDate: new Date(formData.registrationDate),
      businessSector: formData.businessSector,
      phone: formData.phone,
      email: formData.email
    };

    console.log('Sending update data:', updateData); // Debug log

    const result = await dispatch(updateOrganization({ 
      id: organizationId, 
      data: updateData 
    })).unwrap();
    
    if (result.success) {
      toast.success('Organization updated successfully!', {
        duration: 4000,
        position: 'top-right',
      });
      
      // Refresh organization data to get updated services
      await dispatch(getOrganizationById({ id: organizationId, includeRelations: true }));
      
      setIsEditing(false);
    }
  } catch (error) {
    console.error('Failed to update organization:', error);
    toast.error('Failed to update organization. Please try again.', {
      duration: 4000,
      position: 'top-right',
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const getStepIcon = (step: number) => {
    const icons = [Building2, MapPin, Briefcase];
    const Icon = icons[step - 1];
    return <Icon className="w-5 h-5" />;
  };

  const getStepTitle = (step: number) => {
    const titles = ['Basic Information', 'Address Details', 'Business Details'];
    return titles[step - 1];
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step <= currentStep
                ? 'bg-[#5B7FA2] border-[#5B7FA2] text-white'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              getStepIcon(step)
            )}
          </div>
          {step < 3 && (
            <div
              className={`w-32 h-0.5 mx-2 ${
                step < currentStep ? 'bg-[#5B7FA2]' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
 const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-[#5B7FA2]" />
          Organization Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter organization name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selected Categories & Services *
            </label>
            <div className="space-y-3">
{AVAILABLE_CATEGORIES.map((category) => {
  const isSelected = formData.selectedCategories.includes(category);
  const defaultServices = servicesByCategory[category as keyof typeof servicesByCategory] || [];
  const existingServices = formData.existingServices[category] || [];
  const customServices = formData.customServices[category] || [];
  const selectedServices = formData.selectedServices[category] || [];
  
  // Calculate counts correctly
  const existingCount = existingServices.length;
  const selectedFromDefaultsCount = selectedServices.filter(serviceName => 
    !existingServices.some(existing => existing.name === serviceName)
  ).length;
  const customCount = customServices.length;
  const totalCount = existingCount + selectedFromDefaultsCount + customCount;
  
  console.log(`Category ${category}:`, {
    existingCount,
    selectedFromDefaultsCount, 
    customCount,
    totalCount,
    existingServices,
    selectedServices,
    defaultServices: defaultServices.length
  });

  return (
    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className={`p-4 transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
        } ${!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => isEditing && handleCategoryToggle(category)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={!isEditing}
              onChange={() => {}}
              className="mr-3 h-4 w-4 text-[#5B7FA2] rounded border-gray-300"
            />
            <span className="font-medium text-gray-900">{category}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowServices(prev => ({ ...prev, [category]: !prev[category] }));
            }}
            className="text-[#5B7FA2] hover:text-blue-800"
          >
            {showServices[category] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {isSelected && showServices[category] && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          className="border-t border-gray-200"
        >
          <div className="p-4 bg-white space-y-6">
            
            {/* Existing Services from Organization */}
            {existingServices.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-green-700 mb-3">
                  Existing Organization Services:
                </h5>
                <div className="space-y-3">
                  {existingServices.map((service, index) => (
                    <div key={`existing-${service.id || index}`} className="p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-green-800">
                          Existing Service {index + 1}
                        </span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeServiceFromCategory(category, index, true)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove existing service"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-600">Service Name *</label>
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateExistingService(category, index, 'name', e.target.value)}
                            disabled={!isEditing}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                              !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                            }`}
                            placeholder="Enter service name"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-600">Description *</label>
                          <textarea
                            value={service.description}
                            onChange={(e) => updateExistingService(category, index, 'description', e.target.value)}
                            disabled={!isEditing}
                            rows={2}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${
                              !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                            }`}
                            placeholder="Enter service description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Services (Available to Add) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-blue-700">Available Default Services:</h5>
                {isEditing && (
                  <span className="text-xs text-[#5B7FA2]">
                    Check services you want to add
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {defaultServices.map((service, index) => {
                  const isServiceSelected = selectedServices.includes(service.name);
                  const isExistingService = existingServices.some(existing => existing.name === service.name);
                  
                  return (
                    <div 
                      key={`default-${index}`} 
                      className={`p-3 rounded-md border ${
                        isExistingService 
                          ? 'bg-gray-100 border-gray-300' 
                          : isServiceSelected 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={isServiceSelected || isExistingService}
                          disabled={!isEditing || isExistingService}
                          onChange={() => handleServiceToggle(category, service.name)}
                          className="mt-1 h-4 w-4 text-[#5B7FA2] rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className={`font-medium text-sm ${
                            isExistingService ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {service.name}
                            {isExistingService && (
                              <span className="ml-2 text-xs text-green-600 font-medium">
                                (Already Added)
                              </span>
                            )}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isExistingService ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Services Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-medium text-purple-700">Additional Custom Services:</h5>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => addServiceToCategory(category)}
                    className="flex items-center text-xs text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Custom Service
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {customServices.map((service, index) => (
                  <div key={`custom-${index}`} className="p-3 bg-purple-50 rounded-md border border-purple-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-purple-800">
                        Custom Service {index + 1}
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeServiceFromCategory(category, index, false)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove custom service"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600">Service Name *</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateServiceInCategory(category, index, 'name', e.target.value)}
                          disabled={!isEditing}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                            !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                          placeholder="Enter service name"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs text-gray-600">Description *</label>
                        <textarea
                          value={service.description}
                          onChange={(e) => updateServiceInCategory(category, index, 'description', e.target.value)}
                          disabled={!isEditing}
                          rows={2}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                            !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                          placeholder="Enter service description"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {customServices.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-300 rounded-md">
                    No custom services added yet. 
                    {isEditing && (
                      <span> Click "Add Custom Service" to add one.</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">Existing:</span> {existingCount} services
                </div>
                <div>
                  <span className="font-medium">Selected from defaults:</span> {selectedFromDefaultsCount} services
                </div>
                <div>
                  <span className="font-medium">Custom services:</span> {customCount} services
                </div>
                <div className="pt-1 border-t border-gray-100">
                  <span className="font-medium text-blue-700">Total:</span> {totalCount} services
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {isSelected && !showServices[category] && (
        <div className="p-3 bg-blue-50 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            {existingCount} existing + {selectedFromDefaultsCount} selected + {customCount} custom services
            <button
              type="button"
              onClick={() => setShowServices(prev => ({ ...prev, [category]: true }))}
              className="ml-2 text-xs text-[#5B7FA2] hover:text-blue-800 underline"
            >
              View Details
            </button>
          </p>
        </div>
      )}
    </div>
  );
})}
            </div>
            {errors.selectedCategories && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedCategories}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-[#5B7FA2]" />
          Address Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={formData.address.country}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
            <select
              value={formData.address.province}
              onChange={(e) => handleInputChange('address.province', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select Province</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
            <select
              value={formData.address.district}
              onChange={(e) => handleInputChange('address.district', e.target.value)}
              disabled={!isEditing || !formData.address.province}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing || !formData.address.province ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
            <select
              value={formData.address.sector}
              onChange={(e) => handleInputChange('address.sector', e.target.value)}
              disabled={!isEditing || !formData.address.district}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing || !formData.address.district ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select Sector</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cell</label>
            <select
              value={formData.address.cell}
              onChange={(e) => handleInputChange('address.cell', e.target.value)}
              disabled={!isEditing || !formData.address.sector}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing || !formData.address.sector ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select Cell</option>
              {cells.map((cell) => (
                <option key={cell} value={cell}>
                  {cell}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
            <select
              value={formData.address.village}
              onChange={(e) => handleInputChange('address.village', e.target.value)}
              disabled={!isEditing || !formData.address.cell}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing || !formData.address.cell ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            >
              <option value="">Select Village</option>
              {villages.map((village) => (
                <option key={village} value={village}>
                  {village}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
            <input
              type="text"
              value={formData.address.houseNumber}
              onChange={(e) => handleInputChange('address.houseNumber', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter house number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
            <input
              type="text"
              value={formData.address.poBox}
              onChange={(e) => handleInputChange('address.poBox', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter P.O. Box"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-[#5B7FA2]" />
          Business Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TIN Number *</label>
            <input
              type="text"
              value={formData.tinNumber}
              onChange={(e) => handleInputChange('tinNumber', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter TIN number"
            />
            {errors.tinNumber && <p className="text-red-500 text-sm mt-1">{errors.tinNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter registration number"
            />
            {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date *</label>
            <input
              type="date"
              value={formData.registrationDate}
              onChange={(e) => handleInputChange('registrationDate', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            />
            {errors.registrationDate && <p className="text-red-500 text-sm mt-1">{errors.registrationDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Sector *</label>
            <input
              type="text"
              value={formData.businessSector}
              onChange={(e) => handleInputChange('businessSector', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Enter business sector"
            />
            {errors.businessSector && <p className="text-red-500 text-sm mt-1">{errors.businessSector}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="+250 XXX XXX XXX"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="organization@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={!isEditing}
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="Describe your organization's mission and services"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center pt-6 mb-2">
      <button
        type="button"
        onClick={handlePrevious}
        disabled={currentStep === 1}
        className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
          currentStep === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </button>

      <div className="text-sm text-gray-500">
        Step {currentStep} of 3
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={currentStep === 3}
        className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
          currentStep === 3
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-[#5B7FA2] text-white hover:bg-blue-700'
        }`}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );

  const renderActionButtons = () => {
    // Only show edit button when not in editing mode
    if (!isEditing) {
      return (
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        </div>
      );
    }

    // Show cancel/save buttons only on the last step when editing
    if (isEditing && currentStep === 3) {
      return (
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      );
    }

    // Return null for steps 1 and 2 when editing (no action buttons shown)
    return null;
  };

  // Show loading state while fetching organization data
  if (isLoading && !currentOrganization) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#5B7FA2]" />
              <span className="text-gray-600">Loading organization data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="w-8 h-8 text-[#5B7FA2]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Organization Profile' : 'Organization Profile'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditing ? 'Update your organization information' : 'View and manage your organization details'}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Title */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{getStepTitle(currentStep)}</h2>
            {isEditing && (
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                <Edit className="w-4 h-4 mr-1" />
                Editing Mode
              </div>
            )}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </AnimatePresence>

          {/* Navigation Buttons - Always show when we have multiple steps */}
          {renderNavigationButtons()}

          {/* Action Buttons - Context-dependent */}
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default EditOrganizationProfile;