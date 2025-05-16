import { Layers } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
}

const Logo = ({ collapsed = false }: LogoProps) => {
  return (
    <div className="flex items-center">
      <Layers className="h-6 w-6 bg-zinc-900 text-white rounded-md p-1" />
      {!collapsed && (
        <span className="ml-2 text-xl font-semibold text-gray-900">
          SaaS Stack
        </span>
      )}
    </div>
  );
};

export default Logo;
