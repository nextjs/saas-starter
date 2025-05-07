import { Zap } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
}

const Logo = ({ collapsed = false }: LogoProps) => {
  return (
    <div className="flex items-center">
      <Zap className="h-6 w-6 text-blue-500" />
      {!collapsed && (
        <span className="ml-2 text-xl font-semibold text-gray-900">
          SaaSify
        </span>
      )}
    </div>
  );
};

export default Logo;
