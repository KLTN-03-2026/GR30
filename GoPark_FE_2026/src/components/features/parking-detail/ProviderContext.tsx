"use client";

import { get } from "@/lib/api";
import { useParams } from "next/navigation";
import {  use, useEffect, useState } from "react";
import { ParkingContext } from "./ParkingContext";

function ParkingProvider({children} : {children : React.ReactNode}) {

    const [dataLot,setDataLot] = useState<any>({});
    const [loadingLot,setLoadingLot] = useState(true);
    const [selectedSpot, setSelectedSpot] = useState<any>(null);
    
    const params = useParams();
    const parkingLotId = params.id;
    console.log("Parking Lot ID:", parkingLotId);
    useEffect(()=>{
        get(`/parking-lots/map/${parkingLotId}`)
        .then((res : any) => {
            console.log(res.data);
            setDataLot(res.data);
        }).catch((error : any)=>{
            console.log(error);
        }).finally(()=>{
            setLoadingLot(false);
        })
    },[parkingLotId])

    return(
        <ParkingContext.Provider value={{dataLot,setDataLot,loadingLot,
        setLoadingLot,selectedSpot,setSelectedSpot}}>
            {children}
        </ParkingContext.Provider>

    )
}
export default ParkingProvider;