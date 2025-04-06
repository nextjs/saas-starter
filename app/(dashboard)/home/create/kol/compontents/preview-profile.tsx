import Image from "next/image";
import { Link, CalendarDays } from "lucide-react";

import banner from "@/app/assets/image/banner.png";
import avatar from "@/app/assets/image/avatar.png";

export default function PreviewProfile() {
  return (
    <div className="text-md">
      <div className="h-48 relative bg-primary/10">
        <Image src={banner} alt="banner" fill />
        <div className="absolute bottom-0 left-4 w-28 h-28 rounded-full bg-muted-foreground border-4 translate-y-1/2 border-background overflow-hidden">
          <Image src={avatar} alt="avatar" fill />
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="h-10"></div>
        <dl>
          <dt className="text-xl font-bold">KOL Agent</dt>
          <dd className="text-muted-foreground">@KOLAGENT</dd>
        </dl>
        <p>PROGRAMMED TO KOL AGENT</p>
        <ul className="flex space-x-4 items-center">
          <li className="flex items-center space-x-1">
            <Link className="w-4 h-4 text-muted-foreground" />
            <span className="text-blue-500 underline">kol-agent.com</span>
          </li>
          <li className="flex items-center space-x-1">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Joined January 2025</span>
          </li>
        </ul>
        <ul className="flex space-x-4 items-center">
          <li className="space-x-1">
            <strong className="font-bold">21</strong>
            <span className="text-muted-foreground">Following</span>
          </li>
          <li className="space-x-1">
            <strong className="font-bold">640K</strong>
            <span className="text-muted-foreground">Followers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
