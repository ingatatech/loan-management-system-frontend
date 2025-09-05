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
  User,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

import { createOrganization, clearError } from '@/lib/features/auth/organization-slice';
import { AppDispatch, RootState } from '@/lib/store';
import toast from 'react-hot-toast';
import rwandaData from '../../../../../../data.json';

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
  customServices: Record<string, Array<{name: string, description: string}>>;

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

  adminUser: {
    username: string;
    email: string;
    phone: string;
  };
}

const CreateOrganization: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error } = useSelector((state: RootState) => state.organizations);

  const [currentStep, setCurrentStep] = useState(1);

   const initialFormData: FormData = {
    name: '',
    selectedCategories: [],
    customServices: {},
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
    email: '',
    adminUser: {
      username: '',
      email: '',
      phone: ''
    }
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
 const clearForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setErrors({});
    setExpandedCategories({});
    setShowServices({});
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showServices, setShowServices] = useState<Record<string, boolean>>({});

  const [provinces, setProvinces] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [cells, setCells] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    const provinceList = Object.keys(rwandaData);
    setProvinces(provinceList);
  }, []);

  useEffect(() => {
    if (formData.address.province) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData];
      const districtList = Object.keys(provinceData);
      setDistricts(districtList);
      
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          district: '',
          sector: '',
          cell: '',
          village: ''
        }
      }));
      setSectors([]);
      setCells([]);
      setVillages([]);
    }
  }, [formData.address.province]);

  useEffect(() => {
    if (formData.address.province && formData.address.district) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData];
      const districtData = provinceData[formData.address.district as keyof typeof provinceData];
      const sectorList = Object.keys(districtData);
      setSectors(sectorList);
      
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          sector: '',
          cell: '',
          village: ''
        }
      }));
      setCells([]);
      setVillages([]);
    }
  }, [formData.address.district]);

  useEffect(() => {
    if (formData.address.province && formData.address.district && formData.address.sector) {
      const provinceData = rwandaData[formData.address.province as keyof typeof rwandaData];
      const districtData = provinceData[formData.address.district as keyof typeof provinceData];
      const sectorData = districtData[formData.address.sector as keyof typeof districtData];
      const cellList = Object.keys(sectorData);
      setCells(cellList);
      
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          cell: '',
          village: ''
        }
      }));
      setVillages([]);
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
        
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            village: ''
          }
        }));
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
      case 4:
        if (!formData.adminUser.username.trim()) newErrors.adminUsername = 'Admin username is required';
        if (!formData.adminUser.email.trim()) newErrors.adminEmail = 'Admin email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.adminUser.email)) newErrors.adminEmail = 'Admin email is invalid';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
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
      setFormData(prev => ({
        ...prev,
        selectedCategories: prev.selectedCategories.filter(c => c !== category),
        customServices: Object.fromEntries(
          Object.entries(prev.customServices).filter(([key]) => key !== category)
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedCategories: [...prev.selectedCategories, category],
        customServices: {
          ...prev.customServices,
          [category]: []
        }
      }));
    }
    setExpandedCategories(prev => ({ ...prev, [category]: !isSelected }));
  };

  
