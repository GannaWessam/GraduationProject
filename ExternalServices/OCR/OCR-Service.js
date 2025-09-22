// const axios = require('axios');
// const fs = require('fs');
// const FormData = require('form-data');

// const arabicToEnglish = {
//   '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
//   '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
//   '.':"0"
// };

// function convertArabicToEnglish(arabicNumber) {
//   return arabicNumber.split('').map(char => arabicToEnglish[char] || char).join('');
// }
// function extract14DigitNumber(text) {
//   const match = text.match(/[\d٠-٩]+(\.[\d٠-٩]+)?/);

//   if (match) {
//     console.log(match[0]);
//     const arabicNumber = match[0];  
//     const englishNumber = convertArabicToEnglish(arabicNumber);  
//     return englishNumber;
//   } else {
//     return null; 
//   }
// }

// // async function sendOcrRequest(req, res) {
// //   try {
// //     const imagePath = req.body.path; //3ayza ygele elpath as string w b forward slashes 
// //     const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

// //     const url = 'https://api.ocr.space/parse/image';

// //     const headers = {
// //       apikey: 'K81369309088957',
// //       'Content-Type': 'application/x-www-form-urlencoded',
// //     };

// //     const formData = new URLSearchParams({
// //       language: 'auto',
// //       isOverlayRequired: 'false',
// //       base64Image: `data:image/jpeg;base64,${base64Image}`,
// //       OCREngine: '2',
// //       issearchablepdfhidetextlayer: 'false',
// //       filetype: 'jpg',
// //     });

// //     const response = await axios.post(url, formData.toString(), { headers });

// //     const parsedText = response.data.ParsedResults[0].ParsedText || '';
// //     const number = extract14DigitNumber(parsedText);

// //     if (number)
// //       res.status(200).json({ number });

// //   } catch (error) {
// //     console.error('Error:', error.response?.data || error.message);
// //     res.status(500).json({ error: error.message || 'Internal Server Error' });
// //   }
// // }



// module.exports = {sendOcrRequest};

const axios = require('axios');

// sample test data : "url": "https://drive.google.com/uc?export=download&id=1w80rtW4YmeLLTUI4wcuF5vtmG9Wxgqyw"

const arabicToEnglish = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  '.': "0"
};

function convertArabicToEnglish(arabicNumber) {
  return arabicNumber.split('').map(char => arabicToEnglish[char] || char).join('');
}

function extract14DigitNumber(text) {
  const match = text.match(/[\d٠-٩]+(\.[\d٠-٩]+)?/);
  if (match) {
    const arabicNumber = match[0];
    return convertArabicToEnglish(arabicNumber);
  }
  return null;
}

async function sendOcrRequest(req, res) {
  try {
    const imageUrl = req.body.url;

    const url = 'https://api.ocr.space/parse/image';
    const headers = {
      apikey: 'K81369309088957',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const formData = new URLSearchParams({
      language: 'auto',
      isOverlayRequired: 'false',
      url: imageUrl,
      OCREngine: '2',
      filetype: 'jpg'
    });

    const response = await axios.post(url, formData.toString(), { headers });

    const data = response.data;

    if (!data.ParsedResults || !data.ParsedResults.length) {
      return res.status(400).json({ error: 'No text detected', raw: data });
    }

    const parsedText = data.ParsedResults[0].ParsedText || '';
    const number = extract14DigitNumber(parsedText);

    return res.json({ number });

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: error.message });
  }
}



module.exports = { sendOcrRequest };
