import { ReactNode, useMemo } from "react";

type Props = {
   data: {
      cb: () => void;
      icon: string;
      className?: string;
   }[];
   children?: ReactNode;
};

export default function OverlayCTA({ data }: Props) {
   const CTA = useMemo(() => {
      return data.map((item, index) => {
         const { cb, icon, className = "text-white hover:text-red-500 hover:scale-[1.2] transition-transform" } = item;

         return (
            <button key={index} onClick={cb} className={className}>
               <i className="material-icons  text-current">{icon}</i>
            </button>
         );
      });
   }, [data]);
   return (
      <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center gap-[12px]">
         {CTA}
      </div>
   );
}
