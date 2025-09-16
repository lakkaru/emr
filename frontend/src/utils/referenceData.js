// API client for reference data
export const fetchAllergies = async (apiClient, searchTerm = '') => {
  try {
    const response = await apiClient.get(`/allergies?search=${encodeURIComponent(searchTerm)}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch allergies:', error);
    return [];
  }
};

export const fetchMedications = async (apiClient, searchTerm = '') => {
  try {
    const response = await apiClient.get(`/medications?search=${encodeURIComponent(searchTerm)}`);
    return response;
  } catch (error) {
    console.error('Failed to fetch medications:', error);
    return [];
  }
};

export const getAllergyReactions = (allergy) => {
  return allergy?.commonReactions || [
    { name: 'Hives', severity: 'mild' },
    { name: 'Swelling', severity: 'moderate' },
    { name: 'Rash', severity: 'mild' },
    { name: 'Itching', severity: 'mild' },
    { name: 'Breathing difficulty', severity: 'severe' },
    { name: 'Anaphylaxis', severity: 'severe' }
  ];
};

export const getMedicationDosages = (medication) => {
  return medication?.commonDosages || ['250mg', '500mg', '1000mg'];
};

export const getMedicationFrequencies = (medication) => {
  return medication?.commonFrequencies || [
    'Once daily',
    'Twice daily', 
    'Three times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed'
  ];
};
