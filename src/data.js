export const GENRES = ['Tiên hiệp','Kiếm hiệp','Lãng mạn','Trinh thám','Khoa học viễn tưởng','Lịch sử','Kinh dị','Hài hước'];

export const BOOKS = [
  { id:1, title:'Đấu Phá Thương Khung', author:'Thiên Tàm Thổ Đậu', genre:'Tiên hiệp', chapters:1748, reads:'12.4M', rating:4.8, c1:'#6941C6', c2:'#9E77ED', emoji:'🔥', desc:'Trong thế giới nơi mà sức mạnh quyết định tất cả, Tiêu Viêm — thiên tài một thời — đã mất đi khả năng tu luyện. Hành trình vươn lên từ tro tàn đến đỉnh cao, nơi mà mỗi bước tiến là một cuộc chiến sinh tử với định mệnh.', lastChapter:'Chương 327: Đại Đấu Trường', tags:['Hot','Hoàn thành'], words:'4.2M', updated:'2 ngày trước' },
  { id:2, title:'Phàm Nhân Tu Tiên', author:'Vong Ngữ', genre:'Tiên hiệp', chapters:2356, reads:'9.8M', rating:4.9, c1:'#0E9384', c2:'#15B8A6', emoji:'⚡', desc:'Hàn Lập — một nông dân bình thường — bước vào con đường tu tiên đầy gian nan. Câu chuyện về sự kiên trì và ý chí vươn tới bất tử.', lastChapter:'Chương 1024: Vượt Kiếp', tags:['Classic','Hoàn thành'], words:'6.1M', updated:'Hoàn thành' },
  { id:3, title:'Tuyết Trung Hãn Đao Hành', author:'Phong Hỏa Hí Chư Hầu', genre:'Kiếm hiệp', chapters:1140, reads:'7.2M', rating:4.7, c1:'#C01048', c2:'#F63D68', emoji:'⚔️', desc:'Từ một gã trẻ không biết gì về kiếm thuật, Từ Phượng Niên bước vào giang hồ đầy máu lửa, mang theo hy vọng của cả một gia tộc.', lastChapter:'Chương 88: Lưỡng Kiếm Đối Quyết', tags:['Top Rating'], words:'3.0M', updated:'5 ngày trước' },
  { id:4, title:'Cô Gái Năm Ấy', author:'Cửu Lộc Phi Hương', genre:'Lãng mạn', chapters:320, reads:'5.1M', rating:4.6, c1:'#C4320A', c2:'#F38744', emoji:'🌸', desc:'Một câu chuyện tình yêu nhẹ nhàng về hai người trẻ tìm thấy nhau giữa những biến cố của cuộc sống hiện đại.', lastChapter:'Chương 45: Mưa Đêm', tags:['Mới'], words:'0.9M', updated:'Hôm nay' },
  { id:5, title:'Sát Thần', author:'Thần Đông', genre:'Tiên hiệp', chapters:900, reads:'6.5M', rating:4.7, c1:'#3538CD', c2:'#6172F3', emoji:'🌙', desc:'Thạch Hạo — kẻ bị cả thế giới ruồng bỏ — mang trong mình bí ẩn của thần linh. Cuộc hành trình trả thù và vươn lên bắt đầu.', lastChapter:'Chương 201: Chân Thần', tags:['Hot','Đang ra'], words:'2.4M', updated:'Hôm nay' },
  { id:6, title:'Bạch Lộc Nguyên', author:'Trần Trung Thực', genre:'Lịch sử', chapters:420, reads:'3.2M', rating:4.9, c1:'#067647', c2:'#17B26A', emoji:'🏔️', desc:'Sử thi về hai dòng họ Bạch và Lộc qua nhiều thế hệ, phản ánh lịch sử cận đại đầy biến động và những số phận bị cuốn vào guồng quay lịch sử.', lastChapter:'Chương 78: Đất Trời Biến', tags:['Classic'], words:'1.1M', updated:'Hoàn thành' },
  { id:7, title:'Nhà Ga Cuối Cùng', author:'Đinh Tiểu Vân', genre:'Trinh thám', chapters:280, reads:'2.8M', rating:4.6, c1:'#344054', c2:'#475467', emoji:'🔍', desc:'Một thám tử kỳ cựu đối mặt với vụ án kỳ bí nhất trong sự nghiệp tại một nhà ga vắng vẻ vào đêm đông.', lastChapter:'Chương 33: Manh Mối Cuối', tags:['Mới'], words:'0.7M', updated:'3 ngày trước' },
  { id:8, title:'Nhân Gian Thất Hoan', author:'Mặc Bảo Phi Bảo', genre:'Lãng mạn', chapters:580, reads:'4.3M', rating:4.5, c1:'#B54708', c2:'#DC6803', emoji:'💫', desc:'Trong vòng xoáy của danh vọng và tình yêu, Lâm Hi Nhi phải chọn giữa trái tim và lý trí.', lastChapter:'Chương 112: Ngã Rẽ', tags:['Đang ra'], words:'1.5M', updated:'Hôm qua' },
  { id:9, title:'Vũ Thần Thiên Hạ', author:'Mặc Vũ', genre:'Tiên hiệp', chapters:1200, reads:'8.1M', rating:4.6, c1:'#5925DC', c2:'#7A5AF8', emoji:'🌊', desc:'Từ một cậu bé bị bỏ rơi ở vùng đất hoang vu, Lin Ming vươn lên trở thành chiến thần vĩ đại nhất trong lịch sử.', lastChapter:'Chương 445: Thiên Địa Đại Kiếp', tags:['Hot'], words:'3.2M', updated:'1 ngày trước' },
];

