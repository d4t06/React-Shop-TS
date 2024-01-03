import { Param } from "@/store/productsSlice";
import { publicRequest } from "@/utils/request";

export const getProducts = async (props: Param) => {
   if (!props) {
      console.log("product service missing query");
      return [];
   }

   const { filters, sort, category_id, page } = props;
   try {
      if (category_id === undefined) throw new Error("missing category")
      const params: Record<string, string | string[] | number[] | number> = { page: page, category_id };

      if (filters.brands.length) params["brand_id"] = filters.brands.map((b) => b.id) as number[];
      if (sort.column && sort.type) {
         params['column'] = sort.column 
         params['type'] = sort.type 
      }

      const response = await publicRequest.get(`/products`, {
         params,
      });
      return response.data;
   } catch (error) {
      console.log({ message: error });
      throw new Error("loi getProducts services");
   }
};

export const getProductsAdmin = async (params: Param) => {
   const { filters, sort, category_id, page } = params;
   const brand_id = filters.brands.map((b) => b.id);

   try {
      const response = await publicRequest.get(`/product-management/products`, {
         params: {
            page,
            category_id,
            brand_id,
         },
      });
      return response.data;
   } catch (error) {
      console.log("loi getProducts services", error);
   }
};

export const getProductDetail = async (params: { id: string }) => {
   if (!params) {
      console.log("product service missing query");
      return;
   }
   const { id } = params;
   try {
      const response = await publicRequest.get(`/products/${id}`);
      return response.data;
   } catch (error) {
      console.log("loi getProductDetail services", error);
   }
};

export const buyProduct = async (data: any) => {
   if (!data) {
      console.log("data missing !");
      return;
   }
   try {
      publicRequest.post("/products", {
         body: {
            ...data,
         },
      });
   } catch (error) {
      console.log("buy product fail, ", error);
   }
};
