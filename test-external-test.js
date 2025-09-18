const fetch = require('node-fetch');

async function testExternalTestCreation() {
  try {
    // First, login as lab officer
    const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'lab001',
        password: 'La123456'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      throw new Error('Login failed');
    }

    // Get a patient ID (assuming we have test patients)
    const patientsResponse = await fetch('http://localhost:4000/api/patients?limit=1', {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });

    const patientsData = await patientsResponse.json();
    console.log('Patients response:', patientsData);

    if (!patientsData.items || patientsData.items.length === 0) {
      throw new Error('No patients found');
    }

    const patientId = patientsData.items[0]._id;
    console.log('Using patient ID:', patientId);

    // Create external test
    const testData = {
      patientId: patientId,
      testType: 'Complete Blood Count (CBC)',
      priority: 'routine',
      sampleType: 'blood',
      externalDoctorName: 'Dr. External Test',
      externalInstitute: 'External Hospital',
      notes: 'Test from external referral',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending'
    };

    console.log('Creating test with data:', testData);

    const testResponse = await fetch('http://localhost:4000/api/lab-tests', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(testData)
    });

    const testResult = await testResponse.json();
    console.log('Test creation response:', testResult);

    if (testResponse.ok) {
      console.log('✅ External test created successfully!');
      console.log('Test ID:', testResult._id);
      console.log('External Doctor:', testResult.externalDoctorName);
      console.log('External Institute:', testResult.externalInstitute);
    } else {
      console.log('❌ Test creation failed:', testResult);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testExternalTestCreation();
