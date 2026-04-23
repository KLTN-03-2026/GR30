"use client"

import React, { useContext, useEffect, useState } from "react";
import { Star, MapPin, Banknote } from "lucide-react";
import { title } from "process";
import { get } from "@/lib/api";
import { useParams } from "next/navigation";
import { error } from "console";
import { ParkingContext } from "./ParkingContext";


  export function SuggestedParking() {
    const [nearLots,setNearLots] = useState([]);
    const param = useParams();
    const nearbyParkingLot = param.id;

    const context = useContext(ParkingContext);
    if(!context) return null
    const {dataLot}= context;

    useEffect(()=>{
      // CHỈ GỌI API KHI CÓ ĐỦ DỮ LIỆU
      if (nearbyParkingLot && dataLot?.lat && dataLot?.lng) {
      const { lat, lng } = dataLot;
      console.log(lat,lng)
      get(`/parking-lots/nearby/${nearbyParkingLot}?lat=${lat}&lng=${lng}`)
      .then((res : any)=>{
        console.log(res);
        setNearLots(res.data);
      }).catch((error : any)=>{
        console.log(error);
      })
    }
    },[nearbyParkingLot,dataLot])
  //console.log(nearLots)
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Các bãi đỗ xe gợi ý gần đây</h2>
        <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
          Xem tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {nearLots.map((lot : any)=>(
          <div key = {lot.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              <img 
                src={lot.image?.thumbnail || "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=800&auto=format&fit=crop"}
                alt={lot.name || "anh"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                {Number(lot.avgRating).toFixed(1)}
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1" title='title'>
                {lot.name}
              </h3>
              
              <div className="space-y-1.5 mt-2">
                <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{lot.address}</span>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  {/* <div className="flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                    <Banknote className="w-4 h-4" />
                    <span>price</span>
                  </div> */}
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    Cách {lot.distance}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
