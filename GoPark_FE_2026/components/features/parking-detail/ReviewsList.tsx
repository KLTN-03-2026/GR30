"use client"

import React, { useContext, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { ParkingContext } from "./ParkingContext";
import { get } from "@/lib/api";
import { error } from "console";
import { StarRating } from "./StarRating";


export function ReviewsList() {
  const [rate,setRate] = useState<any[]>([]);

  const context = useContext(ParkingContext);
  if(!context) return null;
  const{dataLot} = context;
  const lotId = dataLot.id;

  useEffect(()=>{
    if(lotId){
    get(`/parking-lots/comment/${lotId}`)
    .then((res:any)=>{
      console.log(res.data);
      setRate(res.data);
    })
    .catch((error)=>{
      console.log(error);
    })
  }
  },[lotId])

  function ConvertDay(time:string){
    return new Date(time).toLocaleString('vi-VN',{
      hour:'2-digit',
      minute:'2-digit',
      day:'2-digit',
      month:'2-digit',
      year:'2-digit',
      hour12:false
    })
  }


  const totalReview = rate.length;

  let total = 0;
  rate.forEach((rate)=>{
    total = total + rate.rating;
  })
  const averageRating =totalReview > 0 ? (total/totalReview).toFixed(1) : "0.0";


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đánh giá từ khách hàng</h2>
         <div className="flex flex-col items-end">
             <div className="flex items-center gap-1 text-yellow-500">
                <span className="text-2xl font-bold text-gray-900 dark:text-white mr-2">{averageRating}</span>
                <StarRating rating={Number(averageRating)} size={20} />
             </div>
             <span className="text-sm text-gray-500 dark:text-gray-400">Dựa trên {totalReview} đánh giá</span>
         </div>
      </div>

      <div className="space-y-6">
        {rate?.slice(0,3).map((r:any)=>(
          <div  key={r.id}className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
            <div className="flex items-center gap-4 mb-3">
              <img 
                src={r.user.profile.image}
                alt="name"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{r.user.profile.name}</h4>
                <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400 gap-2">
                    <div className="flex text-yellow-500 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Number(r.rating)? "fill-current" : "text-gray-300 dark:text-gray-600"}`} 
                  />
                ))}
                    </div>
                    <span>•</span>
                    <span>{ConvertDay(r.created_at)}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm pl-14">
              {r.comment}
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
