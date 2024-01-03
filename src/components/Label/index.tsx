import { useApp } from "@/store/AppContext";

export default function Label({ categoryName, count, loading }: { count: number; categoryName: string; loading: boolean }) {
   const { categories } = useApp();

   // const getCatName = (category_id: string) => {
   //    const curCatData = categories.find((item) => item.id === category_id);
   //    return curCatData?.category_name;
   // };

   return (
      <h1 className="mb-[15px] text-3xl">
         {categoryName} {`( `}
         <span style={{ color: "#cd1818" }}>{!loading ? count : "- -"}</span>
         {` )`} sản phẩm
      </h1>
   );
}
