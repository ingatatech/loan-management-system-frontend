// @ts-nocheck

const UpdateModal = ({
  updateModal,
  actionLoading,
  setUpdateModal,
  handleUpdateSubmit,
  provinces,
  physicalDistricts,
  physicalSectors,
  physicalCells,
  physicalVillages,
  institutionDistricts,
  institutionSectors,
  institutionCells,
  institutionVillages,
  updateAddressDropdowns
}: {
  updateModal: { isOpen: boolean; data: UpdateModalData | null };
  actionLoading: number | null;
  setUpdateModal: (modal: { isOpen: boolean; data: UpdateModalData | null }) => void;
  handleUpdateSubmit: (data: any) => void;
  provinces: string[];
  physicalDistricts: string[];
  physicalSectors: string[];
  physicalCells: string[];
  physicalVillages: string[];
  institutionDistricts: string[];
  institutionSectors: string[];
  institutionCells: string[];
  institutionVillages: string[];
  updateAddressDropdowns: (
    addressType: 'physical' | 'institution',
    province: string,
    district: string,
    sector: string,
    cell: string
  ) => void;
}) => {
  const [formData, setFormData] = useState(
    updateModal.data?.data || (updateModal.data?.type === 'individual'
      ? {
          firstname: '',
          lastname: '',
          idPassport: '',
          occupation: '',
          phone: '',
          email: '',
          nationality: 'Rwandan',
          dateOfBirth: '',
          gender: '',
          maritalStatus: '',
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
          }
        }
      : {
          institutionName: '',
          tradingLicenseNumber: '',
          businessActivity: '',
          institutionType: '',
          phone: '',
          email: '',
          website: '',
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
          }
        }
    )
  );

  // State for address dropdowns
  const [residentDistricts, setResidentDistricts] = useState<string[]>([]);
  const [residentSectors, setResidentSectors] = useState<string[]>([]);
  const [residentCells, setResidentCells] = useState<string[]>([]);
  const [residentVillages, setResidentVillages] = useState<string[]>([]);

  // Initialize form data when modal opens
  useEffect(() => {
    if (updateModal.data?.data) {
      setFormData(updateModal.data.data);
    }
  }, [updateModal.data]);

  // Update physical address dropdowns
  useEffect(() => {
    if (updateModal.data?.type === 'individual') {
      const physicalAddress = formData.physicalAddress || {};
      updateAddressDropdowns(
        'physical',
        physicalAddress.province || '',
        physicalAddress.district || '',
        physicalAddress.sector || '',
        physicalAddress.cell || ''
      );
    }
  }, [
    formData.physicalAddress?.province,
    formData.physicalAddress?.district, 
    formData.physicalAddress?.sector,
    formData.physicalAddress?.cell,
    updateModal.data?.type,
    updateAddressDropdowns
  ]);

  // Update institution address dropdowns
  useEffect(() => {
    if (updateModal.data?.type === 'institution') {
      const address = formData.fullAddress || {};
      updateAddressDropdowns(
        'institution',
        address.province || '',
        address.district || '',
        address.sector || '',
        address.cell || ''
      );
    }
  }, [
    formData.fullAddress?.province,
    formData.fullAddress?.district,
    formData.fullAddress?.sector,
    formData.fullAddress?.cell,
    updateModal.data?.type,
    updateAddressDropdowns
  ]);

  // Update resident address dropdowns
  useEffect(() => {
    const updateResidentDropdowns = () => {
      const residentAddress = formData.residentAddress || {};
      
      // Reset if no province
      if (!residentAddress.province) {
        setResidentDistricts([]);
        setResidentSectors([]);
        setResidentCells([]);
        setResidentVillages([]);
        return;
      }

      // Update districts
      if (residentAddress.province && rwandaData[residentAddress.province as keyof typeof rwandaData]) {
        const provinceData = rwandaData[residentAddress.province as keyof typeof rwandaData];
        setResidentDistricts(Object.keys(provinceData));
      }

      // Update sectors
      if (residentAddress.province && residentAddress.district) {
        const provinceData = rwandaData[residentAddress.province as keyof typeof rwandaData];
        if (provinceData && provinceData[residentAddress.district as keyof typeof provinceData]) {
          const districtData = provinceData[residentAddress.district as keyof typeof provinceData];
          setResidentSectors(Object.keys(districtData));
        }
      }

      // Update cells
      if (residentAddress.province && residentAddress.district && residentAddress.sector) {
        const provinceData = rwandaData[residentAddress.province as keyof typeof rwandaData];
        if (provinceData && provinceData[residentAddress.district as keyof typeof provinceData]) {
          const districtData = provinceData[residentAddress.district as keyof typeof provinceData];
          if (districtData && districtData[residentAddress.sector as keyof typeof districtData]) {
            const sectorData = districtData[residentAddress.sector as keyof typeof districtData];
            setResidentCells(Object.keys(sectorData));
          }
        }
      }

      // Update villages
      if (residentAddress.province && residentAddress.district && residentAddress.sector && residentAddress.cell) {
        const provinceData = rwandaData[residentAddress.province as keyof typeof rwandaData];
        if (provinceData && provinceData[residentAddress.district as keyof typeof provinceData]) {
          const districtData = provinceData[residentAddress.district as keyof typeof provinceData];
          if (districtData && districtData[residentAddress.sector as keyof typeof districtData]) {
            const sectorData = districtData[residentAddress.sector as keyof typeof districtData];
            const cellData = sectorData[residentAddress.cell as keyof typeof sectorData];
            if (Array.isArray(cellData)) {
              setResidentVillages(cellData);
            }
          }
        }
      }
    };

    if (updateModal.data?.type === 'individual') {
      updateResidentDropdowns();
    }
  }, [
    formData.residentAddress?.province,
    formData.residentAddress?.district,
    formData.residentAddress?.sector,
    formData.residentAddress?.cell,
    updateModal.data?.type
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (addressType: 'physicalAddress' | 'residentAddress' | 'fullAddress', field: string, value: any) => {
    setFormData(prev => {
      const currentAddress = prev[addressType] || {};

      // Reset dependent fields when higher-level field changes
      if (field === 'province') {
        return {
          ...prev,
          [addressType]: {
            ...currentAddress,
            province: value,
            district: '',
            sector: '',
            cell: '',
            village: ''
          }
        };
      } else if (field === 'district') {
        return {
          ...prev,
          [addressType]: {
            ...currentAddress,
            district: value,
            sector: '',
            cell: '',
            village: ''
          }
        };
      } else if (field === 'sector') {
        return {
          ...prev,
          [addressType]: {
            ...currentAddress,
            sector: value,
            cell: '',
            village: ''
          }
        };
      } else if (field === 'cell') {
        return {
          ...prev,
          [addressType]: {
            ...currentAddress,
            cell: value,
            village: ''
          }
        };
      } else {
        return {
          ...prev,
          [addressType]: {
            ...currentAddress,
            [field]: value
          }
        };
      }
    });
  };

  const handleKeyRepresentativeChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      keyRepresentatives: prev.keyRepresentatives.map((rep, i) =>
        i === index ? { ...rep, [field]: value } : rep
      )
    }));
  };

  const addKeyRepresentative = () => {
    setFormData(prev => ({
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
    if (formData.keyRepresentatives.length > 1) {
      setFormData(prev => ({
        ...prev,
        keyRepresentatives: prev.keyRepresentatives.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateSubmit(formData);
  };

  if (!updateModal.isOpen || !updateModal.data) return null;

  return (
    <AnimatePresence>
      {updateModal.isOpen && updateModal.data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !actionLoading && setUpdateModal({ isOpen: false, data: null })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ... rest of the modal JSX remains exactly the same ... */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};