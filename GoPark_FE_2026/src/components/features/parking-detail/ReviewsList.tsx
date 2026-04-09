import React from "react";
import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    date: "12/03/2026",
    content: "Bãi đỗ rất sạch sẽ, thẻ từ thông minh quẹt rất nhanh. Bảo vệ thân thiện, hỗ trợ lùi xe rất nhiệt tình. Tôi sẽ ghé lại.",
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 4,
    date: "05/03/2026",
    content: "Không gian rộng rãi, dễ tìm. Tuy nhiên lối ra vào vào giờ cao điểm hơi kẹt xe một chút. Mức giá hợp lý so với khu trung tâm.",
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=8",
    rating: 5,
    date: "28/02/2026",
    content: "Ứng dụng tuyệt vời, đặt chỗ trước không sợ hết chỗ khi lên quận 1. Bãi đỗ có mái che nên không lo nắng mưa.",
  }
];

export function ReviewsList() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đánh giá từ khách hàng</h2>
         <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 text-yellow-500">
                <span className="text-2xl font-bold text-gray-900 dark:text-white mr-2">4.8</span>
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current text-yellow-200 dark:text-gray-600" />
             </div>
             <span className="text-sm text-gray-500 dark:text-gray-400">Dựa trên 124 đánh giá</span>
         </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
            <div className="flex items-center gap-4 mb-3">
              <img 
                src={review.avatar} 
                alt={review.name} 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{review.name}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 gap-2">
                    <div className="flex text-yellow-500 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"}`} 
                            />
                        ))}
                    </div>
                    <span>•</span>
                    <span>{review.date}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm pl-14">
              {review.content}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
         <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
            Xem tất cả đánh giá
         </button>
      </div>
    </div>
  );
}
