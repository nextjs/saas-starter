import { ReactNode } from "react";
import Link from "next/link";
import { Bot } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const Routes = {
  CREATE: "/home/create/kol",
};

const SidebarNavItem = (props: {
  icon: ReactNode;
  title: string;
  href: string;
  target?: string;
  isActive?: boolean;
}) => {
  const { icon, title, href, target = "_self", isActive } = props;

  return (
    <li className="">
      <Link
        className={clsx(
          "flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-background transition-colors cursor-pointer",
          isActive
            ? "text-foreground bg-gradient-to-r from-[#0bbdb6] to-[#00d179] hover:bg-gradient-to-r hover:from-[#0bbdb6] hover:to-[#00d179]"
            : "hover:text-foreground hover:bg-gradient-to-r hover:from-[#0bbdb6]/90 hover:to-[#00d179]/90"
        )}
        href={href}
        target={target}
        prefetch={true}
      >
        {icon}
        <span className="text-md capitalize whitespace-nowrap">{title}</span>
      </Link>
    </li>
  );
};

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 pt-4">
      <ul className="px-4">
        <SidebarNavItem
          icon={<Bot className="size-5 min-w-5" />}
          title="create KOL agent"
          href={Routes.CREATE}
          isActive={pathname.includes(Routes.CREATE)}
        />
      </ul>
      <div className="h-px bg-border"></div>
    </div>
  );
}
