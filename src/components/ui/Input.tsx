import { InputHTMLAttributes, Ref, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
   cb: (value: string) => void;
}

export const inputClasses = {
   input: "p-[6px] bg-[#fff] rounded-[6px] border border-black/15 text-[16px]",
};

function Input({ cb, className, placeholder, type, value, ...props }: Props, ref: Ref<any>) {
   return (
      <input
         ref={ref}
         placeholder={placeholder}
         onChange={(e) => cb(e.target.value)}
         type={type || 'text'}
         value={value}
         className={`${inputClasses.input} ${className}`}
         {...props}
      />
   );
}

export default forwardRef(Input);
