import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Settings, 
  BookOpen, 
  Globe, 
  Send, 
  Download, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { generateExam } from "./services/gemini";
import { exportToWord } from "./services/wordExport";
import { cn } from "./lib/utils";

export default function App() {
  const [formData, setFormData] = useState({
    examInfo: "Đề kiểm tra giữa kì 2, Môn Ngữ Văn, Lớp 10, Thời gian 90 phút",
    scoreStructure: "Phần I (TNKQ): 3 điểm (12 câu). Phần II (Đúng/Sai): 4 điểm (4 câu). Phần III (Tự luận): 3 điểm (1 câu).",
    lessons: "Bài 6: Nguyễn Trãi - Cuộc đời và sự nghiệp. Yêu cầu cần đạt: Hiểu được những nét chính về cuộc đời, sự nghiệp văn học của Nguyễn Trãi; Phân tích được các giá trị nội dung và nghệ thuật của thơ văn Nguyễn Trãi.",
    context: "Sử dụng các ngữ liệu ngoài sách giáo khoa liên quan đến tư tưởng nhân nghĩa của Nguyễn Trãi.",
    knowledgePercentage: "",
    decreeTemplate: ""
  });

  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const text = await generateExam(formData);
      setResult(text);
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra trong quá trình tạo đề. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    try {
      await exportToWord(result);
    } catch (err) {
      console.error(err);
      alert("Không thể xuất file Word. Vui lòng kiểm tra lại.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="border-b border-[#E7E5E4] bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Hệ thống Tạo Đề Kiểm tra</h1>
              <p className="text-xs text-[#78716C] font-medium uppercase tracking-wider">Chuyên gia Khảo thí AI</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {result && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E7E5E4] rounded-lg text-sm font-medium hover:bg-[#FAFAF9] transition-colors"
              >
                <Download size={16} />
                Tải file Word
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Form */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-orange-600" size={20} />
              <h2 className="font-semibold text-base">Cấu hình Đề thi</h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-widest flex items-center gap-2">
                  <FileText size={12} /> Thông tin đề
                </label>
                <textarea
                  value={formData.examInfo}
                  onChange={(e) => setFormData({ ...formData, examInfo: e.target.value })}
                  placeholder="Tên đề, môn học, khối lớp, thời gian..."
                  className="w-full min-h-[80px] p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-widest flex items-center gap-2">
                  <Settings size={12} /> Cơ cấu điểm
                </label>
                <textarea
                  value={formData.scoreStructure}
                  onChange={(e) => setFormData({ ...formData, scoreStructure: e.target.value })}
                  placeholder="Phân bổ điểm cho các phần..."
                  className="w-full min-h-[80px] p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={12} /> Danh sách bài & Chuẩn KTKN
                </label>
                <textarea
                  value={formData.lessons}
                  onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                  placeholder="Tên bài học và yêu cầu cần đạt..."
                  className="w-full min-h-[120px] p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} /> Bối cảnh
                </label>
                <textarea
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  placeholder="Bối cảnh thực tế, địa phương hoặc yêu cầu đặc biệt..."
                  className="w-full min-h-[80px] p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-widest flex items-center gap-2">
                  <Settings size={12} /> Tỉ lệ % kiến thức (Tùy chọn)
                </label>
                <textarea
                  value={formData.knowledgePercentage}
                  onChange={(e) => setFormData({ ...formData, knowledgePercentage: e.target.value })}
                  placeholder="Ví dụ: Bài 1: 40%, Bài 2: 60%..."
                  className="w-full min-h-[60px] p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#78716C] uppercase tracking-widest flex items-center gap-2">
                  <FileText size={12} /> {"{{File_Nghi_Dinh}}"} (Khung Nghị Định/Công văn)
                </label>
                <textarea
                  value={formData.decreeTemplate}
                  onChange={(e) => setFormData({ ...formData, decreeTemplate: e.target.value })}
                  placeholder="Dán cấu trúc bảng Ma trận/Đặc tả từ file nghị định vào đây..."
                  className="w-full min-h-[100px] p-3 bg-[#FAFAF9] border border-[#E7E5E4] rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg",
                  loading 
                    ? "bg-[#E7E5E4] text-[#A8A29E] cursor-not-allowed" 
                    : "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98] shadow-orange-200"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Đang tạo đề...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Bắt đầu Tạo Đề Toàn trình
                  </>
                )}
              </button>
            </div>
          </section>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-700 text-sm"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}
        </div>

        {/* Right Side: Preview */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-[#E7E5E4] min-h-[600px] flex flex-col shadow-sm overflow-hidden">
            <div className="border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between bg-[#FAFAF9]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={result ? "text-green-600" : "text-[#D6D3D1]"} size={20} />
                <h2 className="font-semibold text-base">Kết quả Hiển thị</h2>
              </div>
              {result && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#78716C] bg-[#E7E5E4] px-2 py-1 rounded">
                  Hoàn tất
                </span>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto max-h-[800px] prose prose-sm max-w-none prose-orange prose-headings:font-bold prose-table:border prose-table:border-[#E7E5E4] prose-th:bg-[#FAFAF9] prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-[#E7E5E4]">
              {result ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result}
                </ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#A8A29E] space-y-4 py-20">
                  <div className="w-16 h-16 bg-[#F5F5F4] rounded-full flex items-center justify-center">
                    <FileText size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Chưa có dữ liệu đề thi</p>
                    <p className="text-xs">Điền thông tin bên trái và nhấn "Bắt đầu" để tạo đề.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-[#E7E5E4] mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1C1917] rounded-lg flex items-center justify-center text-white">
              <Settings size={16} />
            </div>
            <span className="font-bold text-sm">Smart Exam System v1.0</span>
          </div>
          <p className="text-xs text-[#78716C]">
            © 2026 Hệ thống được phát triển bởi Chuyên gia Giáo dục & Khảo thí AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
