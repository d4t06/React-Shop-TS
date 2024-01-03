import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ProductDetailItem } from "@/components";
import * as productServices from "../../services/productServices";
import { Detail, Product } from "@/types";

function DetailPage() {
   const [product, setProduct] = useState<Product & Detail>();
   const [status, setStatus] = useState<"loading" | "finish" | "error">("loading");
   // const useEffectRan = useRef(false);

   const { category, key } = useParams();

   useEffect(() => {
      const fetchData = async () => {
         try {
            if (!category || !key) return;

            const data = await productServices.getProductDetail({ id: key });
            setProduct(data);
            setStatus("finish");
         } catch (error) {
            setStatus("error");
         }
      };
      fetchData();
   }, [key]);

   if (status === "loading") return <h1>...</h1>;
   if (status === "error") return <h1>Some thing went wrong</h1>;

   if (!product) return <h1>loading</h1>;

   return (
      <div>
         <ProductDetailItem data={product} />
      </div>
   );
}
export default DetailPage;
