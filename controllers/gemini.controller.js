// controllers/gemini.controller.js
const { getGeminiResponse } = require('../services/gemini.service');

// --- DATABASE INTERACTION ---
// Import các Mongoose model cho phòng khám thú y MyPet
const Clinic = require('../models/clinic.model');
const Doctor = require('../models/doctor.model');
const Pet = require('../models/pet.model');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const DoctorSchedule = require('../models/doctorSchedule.model');

/**
 * Hàm lấy dữ liệu phòng khám từ cơ sở dữ liệu.
 * @returns {Promise<Array>} Mảng các đối tượng phòng khám.
 */
async function getClinicsFromDB() {
  try {
    const clinics = await Clinic.find({})
      .populate('ownerId', 'fullname email phone')
      .lean();
    return clinics;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu phòng khám từ DB:', error);
    return [];
  }
}

/**
 * Hàm lấy dữ liệu bác sĩ từ cơ sở dữ liệu.
 * @returns {Promise<Array>} Mảng các đối tượng bác sĩ.
 */
async function getDoctorsFromDB() {
  try {
    const doctors = await Doctor.find({})
      .populate('userId', 'fullname email phone avatar')
      .populate('clinicId', 'name address phone')
      .lean();
    return doctors;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu bác sĩ từ DB:', error);
    return [];
  }
}

/**
 * Hàm lấy dữ liệu thú cưng từ cơ sở dữ liệu (mẫu).
 * @returns {Promise<Array>} Mảng các loại thú cưng phổ biến.
 */
async function getPetTypesFromDB() {
  try {
    // Lấy các loại species phổ biến từ database
    const petTypes = await Pet.distinct('species');
    return petTypes.filter(Boolean); // Loại bỏ giá trị null/undefined
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu loại thú cưng từ DB:', error);
    return ['dog', 'cat', 'bird', 'rabbit', 'hamster']; // Mặc định
  }
}

/**
 * Hàm lấy thông tin về các loại dịch vụ khám chữa bệnh.
 * @returns {Promise<Array>} Mảng các loại dịch vụ.
 */
async function getServicesFromDB() {
  try {
    // Lấy các exam types từ appointments
    const examTypes = await Appointment.distinct('examType');
    const services = examTypes.filter(Boolean).map(type => ({
      name: type,
      description: `Dịch vụ ${type} tại phòng khám MyPet`
    }));
    
    // Thêm các dịch vụ cơ bản nếu chưa có
    const basicServices = [
      { name: 'Khám tổng quát', description: 'Khám sức khỏe tổng quát cho thú cưng' },
      { name: 'Tiêm phòng', description: 'Tiêm phòng vaccine đầy đủ cho thú cưng' },
      { name: 'Khám bệnh', description: 'Khám và chẩn đoán bệnh cho thú cưng' },
      { name: 'Phẫu thuật', description: 'Các dịch vụ phẫu thuật cho thú cưng' },
      { name: 'Chăm sóc răng miệng', description: 'Làm sạch và chăm sóc răng miệng thú cưng' }
    ];
    
    return services.length > 0 ? services : basicServices;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dịch vụ từ DB:', error);
    return [];
  }
}
// --- END DATABASE INTERACTION ---

/**
 * Hàm chuyển đổi văn bản Markdown cơ bản sang HTML.
 * Xử lý xuống dòng, in đậm và danh sách đơn giản.
 * @param {string} markdownText - Chuỗi văn bản có định dạng Markdown.
 * @returns {string} - Chuỗi văn bản đã được định dạng HTML.
 */
