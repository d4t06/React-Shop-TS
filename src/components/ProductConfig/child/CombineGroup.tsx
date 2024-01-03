import { Ref, forwardRef, useImperativeHandle, useRef, useState } from "react";
import { moneyFormat } from "@/utils/appHelper";
import Input from "@/components/ui/Input";
import { ProductCombine } from "@/types";

type InputGroupProps = {
   initCombine: ProductCombine;
   isExist: boolean;
};

export type CombineRef = {
   submit: () => { data: ProductCombine; type: "new" | "update" } | undefined;
   validate: () => boolean;
};

function InputGroup({ initCombine, isExist }: InputGroupProps, ref: Ref<CombineRef>) {
   const [combineData, setCombineData] = useState<ProductCombine>(initCombine);
   const stockCombine = useRef(initCombine);
   const [error, setError] = useState(false);

   const handleInput = (field: keyof typeof combineData, value: string) => {
      setError(false);
      if (field === "price") {
         value = value.replaceAll(",", "");
      }
      if (!Number.isInteger(+value)) return;
      setCombineData({ ...combineData, [field]: +value });
   };

   const detectChange = () => {
      if (stockCombine.current.price !== combineData.price || stockCombine.current.quantity !== combineData.quantity)
         return true;
      else return false;
   };

   const trackingCombine = (): "new" | "update" | "unChange" => {
      if (!isExist) return "new";
      if (detectChange()) return "update";
      return "unChange";
   };

   const validate = () => {
      if (!combineData.price) {
         setError(true);
         return true;
      } else return false;
   };

   const submit: CombineRef["submit"] = () => {
      const status = trackingCombine();
      switch (status) {
         case "new":
            return { data: combineData, type: "new" };
         case "update":
            return { data: combineData, type: "update" };
         case "unChange":
            console.log("unChange combine");
            return;
      }
   };

   useImperativeHandle(ref, () => ({
      submit,
      validate,
   }));

   return (
      <div className="col col-6">
         <div className="row">
            <div className="col col-6">
               <Input
                  type="number"
                  placeholder="Quantity"
                  value={combineData.quantity}
                  cb={(value) => handleInput("quantity", value)}
               />
            </div>

            <div className="col col-6">
               <Input
                  type="text"
                  className={error ? "bg-red-200" : ""}
                  placeholder="Price"
                  value={moneyFormat(combineData.price || "")}
                  cb={(value) => handleInput("price", value)}
               />
            </div>
         </div>
      </div>
   );
}

export default forwardRef(InputGroup);
