// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import {
    User,
    Building2,
    MapPin,
    Phone,
    Mail,
    Calendar,
    FileText,
    Plus,
    Minus,
    ChevronLeft,
    ChevronRight,
    Save,
    AlertCircle,
    CheckCircle,
    Loader2,
    Upload,
    Eye,
    EyeOff,
    Users,
    Briefcase,
    IdCard,
    Globe,
    X,
    FileX
} from 'lucide-react';

import {
    createIndividualShareholder,
    createInstitutionShareholder,
    uploadShareholderDocument,
    clearError
} from '@/lib/features/auth/shareholderSlice';
import { AppDispatch, RootState } from '@/lib/store';
import toast from 'react-hot-toast';
import rwandaData from '../../../../../../data.json';

type ShareholderType = 'individual' | 'institution';

interface Address {
    country?: string;
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
    street?: string;
    houseNumber?: string;
    poBox?: string;
}

interface KeyRepresentative {
    name: string;
    position: string;
    idPassport: string;
    phone?: string;
    email?: string;
    nationality?: string;
    isAuthorizedSignatory: boolean;
}

interface IndividualFormData {
    firstname: string;
    lastname: string;
    idPassport: string;
    occupation?: string;
    phone?: string;
    email?: string;
    physicalAddress?: Address;
    residentAddress?: Address;
    nationality?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
}

interface InstitutionFormData {
    institutionName: string;
    tradingLicenseNumber: string;
    businessActivity?: string;
    keyRepresentatives: KeyRepresentative[];
    fullAddress?: Address;
    institutionType?: string;
    incorporationDate?: string;
    registrationNumber?: string;
    tinNumber?: string;
    phone?: string;
    email?: string;
    website?: string;
    isGovernmentEntity?: boolean;
    isNonProfit?: boolean;
}

interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