function convertMarkdownToHtml(markdownText) {
  let htmlText = markdownText;

  // 1. Chuyển đổi xuống dòng (\n) thành <br/>
  htmlText = htmlText.replace(/\n/g, '<br/>');

  // 2. Chuyển đổi in đậm (**) thành <strong>
  // Sử dụng regex với non-greedy match (.*?) để tránh match quá dài
  htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. Chuyển đổi danh sách (*) thành <ul><li>
  // Đây là một cách đơn giản, có thể cần regex phức tạp hơn cho các trường hợp lồng nhau
  // Tách thành các dòng để xử lý danh sách
  const lines = htmlText.split('<br/>');
  let inList = false;
  let processedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      // Loại bỏ dấu * và khoảng trắng đầu dòng, sau đó bọc trong <li>
      processedLines.push('<li>' + line.substring(2).trim() + '</li>');
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  if (inList) { // Đóng thẻ <ul> nếu danh sách kết thúc mà chưa đóng
    processedLines.push('</ul>');
  }

  htmlText = processedLines.join(''); // Nối lại các dòng

  return htmlText;
}


/**
 * Controller để xử lý yêu cầu chatbot từ người dùng.
 * Nó nhận prompt từ request body, lấy dữ liệu từ DB,
 * và gửi đến Gemini để nhận phản hồi.
 * @param {object} req - Đối tượng Request của Express.
 * @param {object} res - Đối tượng Response của Express.
 */
