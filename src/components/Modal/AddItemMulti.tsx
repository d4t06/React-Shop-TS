import { Dispatch, FormEvent, SetStateAction, useEffect, useState, useRef, useMemo, ReactNode } from "react";
//  import ModalHeader from "./ModalHeader";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ModalHeader from "./ModalHeader";
import { generateId } from "@/utils/appHelper";

type Props = {
   setIsOpenModal: Dispatch<SetStateAction<boolean>>;
   cb: ({}: Record<string, string>) => void;
   title: string;
   fields: string[];
   intiFieldData?: Record<string, string>;
   children?: ReactNode;
};

const initState = (fields: string[]) => {
   return fields.map((f) => ({ name: f, name_ascii: generateId(f) }));
};

const intiFieldDataState = (inputFields: ReturnType<typeof initState>) => {
   let data: Record<string, string> = {};
   inputFields.forEach((item) => {
      data[item.name_ascii] = "";
   });

   return data;
};

export default function AddItemMulti({ setIsOpenModal, cb, title, fields, intiFieldData, children }: Props) {
   const inputFields = useMemo(() => {
      return initState(fields);
   }, [fields]);

   const [fieldData, setFieldData] = useState(intiFieldData || intiFieldDataState(inputFields));

   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      inputRef.current?.focus();
   }, []);

   const handleInput = (value: string, name: string) => {
      setFieldData({ ...fieldData, [name]: value });
   };

   const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      cb(fieldData);
   };

   return (
      <div className="w-[300px] bg-[#fff]">
         <ModalHeader setIsOpenModal={setIsOpenModal} title={title} />
         <form action="" onSubmit={handleSubmit}>
            {inputFields.map((item, index) => (
               <div key={index} className=" mb-[15px]">
                  <label
                     className="font-semibold text-[16px] h-[30px] mb-[4px] flex items-end"
                     htmlFor={item.name_ascii}
                  >
                     {item.name}
                     {item.name_ascii === "icon" && (
                        <i className="material-icons ml-[8px]">{fieldData[item.name_ascii]}</i>
                     )}
                  </label>
                  <Input
                     key={index}
                     className="w-full"
                     ref={index === 0 ? inputRef : undefined}
                     id={item.name_ascii}
                     placeholder={item.name}
                     value={fieldData[item.name_ascii]}
                     cb={(value) => handleInput(value, item.name_ascii)}
                  />
               </div>
            ))}

            {children}

            <p className="text-right mt-[20px]">
               <Button type="submit" primary>
                  Save
               </Button>
            </p>
         </form>
      </div>
   );
}
