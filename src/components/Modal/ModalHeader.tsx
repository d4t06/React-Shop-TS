import { Dispatch, SetStateAction } from "react";

export default function ModalHeader({
   setIsOpenModal,
   title,
}: {
   title: string;
   setIsOpenModal: Dispatch<SetStateAction<boolean>>;
}) {
   return (
      <div className="flex justify-between mb-[15px]">
         <h1 className="text-[26px] font-semibold">{title}</h1>
         <button onClick={() => setIsOpenModal(false)}>
            <i className="material-icons">close</i>
         </button>
      </div>
   );
}