exports.askAIAboutMyPetClinic = async (req, res) => {
  const userPrompt = req.body.prompt; // Lấy prompt từ body của request

  if (!userPrompt) {
    return res.status(400).json({ error: 'Thiếu prompt từ người dùng' });
  }

  try {
    // Lấy tất cả dữ liệu cần thiết từ database một lần
    const clinics = await getClinicsFromDB();
    const doctors = await getDoctorsFromDB();
    const petTypes = await getPetTypesFromDB();
    const services = await getServicesFromDB();

    let contextData = {};
    let systemInstruction = 'Bạn là một trợ lý ảo thân thiện tư vấn thông tin cho phòng khám thú y MyPet. Hãy trả lời các câu hỏi về phòng khám, bác sĩ, dịch vụ khám chữa bệnh cho thú cưng, và cách đặt lịch hẹn. Luôn trả lời bằng giọng điệu thân thiện, chuyên nghiệp và quan tâm đến sức khỏe thú cưng. Nếu không có thông tin, hãy nói rằng bạn không tìm thấy và gợi ý cách liên hệ trực tiếp với phòng khám.';

    const lowerCaseQuery = userPrompt.toLowerCase();

    // Logic để xác định loại yêu cầu của người dùng
    if (lowerCaseQuery.includes('bác sĩ') || lowerCaseQuery.includes('bác sỹ') || lowerCaseQuery.includes('doctor') || lowerCaseQuery.includes('chuyên môn')) {
      contextData = {
        doctors: doctors,
        clinics: clinics
      };
      systemInstruction = 'Bạn là một trợ lý ảo tư vấn về đội ngũ bác sĩ tại phòng khám thú y MyPet. Hãy cung cấp thông tin chi tiết về bác sĩ, chuyên môn, kinh nghiệm, lịch làm việc và phòng khám mà họ công tác. Luôn nhấn mạnh sự chuyên nghiệp và tận tâm của đội ngũ bác sĩ. Nếu không có thông tin, hãy nói rằng bạn không tìm thấy.';
    } else if (lowerCaseQuery.includes('dịch vụ') || lowerCaseQuery.includes('service') || lowerCaseQuery.includes('khám') || lowerCaseQuery.includes('chữa') || lowerCaseQuery.includes('tiêm') || lowerCaseQuery.includes('phẫu thuật')) {
      contextData = {
        services: services,
        clinics: clinics
      };
      systemInstruction = 'Bạn là một trợ lý ảo tư vấn về các dịch vụ khám chữa bệnh tại phòng khám thú y MyPet. Hãy cung cấp thông tin chi tiết về các dịch vụ như khám tổng quát, tiêm phòng, phẫu thuật, chăm sóc răng miệng, và các dịch vụ khác. Giải thích rõ ràng từng dịch vụ và lợi ích của nó đối với thú cưng. Nếu không có thông tin, hãy nói rằng bạn không tìm thấy.';
    } else if (lowerCaseQuery.includes('phòng khám') || lowerCaseQuery.includes('clinic') || lowerCaseQuery.includes('địa chỉ') || lowerCaseQuery.includes('liên hệ') || lowerCaseQuery.includes('điện thoại') || lowerCaseQuery.includes('giờ làm')) {
      contextData = {
        clinics: clinics
      };
      systemInstruction = 'Bạn là một trợ lý ảo tư vấn về thông tin phòng khám thú y MyPet. Hãy cung cấp thông tin về tên phòng khám, địa chỉ, số điện thoại liên hệ, giờ làm việc và các chính sách của phòng khám. Nếu không có thông tin, hãy nói rằng bạn không tìm thấy.';
    } else if (lowerCaseQuery.includes('lịch hẹn') || lowerCaseQuery.includes('đặt lịch') || lowerCaseQuery.includes('appointment') || lowerCaseQuery.includes('booking')) {
      contextData = {
        clinics: clinics,
        doctors: doctors,
        services: services
      };
      systemInstruction = 'Bạn là một trợ lý ảo hướng dẫn về cách đặt lịch hẹn tại phòng khám thú y MyPet. Hãy giải thích quy trình đặt lịch, thời gian làm việc của bác sĩ, các dịch vụ có sẵn, và chính sách hủy/đổi lịch. Khuyến khích người dùng đặt lịch trước để được phục vụ tốt nhất. Nếu không có thông tin chi tiết, hãy gợi ý liên hệ trực tiếp với phòng khám.';
    } else if (lowerCaseQuery.includes('thú cưng') || lowerCaseQuery.includes('pet') || lowerCaseQuery.includes('chó') || lowerCaseQuery.includes('mèo') || lowerCaseQuery.includes('loại')) {
      contextData = {
        petTypes: petTypes,
        services: services,
        clinics: clinics
      };
      systemInstruction = 'Bạn là một trợ lý ảo tư vấn về các loại thú cưng được phục vụ tại phòng khám thú y MyPet. Hãy cung cấp thông tin về các loại thú cưng như chó, mèo, chim, thỏ, hamster và các dịch vụ chăm sóc phù hợp cho từng loại. Chia sẻ kiến thức hữu ích về chăm sóc thú cưng. Nếu không có thông tin, hãy nói rằng bạn không tìm thấy.';
    } else {
      // Nếu không khớp với bất kỳ loại nào, cung cấp tất cả dữ liệu có thể và hướng dẫn AI trả lời tổng quát hơn.
      contextData = {
        clinics: clinics,
        doctors: doctors,
        petTypes: petTypes,
        services: services,
      };
      systemInstruction = 'Bạn là một trợ lý ảo thân thiện tư vấn tổng hợp về phòng khám thú y MyPet. Hãy trả lời các câu hỏi về phòng khám, bác sĩ, dịch vụ, thú cưng, lịch hẹn và bất kỳ thông tin liên quan nào dựa trên dữ liệu được cung cấp. Hãy nhiệt tình, thân thiện và luôn quan tâm đến sức khỏe thú cưng. Nếu không có thông tin cụ thể, hãy nói rằng bạn không tìm thấy và có thể hỏi thêm để làm rõ ý định của người dùng, hoặc gợi ý liên hệ trực tiếp với phòng khám.';
    }

    // Gọi dịch vụ Gemini để lấy phản hồi
    const aiResponse = await getGeminiResponse(contextData, userPrompt, systemInstruction);

    // --- BƯỚC MỚI: Định dạng phản hồi để hiển thị đẹp trên UI ---
    const formattedResponse = convertMarkdownToHtml(aiResponse);
    // --- KẾT THÚC BƯỚC MỚI ---

    res.json({ answer: formattedResponse }); // Trả về phản hồi đã được định dạng HTML
  } catch (error) {
    console.error('🔥 Lỗi trong quá trình xử lý chatbot:', error);
    res.status(500).json({ error: 'Lỗi nội bộ khi xử lý yêu cầu chatbot.' });
  }
};
