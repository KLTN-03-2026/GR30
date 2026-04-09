"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, Home, Moon, Sun, ChevronDown, MapPin, DollarSign, Building, Loader2 } from "lucide-react"
import Link from "next/link";
import { useTheme } from "next-themes";

interface Suggestion {
  lat: number;
  lng: number;
  name: string;
  display_name: string;
}

export function TopFilter({ onSearch }: { onSearch?: (dst: {lng: number, lat: number, name: string} | null) => void }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Đóng dropdown khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!searchValue.trim()) {
      setSuggestions([]);
      return;
    }

    if (!showSuggestions) return; // Nếu vừa chọn từ danh sách thì không fetch lại

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&limit=5&countrycodes=vn`);
        const data = await res.json();
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parsed = data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            name: item.name || item.display_name.split(',')[0],
            display_name: item.display_name
          }));
          setSuggestions(parsed);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Lỗi fetch gợi ý:", error);
      }
    }, 500); // 500ms debounce

  }, [searchValue, showSuggestions]);

  const handleSelectSuggestion = (sug: Suggestion) => {
    setSearchValue(sug.name);
    setShowSuggestions(false);
    onSearch?.({
      lat: sug.lat,
      lng: sug.lng,
      name: sug.name
    });
  };

  const handleSearchClick = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSuggestions(false);
    
    if (!searchValue.trim()) {
      onSearch?.(null);
      return;
    }
    
    // Nếu trong Suggestions đang có item khớp, lấy luôn thay vì fetch lại limit=1
    const matching = suggestions.find(s => s.name.toLowerCase() === searchValue.toLowerCase());
    if (matching) {
       onSearch?.({ lat: matching.lat, lng: matching.lng, name: matching.name });
       return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}&limit=1&countrycodes=vn`);
      const data = await res.json();
      if (data && data.length > 0) {
        onSearch?.({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: data[0].name || data[0].display_name.split(',')[0],
        });
      } else {
        alert("Không tìm thấy địa điểm");
      }
    } catch(error) {
      console.error(error);
      alert("Lỗi tìm kiếm địa điểm");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="flex flex-col z-20 relative bg-background dark:bg-[#10b981] shadow-sm z-50 border-b transition-colors dark:border-[#059669]">
      <div className="flex items-center justify-between px-4 py-2 h-14 gap-4 relative z-50 bg-background dark:bg-[#10b981]">
        {/* Nút về trang chủ */}
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full max-sm:hidden dark:text-white dark:hover:bg-[#059669]" type="button">
            <Home className="h-5 w-5" />
          </Button>
        </Link>

        {/* Khung search chính */}
        <div className="flex-1 max-w-xl relative" ref={dropdownRef}>
          <form onSubmit={handleSearchClick} className="flex items-center gap-2 bg-muted/50 dark:bg-black/30 p-1 rounded-full px-4 border border-transparent dark:border-white/20">
            <Search className="h-4 w-4 text-muted-foreground dark:text-white/70" />
            <Input 
              className="border-none shadow-none bg-transparent focus-visible:ring-0 flex-1 dark:text-white dark:placeholder:text-white/50 h-8 text-sm" 
              placeholder="Tìm kiếm khu vực, tên đường..." 
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <Button type="submit" disabled={isSearching} size="sm" className="h-7 rounded-full px-3 md:px-4 text-xs font-medium">
              {isSearching ? <Loader2 className="h-3 w-3 animate-spin mr-1 md:mr-2" /> : null}
              Tìm
            </Button>
          </form>

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-background dark:bg-[#064e3b] dark:text-white border shadow-lg rounded-xl overflow-hidden z-[60]">
              <ul className="py-1 max-h-[300px] overflow-y-auto">
                {suggestions.map((sug, i) => (
                  <li 
                    key={i}
                    className="px-4 py-2 hover:bg-muted dark:hover:bg-white/10 cursor-pointer flex flex-col items-start text-sm transition-colors"
                    onClick={() => handleSelectSuggestion(sug)}
                  >
                    <span className="font-medium">{sug.name}</span>
                    <span className="text-xs text-muted-foreground dark:text-white/70 truncate w-full">{sug.display_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Cụm công cụ (Theme + Lọc nâng cao) */}
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full gap-2 transition-colors dark:text-white dark:hover:bg-[#059669] h-9 w-9"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          <Button 
            variant={showAdvanced ? "secondary" : "outline"} 
            onClick={() => setShowAdvanced(!showAdvanced)}
            type="button"
            className={"rounded-full gap-2 transition-colors h-9 px-4 text-sm " + (showAdvanced ? "bg-secondary dark:bg-[#059669] dark:text-white dark:border-[#059669]" : "dark:text-white dark:border-white/50 dark:hover:bg-[#059669]")}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="max-sm:hidden">Lọc nâng cao</span>
            <ChevronDown className={"h-3.5 w-3.5 transition-transform " + (showAdvanced ? "rotate-180" : "")} />
          </Button>
        </div>
      </div>

      {/* Dropdown Lọc nâng cao - Dính với thanh header, không đè màn trái */}
      {showAdvanced && (
        <div className="absolute top-14 right-0 lg:right-4 p-3 bg-background dark:bg-[#064e3b] border dark:border-white/20 shadow-xl rounded-b-xl lg:rounded-xl animate-in fade-in slide-in-from-top-2 dark:text-white z-40 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Lọc theo thành phố */}
            <div className="flex flex-col gap-1.5 min-w-[150px]">
               <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground dark:text-white/80">
                 <Building className="h-3.5 w-3.5" /> Thành phố
               </label>
               <select className="border rounded-md px-2 py-1.5 text-sm bg-transparent dark:border-white/30 outline-none focus:border-primary dark:focus:border-white h-8">
                 <option value="" className="dark:bg-[#064e3b]">Chọn TP...</option>
                 <option value="hcm" className="dark:bg-[#064e3b]">Hồ Chí Minh</option>
                 <option value="hn" className="dark:bg-[#064e3b]">Hà Nội</option>
                 <option value="dn" className="dark:bg-[#064e3b]">Đà Nẵng</option>
               </select>
            </div>
            
            {/* Khoảng cách */}
            <div className="flex flex-col gap-1.5 min-w-[160px]">
               <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground dark:text-white/80">
                 <MapPin className="h-3.5 w-3.5" /> Khoảng cách
               </label>
               <select className="border rounded-md px-2 py-1.5 text-sm bg-transparent dark:border-white/30 outline-none focus:border-primary dark:focus:border-white h-8">
                 <option value="" className="dark:bg-[#064e3b]">Tất cả</option>
                 <option value="1" className="dark:bg-[#064e3b]">Gần tôi (Bán kính 1km)</option>
                 <option value="2" className="dark:bg-[#064e3b]">Bán kính 2km</option>
                 <option value="5" className="dark:bg-[#064e3b]">Bán kính 5km</option>
               </select>
            </div>

            {/* Sắp xếp giá */}
            <div className="flex flex-col gap-1.5 min-w-[180px]">
               <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground dark:text-white/80">
                 <DollarSign className="h-3.5 w-3.5" /> Giá tiền
               </label>
               <select className="border rounded-md px-2 py-1.5 text-sm bg-transparent dark:border-white/30 outline-none focus:border-primary dark:focus:border-white h-8">
                 <option value="" className="dark:bg-[#064e3b]">Mặc định</option>
                 <option value="asc" className="dark:bg-[#064e3b]">Thấp đến cao</option>
                 <option value="desc" className="dark:bg-[#064e3b]">Cao đến thấp</option>
               </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t dark:border-white/10">
            <Button size="sm" variant="ghost" onClick={() => setShowAdvanced(false)} className="h-8 dark:text-white hover:bg-muted dark:hover:bg-white/10" type="button">Hủy</Button>
            <Button size="sm" onClick={() => setShowAdvanced(false)} className="h-8 dark:bg-white dark:text-[#064e3b] dark:hover:bg-gray-200" type="button">Áp dụng</Button>
          </div>
        </div>
      )}
    </div>
  )
}
