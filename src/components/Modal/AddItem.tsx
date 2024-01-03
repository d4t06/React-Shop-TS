import { Dispatch, FormEvent, SetStateAction, useEffect, useState, useRef, ReactNode } from "react";
//  import ModalHeader from "./ModalHeader";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ModalHeader from "./ModalHeader";

type Props = {
   setIsOpenModal: Dispatch<SetStateAction<boolean>>;
   cbWhenSubmit: (value: string) => void;
   title: string;
   initValue?: string;
   children?: ReactNode;
   loading?: boolean;
};

export default function AddItem({ setIsOpenModal, cbWhenSubmit, title, initValue, loading, children }: Props) {
   const [value, setValue] = useState(initValue || "");
   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      inputRef.current?.focus();
   }, []);

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      cbWhenSubmit(value);
   };

   return (
      <div className="w-[300px] bg-[#fff]">
         <ModalHeader setIsOpenModal={setIsOpenModal} title={title} />
         <form action="" onSubmit={handleSubmit}>
            <Input
               className="w-full"
               ref={inputRef}
               placeholder="name..."
               value={value}
               cb={(value) => setValue(value)}
            />

            {children}

            <p className="text-right mt-[20px]">
               <Button isLoading={loading} type="submit" primary>
                  Save
               </Button>
            </p>
         </form>
      </div>
   );
}
