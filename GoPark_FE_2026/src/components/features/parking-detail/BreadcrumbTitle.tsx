"use client";

import React, { useContext } from "react";
import { ParkingContext } from "./ParkingContext";

export default function BreadcrumbTitle() {
  const context = useContext(ParkingContext);
  const title = context?.dataLot?.name || "Chi tiết Bãi đỗ xe";

  return <span className="text-gray-900 dark:text-white font-medium">{title}</span>;
}