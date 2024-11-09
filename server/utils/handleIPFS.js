const uploadJSON = async (content) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const headers = {
      'Content-Type': 'application/json',
      pinata_api_key: process.env.PINATA_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET
  };

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(content),
      });

      if (!response.ok) {
          throw new Error('Error uploading JSON to Pinata');
      }

      const data = await response.json();
      return data.IpfsHash;
  } catch (error) {
      console.error('Error uploading data to Pinata:', error);
  }
}    

module.exports = { uploadJSON }