const [isSubmitting, setIsSubmitting] = useState(false);
 const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    
    try {
      const categoriesData = formData.selectedCategories.map(category => {
        const defaultServices = servicesByCategory[category as keyof typeof servicesByCategory];
        const customServices = formData.customServices[category] || [];
        
        const validCustomServices = customServices.filter(
          service => service.name.trim() !== '' && service.description.trim() !== ''
        );
        
        return {
          name: category,
          services: [...defaultServices, ...validCustomServices]
        };
      });

      const organizationData = {
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
        email: formData.email,
        adminUser: formData.adminUser
      };

      const result = await dispatch(createOrganization(organizationData)).unwrap();
      
      if (result.success) {
        toast.success('Organization created successfully!', {
          duration: 4000,
          position: 'top-right',
        });
        
        clearForm();
        
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      if (!error) {
        toast.error('Failed to create organization. Please try again.', {
          duration: 4000,
          position: 'top-right',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const removeServiceFromCategory = (category: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      customServices: {
        ...prev.customServices,
        [category]: prev.customServices[category].filter((_, i) => i !== index)
      }
    }));
  };

  const updateServiceInCategory = (category: string, index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      customServices: {
        ...prev.customServices,
        [category]: prev.customServices[category].map((service, i) => 
          i === index ? { ...service, [field]: value } : service
        )
      }
    }));
  };

  const getStepIcon = (step: number) => {
    const icons = [Building2, MapPin, Briefcase, User];
    const Icon = icons[step - 1];
    return <Icon className="w-5 h-5" />;
  };

  const getStepTitle = (step: number) => {
    const titles = ['Basic Information', 'Address Details', 'Business Details', 'Admin User'];
    return titles[step - 1];
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step <= currentStep
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-500'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              getStepIcon(step)
            )}
          </div>
          {step < 4 && (
            <div
              className={`w-24 h-0.5 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
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
          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter organization name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selected Categories *
            </label>
            <div className="space-y-3">
              {AVAILABLE_CATEGORIES.map((category) => {
                const isSelected = formData.selectedCategories.includes(category);
                const defaultServices = servicesByCategory[category as keyof typeof servicesByCategory];
                const customServices = formData.customServices[category] || [];
                
                return (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                      onClick={() => handleCategoryToggle(category)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="font-medium text-gray-900">{category}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowServices(prev => ({ ...prev, [category]: !prev[category] }));
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {showServices[category] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-4 bg-white">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Services for this category:
                          </h4>
                          
                          {showServices[category] && (
                            <div className="space-y-4">
                              {/* Default services (always available) */}
                              <div>
                                <h5 className="text-xs font-medium text-gray-600 mb-2">Default Services:</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                  {defaultServices.map((service, index) => (
                                    <div key={`default-${index}`} className="p-3 bg-gray-50 rounded-md">
                                      <div className="font-medium text-sm text-gray-900">{service.name}</div>
                                      <div className="text-xs text-gray-600 mt-1">{service.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Custom services (editable) */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-xs font-medium text-gray-600">Additional Custom Services:</h5>
                                  <button
                                    type="button"
                                    onClick={() => addServiceToCategory(category)}
                                    className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Custom Service
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  {customServices.map((service, index) => (
                                    <div key={index} className="p-3 bg-blue-50 rounded-md border border-blue-100">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-medium text-blue-800">Custom Service {index + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() => removeServiceFromCategory(category, index)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </button>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <div>
                                          <label className="text-xs text-gray-600">Service Name *</label>
                                          <input
                                            type="text"
                                            value={service.name}
                                            onChange={(e) => updateServiceInCategory(category, index, 'name', e.target.value)}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Enter service name"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="text-xs text-gray-600">Description *</label>
                                          <textarea
                                            value={service.description}
                                            onChange={(e) => updateServiceInCategory(category, index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="Enter service description"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {customServices.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                      No custom services added yet. Click "Add Custom Service" to add one.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {!showServices[category] && (
                            <p className="text-sm text-gray-600">
                              {defaultServices.length} default services
                              {customServices.length > 0 ? ` + ${customServices.length} custom services` : ''}
                            </p>
                          )}
                        </div>
                      </motion.div>
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
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.address.province}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.address.district}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.address.sector}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!formData.address.cell}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
            <input
              type="text"
              value={formData.address.houseNumber}
              onChange={(e) => handleInputChange('address.houseNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter house number"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
            <input
              type="text"
              value={formData.address.poBox}
              onChange={(e) => handleInputChange('address.poBox', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
          Business Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TIN Number *</label>
            <input
              type="text"
              value={formData.tinNumber}
              onChange={(e) => handleInputChange('tinNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.registrationDate && <p className="text-red-500 text-sm mt-1">{errors.registrationDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Sector *</label>
            <input
              type="text"
              value={formData.businessSector}
              onChange={(e) => handleInputChange('businessSector', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="organization@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your organization's mission and services"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );


  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-600" />
          Administrator Account
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
            <input
              type="text"
              value={formData.adminUser.username}
              onChange={(e) => handleInputChange('adminUser.username', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin username"
            />
            {errors.adminUsername && <p className="text-red-500 text-sm mt-1">{errors.adminUsername}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.adminUser.email}
              onChange={(e) => handleInputChange('adminUser.email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
            />
            {errors.adminEmail && <p className="text-red-500 text-sm mt-1">{errors.adminEmail}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.adminUser.phone}
              onChange={(e) => handleInputChange('adminUser.phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+250 XXX XXX XXX"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">Administrator Account Information</p>
              <p className="text-blue-700">
                A temporary password will be generated automatically and sent to the administrator's email address.
                The administrator will be required to change their password on first login.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Review Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Organization Name:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Categories:</span>
            <span className="font-medium">{formData.selectedCategories.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">
              {formData.address.sector}, {formData.address.district}, {formData.address.province}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Admin User:</span>
            <span className="font-medium">{formData.adminUser.username}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center pt-6">
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
        Step {currentStep} of 4
      </div>

      {currentStep < 4 ? (
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      ) : (
<button
  type="button"
  onClick={handleSubmit}
  disabled={isLoading || isSubmitting}
  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {(isLoading || isSubmitting) ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Creating...
    </>
  ) : (
    <>
      <CheckCircle className="w-4 h-4 mr-2" />
      Create Organization
    </>
  )}
</button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
        <div className="toast-container">
        {/* This will be where the toasts appear */}
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Organization</h1>
          <p className="mt-2 text-gray-600">Set up a new financial services organization with admin user</p>
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{getStepTitle(currentStep)}</h2>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>

          {/* Navigation */}
          {renderNavigationButtons()}
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;