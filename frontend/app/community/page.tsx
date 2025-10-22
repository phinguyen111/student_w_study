import { Button } from "@/components/ui/button";
import { Send, ThumbsUp, MessageCircle, MoreVertical, CheckCircle, Clock, Image as ImageIcon, Video, User } from "lucide-react";
import Link from "next/link";
import AppHeader from "@/components/layout/AppHeader"; 
import AppFooter from "@/components/layout/AppFooter"; 
import { Textarea } from "@/components/ui/textarea"; 
import { Avatar } from "@/components/ui/avatar"; 
import { cn } from "@/lib/utils"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Giả định có component Card

// --- MOCK DATA ---
const mockPosts = [
  {
    id: 'p1',
    author: 'Admin | LearnCode',
    authorAvatar: 'https://i.pravatar.cc/150?img=1',
    isVerified: true,
    content: "Chào mừng đến với Cộng đồng! Hãy giữ thái độ tích cực nhé! Chúng tôi vừa cập nhật một khóa học JavaScript Level 3. Kiểm tra ngay! #JavaScript #NewCourse",
    mediaUrl: 'https://placehold.co/600x400/0ea5e9/ffffff?text=JS+Level+3+Updated',
    mediaType: 'image',
    status: 'APPROVED', 
    timestamp: '1 giờ trước',
    likes: 152,
    comments: 34,
  },
  {
    id: 'p2',
    author: 'Học Viên A',
    authorAvatar: 'https://i.pravatar.cc/150?img=5',
    isVerified: false,
    content: "Có ai đang gặp khó khăn với Flexbox trong bài CSS Level 2 không? Phần `align-self` làm em rối quá! Mọi người có ví dụ trực quan nào dễ hiểu hơn không ạ?",
    status: 'APPROVED',
    timestamp: '3 giờ trước',
    likes: 21,
    comments: 8,
  },
  {
    id: 'p3',
    author: 'Người Mới B',
    authorAvatar: 'https://i.pravatar.cc/150?img=12',
    isVerified: false,
    content: "Bài đăng này đang chờ kiểm duyệt. Nội dung sẽ hiển thị sau khi được phê duyệt.",
    status: 'PENDING',
    timestamp: '5 phút trước',
    likes: 0,
    comments: 0,
  },
];

const mockMembers = [
    { name: 'Dev Luyện', topic: 'Hỗ trợ JS/React' },
    { name: 'Thanh Ngân', topic: 'Chuyên gia CSS Grid' },
    { name: 'Minh Hoàng', topic: 'Thành viên tích cực' },
]

// --- Sub-Components ---

