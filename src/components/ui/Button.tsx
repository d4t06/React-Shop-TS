import { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
   onClick?: () => void;
   isLoading?: boolean;
   circle?: boolean;
   primary?: boolean;
   children: ReactNode;
   disable?: boolean;
   className?: string;
   type?: HTMLButtonElement["type"];
};
export default function Button({
   onClick,
   circle,
   isLoading,
   primary,
   disable,
   type = "button",
   children,
   className,
}: Props) {
   const classes = {
      button: "text-[14px] inline-flex items-center justify-center font-semibold",
      primary: " hover:brightness-[90%]  rounded-[6px] px-[16px] py-[4px] bg-[#cd1818] text-[white]",
      circle: "rounded-[50%] p-[6px]",
   };

   return (
      <button
         type={type || "button"}
         onClick={onClick}
         disabled={isLoading || disable}
         className={`${disable ? "opacity-60 pointer-events-none" : ""} ${classes.button} ${className} ${
            primary && classes.primary
         } ${circle && classes.circle}`}
      >
         {isLoading && <i className="material-icons animate-spin">sync</i>}
         {!isLoading && children}
      </button>
   );
}
