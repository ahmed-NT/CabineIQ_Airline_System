const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
      username: 'admin',
      password: 'password'
    });
    const token = loginRes.data.token;
    console.log("Got token:", token.substring(0, 10) + "...");

    const res = await axios.put('http://localhost:8080/api/seats/1A/status?aircraftId=1', 
      { status: 'OCCUPIED' },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        } 
      }
    );
    console.log("SUCCESS:", res.status, res.data);
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.status + " " + JSON.stringify(err.response.data) : err.message);
  }
}
test();