export const CHAPTERS = Array.from({length:50}, (_,i) => ({
  id: i+1,
  title: `Chương ${i+1}: ${['Khởi Đầu Mới','Bí Ẩn Hé Lộ','Trận Chiến','Kẻ Địch Xuất Hiện','Con Đường Phía Trước','Thử Thách Vô Biên','Sức Mạnh Tiềm Ẩn','Huyết Chiến','Vượt Giới Hạn','Phục Thù'][i%10]}`,
  words: Math.floor(Math.random()*2000+1500),
  free: i < 20,
  read: i < 4,
}));

export const STORY_TEXT = `Trong khung cảnh hoàng hôn rực rỡ, Tiêu Viêm đứng trên đỉnh núi Giai Nham, nhìn xuống thung lũng trải dài bên dưới. Gió thổi qua mái tóc đen như mực của hắn, mang theo mùi thảo dược và đất ẩm từ rừng sâu.

"Hôm nay ta sẽ phá qua ngưỡng cửa Đấu Giả đệ tứ phẩm," hắn thì thầm với chính mình, giọng kiên định như đá núi.

Ba năm. Ba năm kể từ cái ngày định mệnh ấy — ngày mà toàn bộ tinh khí trong người hắn như bị hút cạn, để lại chỉ là vỏ rỗng không. Ngày ấy, Nạp Lan Tiểu Nham — hôn thê của hắn — đã công khai hủy hôn trước toàn thể gia tộc. Ngày ấy, Tiêu Viêm từ một thiên tài rực rỡ trở thành phế vật bị khinh thường.

Nhưng hắn không quỵ ngã.

Trong nhẫn nhịn và im lặng, Tiêu Viêm đã âm thầm tu luyện theo phương pháp bí truyền mà người phụ nữ bí ẩn trong chiếc nhẫn ngọc dạy cho. Từng ngày một, từng chút một, sức mạnh trong người hắn dần hồi phục — không, không phải hồi phục, mà là vươn tới độ cao chưa từng có.

Hắn nhắm mắt, cảm nhận dòng tinh khí chảy qua từng kinh mạch như dòng suối nóng. Đấu Khí bùng lên, bao phủ toàn thân hắn trong một lớp ánh vàng mờ nhạt.

*"Không tệ,"* giọng nói quen thuộc vang lên trong tâm trí hắn — giọng của Dược Lão, người thầy bí ẩn bị phong ấn trong nhẫn. *"Nhưng vẫn còn quá chậm. Nếu muốn đánh bại Nạp Lan Dịch vào đại hội năm sau, ngươi cần phải—"*

"Tôi biết." Tiêu Viêm mở mắt, ánh mắt sắc bén như lưỡi kiếm. "Tôi cần bước vào Đấu Sư."

Bên dưới, tiếng huyên náo của thị trấn Ngô Thành vẳng lên. Cuộc sống vẫn tiếp diễn, nhịp đập của thế giới vẫn không thay đổi. Chỉ có hắn — Tiêu Viêm — đang thay đổi từng giờ từng phút.

Hắn rút ra một viên đan dược nhỏ, màu cam rực như lửa. Viên Hồi Khí Đan — sản phẩm tốt nhất hắn có thể chế tạo với trình độ hiện tại. Tuy không thể so với những linh đan hạng cao, nhưng với phương pháp tu luyện đặc biệt của Dược Lão, mỗi viên đan như thế này có thể phát huy hiệu quả gấp ba lần bình thường.`;
