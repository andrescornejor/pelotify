const axios = require('axios');

async function testPost() {
  const url = 'https://servicios.sportsreel.com.ar/vodBlocks/get';
  try {
    const { data } = await axios.post(url, { establecimientoId: 71 });
    console.log(`✅ POST SUCCESS: ${url}`);
    console.log(JSON.stringify(data).substring(0, 1000));
  } catch (e) {
    console.log(`❌ POST FAIL: ${url} - ${e.response?.status}`);
  }
}

testPost();
