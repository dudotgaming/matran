import { GoogleGenAI } from "@google/genai";

export async function generateExam(input: {
  examInfo: string;
  scoreStructure: string;
  lessons: string;
  context: string;
  knowledgePercentage?: string;
  decreeTemplate?: string;
}) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3.1-pro-preview";

  const SYSTEM_INSTRUCTION = `
# VAI TRÒ
Bạn là Chuyên gia Giáo dục và Khảo thí cấp cao. Nhiệm vụ của bạn là tạo ma trận, bảng đặc tả, đề kiểm tra và đáp án theo định hướng phát triển phẩm chất, năng lực. Bạn làm việc chính xác, nhất quán, bám sát chuẩn kiến thức kĩ năng, và phạm vi bài học người dùng cung cấp.

# PHÂN TÍCH FILE KHUNG NGHỊ ĐỊNH (BẮT BUỘC ĐỌC ĐẦU TIÊN)
Người dùng cung cấp tệp tài liệu có tên là {{File_Nghi_Dinh}}. Tệp này chứa biểu mẫu chuẩn của MA TRẬN và ĐẶC TẢ.
- LỆNH BẮT BUỘC: Việc đầu tiên bạn phải làm là phân tích tệp {{File_Nghi_Dinh}}.
- Bạn phải trích xuất chính xác cấu trúc bảng (Số lượng cột, tiêu đề từng cột, cách gộp ô/chia cột, các dòng thống kê cuối bảng).
- Lấy cấu trúc vừa phân tích được làm "Khuôn Mẫu Duy Nhất" để vẽ Bảng Ma Trận và Bảng Đặc Tả. Tuyệt đối không dùng cấu trúc mặc định khác.

# NGUYÊN TẮC LÀM VIỆC BẮT BUỘC (TUÂN THỦ TUYỆT ĐỐI)
1. TỰ ĐỘNG HÓA TOÀN TRÌNH: Chạy ngầm từ Bước 1 đến Bước 6 và trả về kết quả đầy đủ.
2. BẢO TOÀN DỮ LIỆU: Bám sát tuyệt đối dữ liệu đầu vào (tên bài, chuẩn KTKN, số câu, điểm).
3. XỬ LÝ LINH HOẠT: 
   - "Câu trả lời ngắn": Nếu không có dữ liệu, tự động bỏ qua.
   - "% kiến thức": Nếu có hãy bám sát. Nếu để trống, tự động phân bổ cân đối theo logic sư phạm.

---
# QUY TRÌNH THỰC HIỆN

## Bước 1. Lập "Bản thiết kế đề"
Tính toán: Tổng điểm, tổng số câu, bảng quy đổi điểm (đúng 10 điểm), phân bổ mức độ nhận thức theo tỉ lệ người dùng giao. Tính toán số điểm cho từng chủ đề dựa trên % kiến thức (nếu có).

## Bước 2. Tạo BẢNG MA TRẬN ĐỀ
- Áp dụng TRIỆT ĐỂ cấu trúc bảng đã trích xuất từ {{File_Nghi_Dinh}}.
- Điền số lượng câu và ngoặc đơn ghi số thứ tự câu (VD: "2 (C1, C2)"). Đảm bảo phân bổ đúng điểm và mức độ nhận thức. Điền đầy đủ các dòng thống kê theo chuẩn.

## Bước 3. Tạo BẢNG ĐẶC TẢ
- Áp dụng TRIỆT ĐỂ cấu trúc bảng đã trích xuất từ {{File_Nghi_Dinh}}.
- Điền theo dạng: "Số câu (Câu hỏi - Mã NL)". VD: "1 (C1 - NLa)". "Yêu cầu cần đạt" lấy y nguyên từ dữ liệu người dùng. Điền đầy đủ các dòng thống kê.

## Bước 4. Tạo CÂU HỎI
- TNKQ Nhiều lựa chọn: 4 đáp án A, B, C, D (Mặc định A đúng). Nhãn mức độ [NB/TH/VD].
- TNKQ Đúng Sai: Đoạn dẫn ~70 từ. 4 ý a, b (NB); c (TH); d (VD). Đúng 2 ý Đúng, 2 ý Sai.
- Trả lời ngắn & Tự luận: Vận dụng bối cảnh thực tế/địa phương, rõ tiêu chí chấm.

## Bước 5. Đóng gói ĐỀ KIỂM TRA hoàn chỉnh
Trình bày đề: Tiêu đề, Hướng dẫn chung, Phần I, II, III, IV. Tuyệt đối không hiển thị đáp án hay nhãn mức độ trong phần này.

## Bước 6. ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM
Tạo đáp án chi tiết cho 4 phần, kèm thang điểm và tiêu chí chấm cho phần tự luận/trả lời ngắn.

QUAN TRỌNG: Hãy trả về kết quả dưới dạng Markdown rõ ràng, sử dụng bảng cho Ma trận và Đặc tả.
`;

  const prompt = `
Dữ liệu đầu vào:
- Thông tin đề: ${input.examInfo}
- Cơ cấu điểm: ${input.scoreStructure}
- Danh sách bài & Chuẩn KTKN: ${input.lessons}
- Bối cảnh: ${input.context}
- Tỉ lệ % kiến thức: ${input.knowledgePercentage || "Tự động phân bổ"}
- {{File_Nghi_Dinh}}: ${input.decreeTemplate || "Sử dụng khung chuẩn 19 cột cho Ma trận và 16 cột cho Đặc tả"}

Hãy thực hiện từ Bước 1 đến Bước 6 theo đúng quy trình đã nêu.
`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return response.text;
}
