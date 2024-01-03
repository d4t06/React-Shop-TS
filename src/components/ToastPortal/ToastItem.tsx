import classNames from "classnames/bind";

import styles from "./ToastPortal.module.scss";

import { Toast } from "../../types";

type Props = {
   toast: Toast;
   onClick?: (id: string) => void;
};

const cx = classNames.bind(styles);

export default function ToastItem({ toast, onClick }: Props) {
   const classes = {
      icon: `w-[30px] max-[549px]:w-[25px]`,
      container: `text-white px-[12px] py-[6px] rounded-[4px] flex items-center  border `,
      text: `font-[500] text-[14px] max-[549px]:text-[14px] text-[#333]`,
   };

   return (
      <div
         onClick={() => (onClick ? onClick(toast.id) : undefined)}
         className={cx("item-container", { 'bg-red-500 text-white': toast.title === "error", 'bg-emerald-500 text-white': toast.title === "success" })}
      >
         {toast.title && (
            <>
               {toast.title === "success" && <i className="material-icons ">check</i>}
               {toast.title === "error" && <i className="material-icons">report</i>}
            </>
         )}
         <p className={cx("text")}>{toast.desc}</p>
      </div>
   );
}