// 1. Post Creator (Nâng cấp với nút đính kèm media)
const PostCreator = () => {
  const currentUserAvatar = "https://i.pravatar.cc/150?img=4"; 
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 rounded-full" src={currentUserAvatar} alt="Your Avatar" /> 
          <Textarea 
            placeholder="Bạn muốn chia sẻ điều gì hôm nay? Đặt câu hỏi, chia sẻ kinh nghiệm, hoặc một mẹo code hay..." 
            rows={3} 
            className="w-full resize-none p-3 border dark:bg-gray-700"
          />
        </div>
        
        {/* Actions Row */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t dark:border-gray-700">
          <div className="flex gap-2">
             <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" title="Đính kèm Ảnh">
                 <ImageIcon className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" className="text-secondary hover:bg-secondary/10" title="Đính kèm Video">
                 <Video className="w-5 h-5" />
             </Button>
          </div>
          <Button className="flex items-center gap-2">
            Đăng Bài <Send className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// 2. Post Card (Nâng cấp với Media)
const PostCard = ({ post }) => {
  const isPending = post.status === 'PENDING';

  // Bài đăng chờ duyệt
  if (isPending) {
    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-5 rounded-xl shadow-md border border-yellow-300 dark:border-yellow-700 opacity-60">
            <div className="flex items-center gap-3 text-yellow-700 dark:text-yellow-300">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Bài viết đang chờ kiểm duyệt</span>
            </div>
            <p className="mt-3 text-sm text-yellow-800 dark:text-yellow-200 line-clamp-2">{post.content}</p>
        </div>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200">
      
      {/* Post Header */}
      <CardHeader className="flex flex-row justify-between items-center pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 rounded-full cursor-pointer" src={post.authorAvatar} alt={post.author} />
          <div>
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              {post.author}
              {post.isVerified && <CheckCircle className="w-4 h-4 text-primary" title="Đã kiểm chứng" />}
            </div>
            <p className="text-xs text-muted-foreground">{post.timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Content */}
        <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{post.content}</p>

        {/* Media Content */}
        {post.mediaUrl && (
            <div className="rounded-lg overflow-hidden border dark:border-gray-700">
                {post.mediaType === 'image' ? (
                    <img src={post.mediaUrl} alt="Post Media" className="w-full max-h-96 object-cover" />
                ) : (
                    <div className="w-full h-64 bg-black flex items-center justify-center text-white">Video Placeholder</div>
                )}
            </div>
        )}

        {/* Post Actions/Stats */}
        <div className="flex justify-between items-center border-t pt-3 border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4 text-primary" /> {post.likes} Thích
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {post.comments} Bình luận
            </span>
          </div>
          <div className="flex gap-1">
             <Button variant="ghost" size="sm" className="flex items-center gap-1 text-primary hover:bg-primary/10">
               <ThumbsUp className="w-4 h-4" /> Thích
             </Button>
             <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700">
               <MessageCircle className="w-4 h-4" /> Bình luận
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 3. Sidebar
const CommunitySidebar = ({ pendingCount }) => (
    <div className="sticky top-20 space-y-6">
        
        {/* Quy tắc Cộng đồng */}
        <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold">Quy Tắc Cộng Đồng</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
                <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Tôn trọng nhau.</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Không spam hay quảng cáo.</p>
                <p className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Đặt câu hỏi rõ ràng (kèm code nếu cần).</p>
                <Link href="/community/rules" className="text-primary hover:underline text-xs block mt-2">Xem chi tiết</Link>
            </CardContent>
        </Card>

        {/* Thành viên nổi bật */}
        <Card>
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold">Thành Viên Nổi Bật</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
                {mockMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 rounded-full" src={`https://i.pravatar.cc/150?img=${10+index}`} alt={member.name} />
                        <div>
                            <p className="font-semibold text-sm">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.topic}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>

        {/* Thông báo kiểm duyệt (Admin/Mod only) */}
        {true && ( // Giả định điều kiện hiển thị nếu user là Admin/Moderator
             <Link href="/community/moderate">
                <Button variant="destructive" className="w-full shadow-md">
                    Kiểm duyệt Bài đăng
                    {pendingCount > 0 && (
                        <span className="ml-2 font-bold">({pendingCount} chờ duyệt)</span>
                    )}
                </Button>
             </Link>
        )}
    </div>
);


export default function CommunityPage() {
  const pendingCount = mockPosts.filter(p => p.status === 'PENDING').length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      
      <AppHeader />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
            
            {/* Column 1: Post Feed & Creator */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Title and Introduction */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Diễn Đàn Học Tập
                    </h1>
                    <p className="text-md text-muted-foreground mt-1">Kết nối, hỏi đáp, và chia sẻ kiến thức cùng cộng đồng lập trình viên Việt Nam.</p>
                </div>

                {/* Post Creator */}
                <PostCreator />
                
                {/* Post Feed */}
                <div className="space-y-6">
                    {mockPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </div>

            {/* Column 2: Sidebar */}
            <div className="lg:col-span-1 hidden lg:block">
                <CommunitySidebar pendingCount={pendingCount} />
            </div>

        </div>
      </main>

      <AppFooter />
    </div>
  );
}