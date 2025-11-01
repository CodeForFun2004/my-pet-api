const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const http = require('http');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Bạn là BÁC SĨ THÚ Y AI chuyên nghiệp tại phòng khám MyPet.
Nhiệm vụ của bạn:
- Phân tích triệu chứng của thú cưng từ mô tả và hình ảnh (nếu có)
- Đánh giá mức độ khẩn cấp (nhẹ, vừa, nghiêm trọng, khẩn cấp)
- Đưa ra tư vấn ban đầu và gợi ý chăm sóc
- Luôn khuyến nghị đi khám trực tiếp tại phòng khám nếu triệu chứng nghiêm trọng
- Giải thích bằng ngôn ngữ dễ hiểu, thân thiện và quan tâm đến thú cưng
Trả lời bằng tiếng Việt.`;

/**
 * Tải ảnh từ URL và chuyển đổi sang base64
 * @param {string} url - URL của ảnh (có thể là Cloudinary URL)
 * @returns {Promise<string>} - Chuỗi base64 của ảnh
 */
async function fetchImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      // Kiểm tra redirect (301, 302)
      if (response.statusCode === 301 || response.statusCode === 302) {
        return fetchImageAsBase64(response.headers.location)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: ${response.statusCode}`));
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        
        // Xác định MIME type từ Content-Type header hoặc URL extension
        const contentType = response.headers['content-type'] || 'image/jpeg';
        
        // Trả về base64 với prefix (Gemini cần format này)
        resolve(base64);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Chat với Doctor AI - hỗ trợ text và hình ảnh
 * @param {object} params - Tham số
 * @param {string} params.userText - Câu hỏi/mô tả của người dùng
 * @param {string[]} params.imageUrls - Mảng các URL ảnh (Cloudinary URLs)
 * @returns {Promise<string>} - Phản hồi từ AI
 */
async function chatWithDoctorAI({ userText, imageUrls = [] }) {
  try {
    if (!userText || userText.trim().length === 0) {
      throw new Error('Vui lòng nhập câu hỏi hoặc mô tả triệu chứng');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    
    const parts = [{ text: SYSTEM_PROMPT + "\n\nNgười dùng hỏi: " + userText }];
    
    // Add images if provided
    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        try {
          const imageData = await fetchImageAsBase64(url);
          
          // Xác định MIME type từ URL
          let mimeType = "image/jpeg";
          if (url.includes('.png')) mimeType = "image/png";
          else if (url.includes('.webp')) mimeType = "image/webp";
          
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: imageData
            }
          });
        } catch (error) {
          console.error(`Lỗi khi tải ảnh từ ${url}:`, error.message);
          // Tiếp tục xử lý các ảnh khác thay vì fail toàn bộ
        }
      }
    }
    
    const result = await model.generateContent(parts);
    return result.response.text();
  } catch (error) {
    console.error('DoctorAI service error:', error);
    throw error;
  }
}

module.exports = { chatWithDoctorAI };