const CreateShareholder: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoading, error } = useSelector((state: RootState) => state.shareholders);
    const { user } = useSelector((state: RootState) => state.auth);

    const organizationId = user?.organizationId;
    const initialType = (searchParams.get('type') as ShareholderType) || 'individual';

    const [shareholderType, setShareholderType] = useState<ShareholderType>(initialType);
    const [currentStep, setCurrentStep] = useState(1);
    const [sameAsPhysical, setSameAsPhysical] = useState(false);

    const [individualData, setIndividualData] = useState<IndividualFormData>({
        firstname: '',
        lastname: '',
        idPassport: '',
        occupation: '',
        phone: '',
        email: '',
        physicalAddress: {
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
        residentAddress: {
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
        nationality: 'Rwandan',
        dateOfBirth: '',
        gender: '',
        maritalStatus: ''
    });

    const resetForm = () => {
        // Reset individual form data
        setIndividualData({
            firstname: '',
            lastname: '',
            idPassport: '',
            occupation: '',
            phone: '',
            email: '',
            physicalAddress: {
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
            residentAddress: {
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
            nationality: 'Rwandan',
            dateOfBirth: '',
            gender: '',
            maritalStatus: ''
        });

        // Reset institution form data
        setInstitutionData({
            institutionName: '',
            tradingLicenseNumber: '',
            businessActivity: '',
            keyRepresentatives: [{
                name: '',
                position: '',
                idPassport: '',
                phone: '',
                email: '',
                nationality: 'Rwandan',
                isAuthorizedSignatory: true
            }],
            fullAddress: {
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
            institutionType: '',
            incorporationDate: '',
            registrationNumber: '',
            tinNumber: '',
            phone: '',
            email: '',
            website: '',
            isGovernmentEntity: false,
            isNonProfit: false
        });

        // Reset other states
        setSameAsPhysical(false);
        setErrors({});
        setUploadedFiles({});
        setFileErrors({});
        setCurrentStep(1);

        // Reset location dropdowns
        setPhysicalDistricts([]);
        setPhysicalSectors([]);
        setPhysicalCells([]);
        setPhysicalVillages([]);
        setResidentDistricts([]);
        setResidentSectors([]);
        setResidentCells([]);
        setResidentVillages([]);
        setInstitutionDistricts([]);
        setInstitutionSectors([]);
        setInstitutionCells([]);
        setInstitutionVillages([]);
    };
    // Institution form state
    const [institutionData, setInstitutionData] = useState<InstitutionFormData>({
        institutionName: '',
        tradingLicenseNumber: '',
        businessActivity: '',
        keyRepresentatives: [{
            name: '',
            position: '',
            idPassport: '',
            phone: '',
            email: '',
            nationality: 'Rwandan',
            isAuthorizedSignatory: true
        }],
        fullAddress: {
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
        institutionType: '',
        incorporationDate: '',
        registrationNumber: '',
        tinNumber: '',
        phone: '',
        email: '',
        website: '',
        isGovernmentEntity: false,
        isNonProfit: false
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

    // Location data states
    const [provinces, setProvinces] = useState<string[]>([]);
    const [physicalDistricts, setPhysicalDistricts] = useState<string[]>([]);
    const [physicalSectors, setPhysicalSectors] = useState<string[]>([]);
    const [physicalCells, setPhysicalCells] = useState<string[]>([]);
    const [physicalVillages, setPhysicalVillages] = useState<string[]>([]);
    const [residentDistricts, setResidentDistricts] = useState<string[]>([]);
    const [residentSectors, setResidentSectors] = useState<string[]>([]);
    const [residentCells, setResidentCells] = useState<string[]>([]);
    const [residentVillages, setResidentVillages] = useState<string[]>([]);
    const [institutionDistricts, setInstitutionDistricts] = useState<string[]>([]);
    const [institutionSectors, setInstitutionSectors] = useState<string[]>([]);
    const [institutionCells, setInstitutionCells] = useState<string[]>([]);
    const [institutionVillages, setInstitutionVillages] = useState<string[]>([]);

    // File validation constants
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const ALLOWED_FILE_TYPES = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf']
    };

    // File validation function
    const validateFile = (file: File, documentType: string): FileValidationResult => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                isValid: false,
                error: `File size exceeds 10MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
            };
        }

        // Check file type
        const allowedTypes = Object.keys(ALLOWED_FILE_TYPES);
        if (!allowedTypes.includes(file.type)) {
            const allowedExtensions = Object.values(ALLOWED_FILE_TYPES).flat().join(', ');
            return {
                isValid: false,
                error: `Invalid file type. Allowed types: ${allowedExtensions}`
            };
        }

        // Additional validation for specific document types
        if (documentType === 'passportPhoto') {
            const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!imageTypes.includes(file.type)) {
                return {
                    isValid: false,
                    error: 'Passport photo must be an image file (JPG, PNG, or WebP)'
                };
            }
        }

        return { isValid: true };
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        dispatch(clearError());
        const provinceList = Object.keys(rwandaData);
        setProvinces(provinceList);
    }, [dispatch, rwandaData]);

    // Location data effects for individual physical address
    useEffect(() => {
        if (individualData.physicalAddress?.province) {
            const provinceData = rwandaData[individualData.physicalAddress.province as keyof typeof rwandaData];
            const districtList = Object.keys(provinceData);
            setPhysicalDistricts(districtList);

            setIndividualData(prev => ({
                ...prev,
                physicalAddress: {
                    ...prev.physicalAddress,
                    district: '',
                    sector: '',
                    cell: '',
                    village: ''
                }
            }));
            setPhysicalSectors([]);
            setPhysicalCells([]);
            setPhysicalVillages([]);
        }
    }, [individualData.physicalAddress?.province]);

    useEffect(() => {
        if (individualData.physicalAddress?.province && individualData.physicalAddress?.district) {
            const provinceData = rwandaData[individualData.physicalAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[individualData.physicalAddress.district as keyof typeof provinceData];
            const sectorList = Object.keys(districtData);
            setPhysicalSectors(sectorList);

            setIndividualData(prev => ({
                ...prev,
                physicalAddress: {
                    ...prev.physicalAddress,
                    sector: '',
                    cell: '',
                    village: ''
                }
            }));
            setPhysicalCells([]);
            setPhysicalVillages([]);
        }
    }, [individualData.physicalAddress?.district]);

    useEffect(() => {
        if (individualData.physicalAddress?.province && individualData.physicalAddress?.district && individualData.physicalAddress?.sector) {
            const provinceData = rwandaData[individualData.physicalAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[individualData.physicalAddress.district as keyof typeof provinceData];
            const sectorData = districtData[individualData.physicalAddress.sector as keyof typeof districtData];
            const cellList = Object.keys(sectorData);
            setPhysicalCells(cellList);

            setIndividualData(prev => ({
                ...prev,
                physicalAddress: {
                    ...prev.physicalAddress,
                    cell: '',
                    village: ''
                }
            }));
            setPhysicalVillages([]);
        }
    }, [individualData.physicalAddress?.sector]);

    useEffect(() => {
        if (individualData.physicalAddress?.province && individualData.physicalAddress?.district && individualData.physicalAddress?.sector && individualData.physicalAddress?.cell) {
            const provinceData = rwandaData[individualData.physicalAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[individualData.physicalAddress.district as keyof typeof provinceData];
            const sectorData = districtData[individualData.physicalAddress.sector as keyof typeof districtData];
            const cellData = sectorData[individualData.physicalAddress.cell as keyof typeof sectorData];

            if (Array.isArray(cellData)) {
                setPhysicalVillages(cellData);

                setIndividualData(prev => ({
                    ...prev,
                    physicalAddress: {
                        ...prev.physicalAddress,
                        village: ''
                    }
                }));
            }
        }
    }, [individualData.physicalAddress?.cell]);

    // Resident address effects
    useEffect(() => {
        if (individualData.residentAddress?.province && !sameAsPhysical) {
            const provinceData = rwandaData[individualData.residentAddress.province as keyof typeof rwandaData];
            const districtList = Object.keys(provinceData);
            setResidentDistricts(districtList);

            setIndividualData(prev => ({
                ...prev,
                residentAddress: {
                    ...prev.residentAddress,
                    district: '',
                    sector: '',
                    cell: '',
                    village: ''
                }
            }));
            setResidentSectors([]);
            setResidentCells([]);
            setResidentVillages([]);
        }
    }, [individualData.residentAddress?.province, sameAsPhysical]);

    useEffect(() => {
        if (individualData.residentAddress?.province && individualData.residentAddress?.district && !sameAsPhysical) {
            const provinceData = rwandaData[individualData.residentAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[individualData.residentAddress.district as keyof typeof provinceData];
            const sectorList = Object.keys(districtData);
            setResidentSectors(sectorList);

            setIndividualData(prev => ({
                ...prev,
                residentAddress: {
                    ...prev.residentAddress,
                    sector: '',
                    cell: '',
                    village: ''
                }
            }));
            setResidentCells([]);
            setResidentVillages([]);
        }
    }, [individualData.residentAddress?.district, sameAsPhysical]);

    useEffect(() => {
        if (individualData.residentAddress?.province && individualData.residentAddress?.district && individualData.residentAddress?.sector && !sameAsPhysical) {
            const provinceData = rwandaData[individualData.residentAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[individualData.residentAddress.district as keyof typeof provinceData];
            const sectorData = districtData[individualData.residentAddress.sector as keyof typeof districtData];
            const cellList = Object.keys(sectorData);
            setResidentCells(cellList);

            setIndividualData(prev => ({
                ...prev,
                residentAddress: {
                    ...prev.residentAddress,
                    cell: '',
                    village: ''
                }
            }));
            setResidentVillages([]);
        }
    }, [individualData.residentAddress?.sector, sameAsPhysical]);

    useEffect(() => {
        if (individualData.residentAddress?.province && individualData.residentAddress?.district && individualData.residentAddress?.sector && individualData.residentAddress?.cell && !sameAsPhysical) {
            const provinceData = rwandaData[individualData.residentAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[individualData.residentAddress.district as keyof typeof provinceData];
            const sectorData = districtData[individualData.residentAddress.sector as keyof typeof districtData];
            const cellData = sectorData[individualData.residentAddress.cell as keyof typeof sectorData];

            if (Array.isArray(cellData)) {
                setResidentVillages(cellData);

                setIndividualData(prev => ({
                    ...prev,
                    residentAddress: {
                        ...prev.residentAddress,
                        village: ''
                    }
                }));
            }
        }
    }, [individualData.residentAddress?.cell, sameAsPhysical]);

    // Institution address effects
    useEffect(() => {
        if (institutionData.fullAddress?.province) {
            const provinceData = rwandaData[institutionData.fullAddress.province as keyof typeof rwandaData];
            const districtList = Object.keys(provinceData);
            setInstitutionDistricts(districtList);

            setInstitutionData(prev => ({
                ...prev,
                fullAddress: {
                    ...prev.fullAddress,
                    district: '',
                    sector: '',
                    cell: '',
                    village: ''
                }
            }));
            setInstitutionSectors([]);
            setInstitutionCells([]);
            setInstitutionVillages([]);
        }
    }, [institutionData.fullAddress?.province]);

    useEffect(() => {
        if (institutionData.fullAddress?.province && institutionData.fullAddress?.district) {
            const provinceData = rwandaData[institutionData.fullAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[institutionData.fullAddress.district as keyof typeof provinceData];
            const sectorList = Object.keys(districtData);
            setInstitutionSectors(sectorList);

            setInstitutionData(prev => ({
                ...prev,
                fullAddress: {
                    ...prev.fullAddress,
                    sector: '',
                    cell: '',
                    village: ''
                }
            }));
            setInstitutionCells([]);
            setInstitutionVillages([]);
        }
    }, [institutionData.fullAddress?.district]);

    useEffect(() => {
        if (institutionData.fullAddress?.province && institutionData.fullAddress?.district && institutionData.fullAddress?.sector) {
            const provinceData = rwandaData[institutionData.fullAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[institutionData.fullAddress.district as keyof typeof provinceData];
            const sectorData = districtData[institutionData.fullAddress.sector as keyof typeof districtData];
            const cellList = Object.keys(sectorData);
            setInstitutionCells(cellList);

            setInstitutionData(prev => ({
                ...prev,
                fullAddress: {
                    ...prev.fullAddress,
                    cell: '',
                    village: ''
                }
            }));
            setInstitutionVillages([]);
        }
    }, [institutionData.fullAddress?.sector]);

    useEffect(() => {
        if (institutionData.fullAddress?.province && institutionData.fullAddress?.district && institutionData.fullAddress?.sector && institutionData.fullAddress?.cell) {
            const provinceData = rwandaData[institutionData.fullAddress.province as keyof typeof rwandaData];
            const districtData = provinceData[institutionData.fullAddress.district as keyof typeof provinceData];
            const sectorData = districtData[institutionData.fullAddress.sector as keyof typeof districtData];
            const cellData = sectorData[institutionData.fullAddress.cell as keyof typeof sectorData];

            if (Array.isArray(cellData)) {
                setInstitutionVillages(cellData);

                setInstitutionData(prev => ({
                    ...prev,
                    fullAddress: {
                        ...prev.fullAddress,
                        village: ''
                    }
                }));
            }
        }
    }, [institutionData.fullAddress?.cell]);

    // Handle same as physical address toggle
    useEffect(() => {
        if (sameAsPhysical) {
            setIndividualData(prev => ({
                ...prev,
                residentAddress: { ...prev.physicalAddress }
            }));
        }
    }, [sameAsPhysical, individualData.physicalAddress]);

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (shareholderType === 'individual') {
            switch (step) {
                case 1: // Basic Information
                    if (!individualData.firstname.trim()) newErrors.firstname = 'First name is required';
                    if (!individualData.lastname.trim()) newErrors.lastname = 'Last name is required';
                    if (!individualData.idPassport.trim()) newErrors.idPassport = 'ID/Passport is required';
                    if (individualData.email && !/\S+@\S+\.\S+/.test(individualData.email)) {
                        newErrors.email = 'Please enter a valid email address';
                    }
                    break;
                case 2: // Address Information
                    if (!individualData.physicalAddress?.province) newErrors.physicalProvince = 'Province is required';
                    if (!individualData.physicalAddress?.district) newErrors.physicalDistrict = 'District is required';
                    if (!individualData.physicalAddress?.sector) newErrors.physicalSector = 'Sector is required';
                    if (!sameAsPhysical) {
                        if (!individualData.residentAddress?.province) newErrors.residentProvince = 'Resident province is required';
                        if (!individualData.residentAddress?.district) newErrors.residentDistrict = 'Resident district is required';
                        if (!individualData.residentAddress?.sector) newErrors.residentSector = 'Resident sector is required';
                    }
                    break;
            }
        } else {
            switch (step) {
                case 1: // Basic Institution Information
                    if (!institutionData.institutionName.trim()) newErrors.institutionName = 'Institution name is required';
                    if (!institutionData.tradingLicenseNumber.trim()) newErrors.tradingLicenseNumber = 'Trading license number is required';
                    if (institutionData.email && !/\S+@\S+\.\S+/.test(institutionData.email)) {
                        newErrors.email = 'Please enter a valid email address';
                    }
                    break;
                case 2: // Key Representatives
                    institutionData.keyRepresentatives.forEach((rep, index) => {
                        if (!rep.name.trim()) newErrors[`rep_${index}_name`] = 'Representative name is required';
                        if (!rep.position.trim()) newErrors[`rep_${index}_position`] = 'Position is required';
                        if (!rep.idPassport.trim()) newErrors[`rep_${index}_idPassport`] = 'ID/Passport is required';
                    });
                    break;
                case 3: // Address Information
                    if (!institutionData.fullAddress?.province) newErrors.institutionProvince = 'Province is required';
                    if (!institutionData.fullAddress?.district) newErrors.institutionDistrict = 'District is required';
                    if (!institutionData.fullAddress?.sector) newErrors.institutionSector = 'Sector is required';
                    break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            const maxSteps = shareholderType === 'individual' ? 3 : 4;
            setCurrentStep(prev => Math.min(prev + 1, maxSteps));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleIndividualInputChange = (field: string, value: any) => {
        const keys = field.split('.');
        if (keys.length === 1) {
            setIndividualData(prev => ({ ...prev, [field]: value }));
        } else if (keys.length === 2) {
            setIndividualData(prev => ({
                ...prev,
                [keys[0]]: {
                    ...prev[keys[0] as keyof IndividualFormData],
                    [keys[1]]: value
                }
            }));
        }

        // Clear related errors
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleInstitutionInputChange = (field: string, value: any) => {
        const keys = field.split('.');
        if (keys.length === 1) {
            setInstitutionData(prev => ({ ...prev, [field]: value }));
        } else if (keys.length === 2) {
            setInstitutionData(prev => ({
                ...prev,
                [keys[0]]: {
                    ...prev[keys[0] as keyof InstitutionFormData],
                    [keys[1]]: value
                }
            }));
        }

        // Clear related errors
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const addKeyRepresentative = () => {
        setInstitutionData(prev => ({
            ...prev,
            keyRepresentatives: [
                ...prev.keyRepresentatives,
                {
                    name: '',
                    position: '',
                    idPassport: '',
                    phone: '',
                    email: '',
                    nationality: 'Rwandan',
                    isAuthorizedSignatory: false
                }
            ]
        }));
    };

    const removeKeyRepresentative = (index: number) => {
        if (institutionData.keyRepresentatives.length > 1) {
            setInstitutionData(prev => ({
                ...prev,
                keyRepresentatives: prev.keyRepresentatives.filter((_, i) => i !== index)
            }));
        }
    };

    const updateKeyRepresentative = (index: number, field: keyof KeyRepresentative, value: any) => {
        setInstitutionData(prev => ({
            ...prev,
            keyRepresentatives: prev.keyRepresentatives.map((rep, i) =>
                i === index ? { ...rep, [field]: value } : rep
            )
        }));

        // Clear related errors
        setErrors(prev => ({ ...prev, [`rep_${index}_${field}`]: '' }));
    };

    const handleSubmit = async () => {
        if (!organizationId) {
            toast.error('No organization selected');
            return;
        }

        const finalStep = shareholderType === 'individual' ? 3 : 4;
        if (!validateStep(finalStep)) return;

        try {
            let result;

            if (shareholderType === 'individual') {
                const shareholderData = {
                    ...individualData,
                    physicalAddress: individualData.physicalAddress,
                    residentAddress: sameAsPhysical ? individualData.physicalAddress : individualData.residentAddress
                };

                result = await dispatch(createIndividualShareholder({
                    organizationId,
                    shareholderData
                })).unwrap();
            } else {
                result = await dispatch(createInstitutionShareholder({
                    organizationId,
                    shareholderData: institutionData
                })).unwrap();
            }

            if (result.success) {
                toast.success(`${shareholderType === 'individual' ? 'Individual' : 'Institution'} shareholder created successfully!`);

                // Handle file uploads if any
                if (Object.keys(uploadedFiles).length > 0 && result.data?.id) {
                    await handleDocumentUploads(result.data.id);
                }

                // Reset form after successful creation
                resetForm();

                // Optional: navigate away or keep form for another entry
                // router.push('/dashboard/shareholders');
            }
        } catch (error) {
            console.error('Failed to create shareholder:', error);
        }
    };

    const handleDocumentUploads = async (shareholderId: number) => {
        try {
            const uploadPromises = Object.entries(uploadedFiles).map(([documentType, file]) =>
                dispatch(uploadShareholderDocument({
                    organizationId: organizationId!,
                    shareholderType,
                    shareholderId,
                    documentType,
                    file
                })).unwrap()
            );

            await Promise.all(uploadPromises);
            toast.success('Documents uploaded successfully!');
        } catch (error) {
            console.error('Failed to upload documents:', error);
            toast.error('Some documents failed to upload');
        }
    };

    const handleFileChange = (documentType: string, file: File | null) => {
        if (file) {
            // Validate file before setting
            const validation = validateFile(file, documentType);

            if (!validation.isValid) {
                setFileErrors(prev => ({ ...prev, [documentType]: validation.error! }));
                toast.error(validation.error!);
                return;
            }

            // Clear any previous errors for this document type
            setFileErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[documentType];
                return newErrors;
            });

            setUploadedFiles(prev => ({ ...prev, [documentType]: file }));
            toast.success(`${file.name} uploaded successfully`);
        } else {
            setUploadedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[documentType];
                return newFiles;
            });
            setFileErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[documentType];
                return newErrors;
            });
        }
    };

    const removeFile = (documentType: string) => {
        setUploadedFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[documentType];
            return newFiles;
        });
        setFileErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[documentType];
            return newErrors;
        });
    };

    const renderStepIndicator = () => {
        const maxSteps = shareholderType === 'individual' ? 3 : 4;
        return (
            <div className="flex items-center justify-center mb-8">
                {Array.from({ length: maxSteps }, (_, i) => i + 1).map((step) => (
                    <div key={step} className="flex items-center">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step <= currentStep
                                ? 'bg-[#5B7FA2] border-[#5B7FA2] text-white'
                                : 'border-gray-300 text-gray-500'
                                }`}
                        >
                            {step < currentStep ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <span className="text-sm font-semibold">{step}</span>
                            )}
                        </div>
                        {step < maxSteps && (
                            <div
                                className={`w-16 h-0.5 mx-2 ${step < currentStep ? 'bg-[#5B7FA2]' : 'bg-gray-300'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderShareholderTypeSelector = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
        >
            <div className="bg-white p-2 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-2 text-center">
                    Select Shareholder Type
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setShareholderType('individual');
                            setCurrentStep(1);
                            setErrors({});
                        }}
                        className={`p-3 rounded-md border transition-all text-sm ${shareholderType === 'individual'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <User className="w-5 h-5 mx-auto mb-1" />
                        <h4 className="font-medium mb-1 text-sm">Individual</h4>
                        <p className="text-xs text-gray-600">
                            Natural person owning shares
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setShareholderType('institution');
                            setCurrentStep(1);
                            setErrors({});
                        }}
                        className={`p-3 rounded-md border transition-all text-sm ${shareholderType === 'institution'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <Building2 className="w-5 h-5 mx-auto mb-1" />
                        <h4 className="font-medium mb-1 text-sm">Institution</h4>
                        <p className="text-xs text-gray-600">
                            Organization or company owning shares
                        </p>
                    </button>
                </div>
            </div>
        </motion.div>
    );

    // File upload component with validation
    const renderFileUpload = (
        documentType: string,
        label: string,
        required: boolean = false,
        accept: string = ".pdf,.jpg,.jpeg,.png"
    ) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${fileErrors[documentType] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                {uploadedFiles[documentType] ? (
                    // File uploaded state
                    <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                            <FileText className="w-6 h-6 text-green-500" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                                    {uploadedFiles[documentType].name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(uploadedFiles[documentType].size)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(documentType)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                                title="Remove file"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Upload state
                    <div>
                        <input
                            type="file"
                            accept={accept}
                            onChange={(e) => handleFileChange(documentType, e.target.files?.[0] || null)}
                            className="hidden"
                            id={documentType}
                        />
                        <label htmlFor={documentType} className="cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-1">
                                Click to upload {label.toLowerCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                                Max size: 10MB | Formats: PDF, JPG, PNG
                            </p>
                        </label>
                    </div>
                )}
            </div>

            {fileErrors[documentType] && (
                <div className="flex items-center space-x-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{fileErrors[documentType]}</span>
                </div>
            )}
        </div>
    );

    const renderIndividualStep1 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                    Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                        </label>
                        <input
                            type="text"
                            value={individualData.firstname}
                            onChange={(e) => handleIndividualInputChange('firstname', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter first name"
                        />
                        {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                        </label>
                        <input
                            type="text"
                            value={individualData.lastname}
                            onChange={(e) => handleIndividualInputChange('lastname', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter last name"
                        />
                        {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID/Passport Number *
                        </label>
                        <input
                            type="text"
                            value={individualData.idPassport}
                            onChange={(e) => handleIndividualInputChange('idPassport', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter ID or passport number"
                        />
                        {errors.idPassport && <p className="text-red-500 text-sm mt-1">{errors.idPassport}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Occupation
                        </label>
                        <input
                            type="text"
                            value={individualData.occupation || ''}
                            onChange={(e) => handleIndividualInputChange('occupation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter occupation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <PhoneInput
                            defaultCountry="rw"
                            value={individualData.phone || ''}
                            onChange={(phone) => handleIndividualInputChange('phone', phone)}
                            inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            countrySelectorStyleProps={{
                                buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                                dropdownStyleProps: {
                                    className: "z-50 max-h-60 overflow-y-auto"
                                }
                            }}
                            placeholder="+250 XXX XXX XXX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={individualData.email || ''}
                            onChange={(e) => handleIndividualInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email address"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nationality
                        </label>
                        <select
                            value={individualData.nationality || 'Rwandan'}
                            onChange={(e) => handleIndividualInputChange('nationality', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Rwandan">Rwandan</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={individualData.dateOfBirth || ''}
                            onChange={(e) => handleIndividualInputChange('dateOfBirth', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <select
                            value={individualData.gender || ''}
                            onChange={(e) => handleIndividualInputChange('gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Marital Status
                        </label>
                        <select
                            value={individualData.maritalStatus || ''}
                            onChange={(e) => handleIndividualInputChange('maritalStatus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select marital status</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                        </select>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderAddressForm = (
        addressData: Address | undefined,
        onChange: (field: string, value: string) => void,
        prefix: string,
        title: string,
        districts: string[],
        sectors: string[],
        cells: string[],
        villages: string[]
    ) => (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-md font-semibold mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-[#5B7FA2]" />
                {title}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                        type="text"
                        value={addressData?.country || 'Rwanda'}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                    <select
                        value={addressData?.province || ''}
                        onChange={(e) => onChange(`${prefix}.province`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select province</option>
                        {provinces.map((province) => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                    {errors[`${prefix}Province`] && <p className="text-red-500 text-sm mt-1">{errors[`${prefix}Province`]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                    <select
                        value={addressData?.district || ''}
                        onChange={(e) => onChange(`${prefix}.district`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!addressData?.province}
                    >
                        <option value="">Select district</option>
                        {districts.map((district) => (
                            <option key={district} value={district}>{district}</option>
                        ))}
                    </select>
                    {errors[`${prefix}District`] && <p className="text-red-500 text-sm mt-1">{errors[`${prefix}District`]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
                    <select
                        value={addressData?.sector || ''}
                        onChange={(e) => onChange(`${prefix}.sector`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!addressData?.district}
                    >
                        <option value="">Select sector</option>
                        {sectors.map((sector) => (
                            <option key={sector} value={sector}>{sector}</option>
                        ))}
                    </select>
                    {errors[`${prefix}Sector`] && <p className="text-red-500 text-sm mt-1">{errors[`${prefix}Sector`]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cell</label>
                    <select
                        value={addressData?.cell || ''}
                        onChange={(e) => onChange(`${prefix}.cell`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!addressData?.sector}
                    >
                        <option value="">Select cell</option>
                        {cells.map((cell) => (
                            <option key={cell} value={cell}>{cell}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                    <select
                        value={addressData?.village || ''}
                        onChange={(e) => onChange(`${prefix}.village`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!addressData?.cell}
                    >
                        <option value="">Select village</option>
                        {villages.map((village) => (
                            <option key={village} value={village}>{village}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                    <input
                        type="text"
                        value={addressData?.street || ''}
                        onChange={(e) => onChange(`${prefix}.street`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter street name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
                    <input
                        type="text"
                        value={addressData?.houseNumber || ''}
                        onChange={(e) => onChange(`${prefix}.houseNumber`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter house number"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">P.O. Box</label>
                    <input
                        type="text"
                        value={addressData?.poBox || ''}
                        onChange={(e) => onChange(`${prefix}.poBox`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter P.O. Box"
                    />
                </div>
            </div>
        </div>
    );

    const renderIndividualStep2 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* Physical Address */}
            {renderAddressForm(
                individualData.physicalAddress,
                handleIndividualInputChange,
                'physicalAddress',
                'Physical Address',
                physicalDistricts,
                physicalSectors,
                physicalCells,
                physicalVillages
            )}

            {/* Same as Physical Address Toggle */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={sameAsPhysical}
                        onChange={(e) => setSameAsPhysical(e.target.checked)}
                        className="mr-3 h-4 w-4 text-[#5B7FA2] rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-blue-800">
                        Resident address is the same as physical address
                    </span>
                </label>
            </div>

            {/* Resident Address */}
            {!sameAsPhysical && renderAddressForm(
                individualData.residentAddress,
                handleIndividualInputChange,
                'residentAddress',
                'Resident Address',
                residentDistricts,
                residentSectors,
                residentCells,
                residentVillages
            )}
        </motion.div>
    );

    const renderIndividualStep3 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                    Document Upload
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFileUpload('idProof', 'ID/Passport Document', false)}
                    {renderFileUpload('passportPhoto', 'Passport Photo', false, '.jpg,.jpeg,.png')}
                    {renderFileUpload('proofOfResidence', 'Proof of Residence', false)}
                </div>

                {/* File upload guidelines */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Upload Guidelines:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Maximum file size: 10MB per document</li>
                        <li>• Supported formats: PDF, JPG, PNG</li>
                        <li>• Passport photo must be an image file (JPG, PNG, WebP)</li>
                        <li>• Ensure documents are clear and legible</li>
                        <li>• All documents are optional but recommended for verification</li>
                    </ul>
                </div>
            </div>
        </motion.div>
    );

    const renderInstitutionStep1 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                    Institution Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institution Name *
                        </label>
                        <input
                            type="text"
                            value={institutionData.institutionName}
                            onChange={(e) => handleInstitutionInputChange('institutionName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter institution name"
                        />
                        {errors.institutionName && <p className="text-red-500 text-sm mt-1">{errors.institutionName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trading License Number *
                        </label>
                        <input
                            type="text"
                            value={institutionData.tradingLicenseNumber}
                            onChange={(e) => handleInstitutionInputChange('tradingLicenseNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter trading license number"
                        />
                        {errors.tradingLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.tradingLicenseNumber}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institution Type
                        </label>
                        <select
                            value={institutionData.institutionType || ''}
                            onChange={(e) => handleInstitutionInputChange('institutionType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select institution type</option>
                            <option value="Company">Company</option>
                            <option value="NGO">NGO</option>
                            <option value="Government">Government Entity</option>
                            <option value="Cooperative">Cooperative</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Registration Number
                        </label>
                        <input
                            type="text"
                            value={institutionData.registrationNumber || ''}
                            onChange={(e) => handleInstitutionInputChange('registrationNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter registration number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            TIN Number
                        </label>
                        <input
                            type="text"
                            value={institutionData.tinNumber || ''}
                            onChange={(e) => handleInstitutionInputChange('tinNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter TIN number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Incorporation Date
                        </label>
                        <input
                            type="date"
                            value={institutionData.incorporationDate || ''}
                            onChange={(e) => handleInstitutionInputChange('incorporationDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                        </label>
                        <PhoneInput
                            defaultCountry="rw"
                            value={institutionData.phone || ''}
                            onChange={(phone) => handleInstitutionInputChange('phone', phone)}
                            inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            countrySelectorStyleProps={{
                                buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                                dropdownStyleProps: {
                                    className: "z-50 max-h-60 overflow-y-auto"
                                }
                            }}
                            placeholder="+250 XXX XXX XXX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={institutionData.email || ''}
                            onChange={(e) => handleInstitutionInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter email address"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                        </label>
                        <input
                            type="url"
                            value={institutionData.website || ''}
                            onChange={(e) => handleInstitutionInputChange('website', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Business Activity
                        </label>
                        <textarea
                            value={institutionData.businessActivity || ''}
                            onChange={(e) => handleInstitutionInputChange('businessActivity', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the main business activities"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={institutionData.isGovernmentEntity || false}
                                    onChange={(e) => handleInstitutionInputChange('isGovernmentEntity', e.target.checked)}
                                    className="mr-2 h-4 w-4 text-[#5B7FA2] rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Government Entity</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={institutionData.isNonProfit || false}
                                    onChange={(e) => handleInstitutionInputChange('isNonProfit', e.target.checked)}
                                    className="mr-2 h-4 w-4 text-[#5B7FA2] rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Non-Profit Organization</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderInstitutionStep2 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center">
                        <Users className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                        Key Representatives
                    </h3>
                    <button
                        type="button"
                        onClick={addKeyRepresentative}
                        className="flex items-center px-3 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Representative
                    </button>
                </div>

                <div className="space-y-6">
                    {institutionData.keyRepresentatives.map((rep, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-gray-900">Representative {index + 1}</h4>
                                {institutionData.keyRepresentatives.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeKeyRepresentative(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={rep.name}
                                        onChange={(e) => updateKeyRepresentative(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter full name"
                                    />
                                    {errors[`rep_${index}_name`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`rep_${index}_name`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Position *
                                    </label>
                                    <input
                                        type="text"
                                        value={rep.position}
                                        onChange={(e) => updateKeyRepresentative(index, 'position', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter position/title"
                                    />
                                    {errors[`rep_${index}_position`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`rep_${index}_position`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ID/Passport *
                                    </label>
                                    <input
                                        type="text"
                                        value={rep.idPassport}
                                        onChange={(e) => updateKeyRepresentative(index, 'idPassport', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter ID or passport number"
                                    />
                                    {errors[`rep_${index}_idPassport`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`rep_${index}_idPassport`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <PhoneInput
                                        defaultCountry="rw"
                                        value={rep.phone || ''}
                                        onChange={(phone) => updateKeyRepresentative(index, 'phone', phone)}
                                        inputClassName="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        countrySelectorStyleProps={{
                                            buttonClassName: "px-3 border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-white",
                                            dropdownStyleProps: {
                                                className: "z-50 max-h-60 overflow-y-auto"
                                            }
                                        }}
                                        placeholder="+250 XXX XXX XXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={rep.email || ''}
                                        onChange={(e) => updateKeyRepresentative(index, 'email', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nationality
                                    </label>
                                    <select
                                        value={rep.nationality || 'Rwandan'}
                                        onChange={(e) => updateKeyRepresentative(index, 'nationality', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Rwandan">Rwandan</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={rep.isAuthorizedSignatory}
                                            onChange={(e) => updateKeyRepresentative(index, 'isAuthorizedSignatory', e.target.checked)}
                                            className="mr-3 h-4 w-4 text-[#5B7FA2] rounded border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Authorized Signatory (can sign documents on behalf of the institution)
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderInstitutionStep3 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {renderAddressForm(
                institutionData.fullAddress,
                handleInstitutionInputChange,
                'fullAddress',
                'Institution Address',
                institutionDistricts,
                institutionSectors,
                institutionCells,
                institutionVillages
            )}
        </motion.div>
    );

    const renderInstitutionStep4 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-[#5B7FA2]" />
                    Document Upload
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderFileUpload('tradingLicense', 'Trading License', true)}
                    {renderFileUpload('certificateOfIncorporation', 'Certificate of Incorporation', false)}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Upload Guidelines:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Maximum file size: 10MB per document</li>
                        <li>• Supported formats: PDF, JPG, PNG</li>
                        <li>• Trading License is required for verification</li>
                        <li>• Ensure documents are clear and legible</li>
                        <li>• Certificate of Incorporation is recommended but optional</li>
                    </ul>
                </div>
            </div>
        </motion.div>
    );

    const renderNavigationButtons = () => {
        const maxSteps = shareholderType === 'individual' ? 3 : 4;

        return (
            <div className="flex justify-between items-center pt-6">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`flex items-center px-6 py-2 rounded-lg transition-colors ${currentStep === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </button>

                <div className="text-sm text-gray-500">
                    Step {currentStep} of {maxSteps}
                </div>

                {currentStep < maxSteps ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center px-6 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                ) : (
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Create Shareholder
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Clear Form
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderStepContent = () => {
        if (shareholderType === 'individual') {
            switch (currentStep) {
                case 1: return renderIndividualStep1();
                case 2: return renderIndividualStep2();
                case 3: return renderIndividualStep3();
                default: return null;
            }
        } else {
            switch (currentStep) {
                case 1: return renderInstitutionStep1();
                case 2: return renderInstitutionStep2();
                case 3: return renderInstitutionStep3();
                case 4: return renderInstitutionStep4();
                default: return null;
            }
        }
    };

    if (!organizationId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Organization Selected</h2>
                    <p className="text-gray-600">Please select an organization to create shareholders.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 px-4 py-2 bg-[#5B7FA2] text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-3">
            <div className="max-w-4xl mx-auto px-1 sm:px-2 lg:px-3">
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                        <div
                            className={`p-2 rounded-full ${shareholderType === 'individual' ? 'bg-blue-100' : 'bg-green-100'
                                }`}
                        >
                            {shareholderType === 'individual' ? (
                                <User className="w-5 h-5 text-[#5B7FA2]" />
                            ) : (
                                <Building2 className="w-5 h-5 text-green-600" />
                            )}
                        </div>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Create {shareholderType === 'individual' ? 'Individual' : 'Institution'} Shareholder
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Add a new {shareholderType === 'individual' ? 'individual' : 'institutional'} shareholder
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md"
                    >
                        <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-600 mr-1" />
                            <span className="text-xs text-red-800">{error}</span>
                        </div>
                    </motion.div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-3">
                        {renderShareholderTypeSelector()}

                        {renderStepIndicator()}

                        <AnimatePresence mode="wait">
                            {renderStepContent()}
                        </AnimatePresence>

                        {renderNavigationButtons()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateShareholder;