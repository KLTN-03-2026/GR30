import React from 'react';
import { Search, CalendarCheck, CheckCircle, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-7 h-7" />,
    title: 'Tìm chỗ đỗ xe',
    description: 'Dễ dàng tìm kiếm bãi đỗ xe gần bạn. Trạng thái chỗ đỗ (trống/đầy) được cập nhật liên tục theo thời gian thực.',
  },
  {
    icon: <CalendarCheck className="w-7 h-7" />,
    title: 'Đặt trước dễ dàng',
    description: 'Chọn bãi đỗ xe và đặt chỗ trước. Hệ thống sẽ giữ chỗ cho bạn theo khung giờ đã đăng ký.',
  },
  {
    icon: <CheckCircle className="w-7 h-7" />,
    title: 'Gửi xe tự động',
    description: 'Hệ thống camera nhận diện biển số thông minh tự động mở Barrier khi bạn đến bãi. Không cần vé giấy.',
  },
  {
    icon: <CreditCard className="w-7 h-7" />,
    title: 'Thanh toán & Lấy xe',
    description: 'Thanh toán trực tuyến tiện lợi qua ứng dụng hoặc ví điện tử. Lấy xe ra khỏi bãi dễ dàng, không tiền mặt.',
  },
];

const AboutSection = () => {
  return (
    <section className="relative py-28 bg-primary dark:bg-background overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 dark:bg-primary/10 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-black/10 dark:bg-primary/5 rounded-full blur-3xl translate-y-1/2"></div>
        {/* CSS Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 dark:bg-primary/20 text-white dark:text-primary text-sm font-semibold tracking-wider mb-6 border border-white/20 dark:border-primary/20 backdrop-blur-sm">
            HOW IT WORKS
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-white dark:text-foreground">
            Quy trình đỗ xe thông minh
          </h2>
          <p className="text-lg md:text-xl text-white/90 dark:text-muted-foreground font-medium">
            Trải nghiệm gửi xe thời đại số với các bước đơn giản, nhanh chóng và bảo mật cao. Tiết kiệm thời gian, không lo hết chỗ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative p-8 bg-white dark:bg-card rounded-3xl shadow-xl dark:shadow-none border border-transparent dark:border-border hover:-translate-y-2 transition-all duration-300 group overflow-hidden"
            >
              {/* Large Background Number */}
              <div className="absolute -right-4 -top-8 text-9xl font-black text-slate-50 dark:text-slate-900/50 z-0 select-none transition-transform duration-500 group-hover:scale-110">
                {index + 1}
              </div>
              
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>

              {/* Connecting line for xl screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[5.5rem] left-[calc(100%-1.5rem)] w-[calc(100%+3rem)] h-[3px] z-20">
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-primary origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out"></div>
                  </div>
                </div>
              )}
              
              <div className="relative z-10 w-16 h-16 bg-blue-50 text-primary dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-primary/30 group-hover:shadow-lg">
                {step.icon}
              </div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-slate-600 dark:text-muted-foreground leading-relaxed text-sm font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
