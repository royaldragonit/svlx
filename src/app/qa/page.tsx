// src/app/hoi-dap/page.tsx

"use client";

import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function FAQPage() {
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Hỏi & Đáp
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Một vài câu hỏi hay được hỏi về sucvatlaixe.com. Đọc kỹ trước khi dùng
          để đỡ phải ấm ức hoặc kỳ vọng sai.
        </Typography>
      </Box>

      {/* Intro card */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1.5 }}>
          <Chip label="Phi lợi nhuận" size="small" />
          <Chip label="Cộng đồng tự vận hành" size="small" />
          <Chip label="Trách nhiệm cá nhân" size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Đây là một dự án cá nhân, vận hành theo kiểu “có gì dùng nấy”. Mục
          tiêu là tạo nơi để cộng đồng chia sẻ những câu chuyện về văn hoá giao
          thông, chứ không phải dịch vụ chăm sóc danh tiếng hay toà án online.
        </Typography>
      </Paper>

      {/* Q&A list */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Q1 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Website này kiếm thu nhập từ đâu?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Hiện tại website được vận hành theo mô hình phi lợi nhuận. Không
              bán data, không “gói VIP gỡ bài”, không thu phí thành viên.
            </Typography>
            <Typography variant="body2" paragraph>
              Chi phí hạ tầng (domain, hosting, lưu trữ…) do chủ site tự bỏ
              tiền túi. Nếu sau này có nhận tài trợ hoặc đóng góp, mọi thứ sẽ
              được ghi rõ ràng; nhưng tinh thần vẫn là: website sinh ra vì cộng
              đồng, không phải vì doanh thu.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Q2 */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Website này sinh ra với mục đích gì?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Mục đích chính là tạo một nơi để mọi người phản ánh những hành vi
              lái xe và đỗ xe thiếu ý thức: chen lấn, khôn lỏi, chiếm làn,
              chắn lối, đỗ bừa bãi… nói chung là những kiểu “súc vật khi cầm
              vô-lăng”.
            </Typography>
            <Typography variant="body2" paragraph>
              Hy vọng của website:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
              <li>
                Ghi lại những trường hợp xấu, để người trong cuộc nhìn lại mình
                (nếu còn chút tự trọng).
              </li>
              <li>
                Tạo áp lực xã hội để mỗi người lái xe bớt coi thường người
                khác, bớt kiểu “mình đúng vì mình vội”.
              </li>
              <li>
                Là kho tình huống thực tế để mọi người xem, rút kinh nghiệm,
                tránh lập lại những hành vi vô ý thức.
              </li>
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Q3 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Tôi muốn xoá bài viết / bài tố cáo về mình thì sao?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Nói thẳng: đây không phải dịch vụ gỡ bài theo yêu cầu, và admin
              không có nghĩa vụ phải xoá bài chỉ vì bạn “không thích nhìn thấy
              mình trên đó”.
            </Typography>
            <Typography variant="body2" paragraph>
              Quy trình cơ bản sẽ như sau:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
              <li>
                Bạn liên hệ, trình bày lịch sự, rõ ràng, kèm theo thông tin/bằng
                chứng nếu cho rằng nội dung sai sự thật.
              </li>
              <li>
                Admin, tuỳ thái độ và mức độ hợp lý của yêu cầu, sẽ giúp chuyển
                lời đến người đã đăng bài.
              </li>
              <li>
                Quyền quyết định cuối cùng thuộc về người đăng: họ có thể chỉnh
                sửa, cập nhật thêm thông tin, ẩn biển số, hoặc xoá bài – tuỳ họ.
              </li>
            </Typography>
            <Typography variant="body2" paragraph>
              Tóm gọn: tôi sẽ cố gắng làm cầu nối, nhưng tôi không cam kết xoá
              bài thay cho người khác, và không vận hành theo mô hình “gỡ bài
              theo giá”.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Q4 */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>
              Trách nhiệm pháp lý thuộc về ai?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Mỗi cá nhân tự chịu trách nhiệm trước pháp luật về nội dung mình
              đăng: tính xác thực, cách dùng từ, hình ảnh, video, thông tin nhận
              dạng… Website chỉ là nền tảng kỹ thuật để hiển thị nội dung mà
              người dùng gửi lên.
            </Typography>
            <Typography variant="body2" paragraph>
              Khi đăng bài, bạn cần:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 3 }}>
              <li>Hạn chế quy chụp, vu khống, bịa đặt.</li>
              <li>
                Không tiết lộ thông tin nhạy cảm, riêng tư không cần thiết
                (CMND/CCCD, số điện thoại cá nhân…).
              </li>
              <li>
                Chuẩn bị sẵn tinh thần chịu trách nhiệm nếu nội dung bạn đăng bị
                tranh chấp.
              </li>
            </Typography>
            <Typography variant="body2">
              Website luôn ưu tiên việc bảo vệ cộng đồng và tuân thủ pháp luật.
              Nếu nhận được yêu cầu hợp lệ từ cơ quan chức năng, nội dung liên
              quan có thể bị xử lý theo quy định.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Container>
  );
}
 