import { Zap } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center">
      <Zap className="h-6 w-6 text-blue-500" />
      <span className="ml-2 text-xl font-semibold text-gray-900">
        SaaSify
      </span>
    </div>
  );
};

export default Logo;
