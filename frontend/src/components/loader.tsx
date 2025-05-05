// import React from "react";
import { Loader as LucideLoader } from "lucide-react";
import appIcon from "../assets/app-icon.png";
import { cn } from "../utils";
import { FC } from "react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Loader:FC<SpinnerProps> = ({ className, size = 16 }) => {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <LucideLoader className={`animate-spin text-muted-foreground ${className}`} size={size} />
    </div>
  );
}; 

export const IconSpinner: FC<SpinnerProps> = ({ className }) => {
  return (
      <div className={cn(`flex w-full min-h-[60vh] items-center justify-center`, className)}>
        <img 
          src={appIcon}
          alt="loading---"
          className={`transition-opacity duration-2000 animate-[shimmer_1.5s_infinite] w-[100px]`}
        />
      </div>
  );
};
