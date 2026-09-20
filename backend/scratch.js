const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://codesklii-backend-production.up.railway.app/api/v1/projects');
    console.log("STATUS:", res.status);
    console.log("DATA:", res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
  }
  
  try {
    const res2 = await axios.get('https://codesklii-backend-production.up.railway.app/api/v1/notes/admin/global-notes');
    console.log("STATUS 2:", res2.status);
    console.log("DATA 2:", res2.data);
  } catch (err) {
    console.log("ERROR STATUS 2:", err.response?.status);
    console.log("ERROR DATA 2:", err.response?.data);
  }
}

test();
