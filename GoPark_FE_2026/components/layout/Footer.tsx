"use client";

import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const footerSections = {
    tài_nguyên: [
      { name: "Tìm bãi đỗ", href: "/book" },
      { name: "Ứng dụng di động", href: "/app" },
      { name: "Bảng giá", href: "/pricing" },
      { name: "Câu hỏi thường gặp", href: "/faq" },
      { name: "Phản hồi", href: "/feedback" },
    ],
    hỗ_trợ: [
      { name: "Hỗ trợ khách hàng", href: "/support" },
      { name: "Trạng thái đặt chỗ", href: "/booking-status" },
      { name: "Chính sách hủy", href: "/cancel" },
      { name: "Phương thức thanh toán", href: "/payment" },
      { name: "Liên hệ", href: "/contact" },
    ],
    công_ty: [
      { name: "Về GoPark", href: "/about" },
      { name: "Tin tức & Cập nhật", href: "/news" },
      { name: "Tuyển dụng", href: "/careers" },
      { name: "Hợp tác", href: "/partners" },
      { name: "Điều khoản sử dụng", href: "/terms" },
      { name: "Chính sách bảo mật", href: "/privacy" },
    ],
    khuyến_mãi: [
      { name: "Người dùng mới", href: "/promo/first-time" },
      { name: "Vé tháng", href: "/promo/monthly" },
      { name: "Thưởng giới thiệu", href: "/promo/referral" },
      { name: "Gói doanh nghiệp", href: "/promo/corporate" },
    ],
  };

  const legalLinks = [
    { name: "Điều khoản dịch vụ", href: "/terms" },
    { name: "Chính sách bảo mật", href: "/privacy" },
    { name: "Chính sách cookie", href: "/cookies" },
  ];

  const socialIcons = [
    { icon: <Facebook size={16} />, href: "https://facebook.com" },
    { icon: <Twitter size={16} />, href: "https://twitter.com" },
    { icon: <Instagram size={16} />, href: "https://instagram.com" },
    { icon: <Youtube size={16} />, href: "https://youtube.com" },
  ];

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerSections).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold mb-4 capitalize">
                {section.replace("_", " ")}
              </h3>
              <ul className="space-y-2">
                {links.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400 text-xs mb-2">
              © 2025 GoPark. Mọi quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap gap-4">
              {legalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-xs transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4">
            {socialIcons.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;