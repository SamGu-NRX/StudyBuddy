import Pricing from "@/components/main/Pricing";
import Sidebar from "@/components/SidebarDash";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import Header from "@/components/HeaderDash"

export default function Upgrade(){
    return (
        <div className="flex min-h-screen w-full flex-col">
          <Sidebar/>
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <Header/>
          </div>
          <Pricing/>
        </div>
    )
}