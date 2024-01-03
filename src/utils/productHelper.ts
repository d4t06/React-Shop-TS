import {
   ProductColor,
   ProductCombine,
   ProductCombineSchema,
   ProductSliderSchema,
   ProductStorage,
   SliderSchema,
} from "@/types";

export const trackingColors = (stockColors: ProductColor[], currentColors: ProductColor[]) => {
   const newColors: ProductColor[] = [];
   currentColors.forEach((item) => {
      const existingItem = stockColors.find((stockItem) => stockItem.color_ascii === item.color_ascii);
      if (!existingItem) return newColors.push(item);
   });

   const removedColorIds: number[] = [];
   stockColors.forEach((stockItem) => {
      const existingItem = currentColors.find((item) => item.color_ascii === stockItem.color_ascii);
      if (!existingItem) return removedColorIds.push(stockItem.id as number);
   });

   return { newColors, removedColorIds };
};

export const trackingStorages = (stockStorages: ProductStorage[], currentStorages: ProductStorage[]) => {
   const newStorages: ProductStorage[] = [];
   currentStorages.forEach((item) => {
      const existingItem = stockStorages.find((stockItem) => stockItem.storage_ascii === item.storage_ascii);
      if (!existingItem) return newStorages.push(item);
   });

   const removedStorages: ProductStorage[] = [];
   stockStorages.forEach((stockItem) => {
      const existingItem = currentStorages.find((item) => item.storage_ascii === stockItem.storage_ascii);
      if (!existingItem) return removedStorages.push(stockItem);
   });

   return { newStorages, removedStorages };
};

const haveLowerPrice = (storage: ProductStorage, cb: ProductCombine, minPrice: number) => {
   if (!minPrice) return true;
   if (cb.storage_id === storage.id && minPrice > cb.price) return true;
   else return false;
};
export const findMinCombineOfStorage = (storage: ProductStorage, combines: ProductCombine[]) => {
   let minPrice = 999999999;
   let minCB: ProductCombine | undefined;
   let defaultCB: ProductCombine | undefined;

   combines.forEach((cb) => {
      if (cb.default) defaultCB = cb;
      if (haveLowerPrice(storage, cb, minPrice)) {
         minPrice = cb.price;
         minCB = cb;
      }
   });
   return { minPrice, cb: minCB, defaultCB };
};

export const initCombinesForInsert = (
   newCombines: ProductCombine[],
   colorIdObject: Record<string, number>,
   storageIdObject: Record<string, number>
) => {
   const combinesSchema = newCombines.map((cb) => {
      cb.color_id = colorIdObject[cb.color_data.color_ascii as keyof typeof colorIdObject];
      cb.storage_id = storageIdObject[cb.storage_data.storage_ascii as keyof typeof storageIdObject];

      let combineSchema: ProductCombineSchema;
      const { color_data, storage_data, id, ...schema } = cb;
      combineSchema = schema;

      return combineSchema;
   });
   return combinesSchema;
};

export const initProductSlidersForInsert = (
   sliders: (SliderSchema & { id: number; color_ascii: string })[],
   colors: ProductColor[],
   product_name_ascii: string
) => {
   const data = sliders.map((slider) => {
      const colorItem = colors.find((color) => color.color_ascii === slider.color_ascii);
      if (colorItem && slider.id) {
         return {
            color_id: colorItem.id,
            product_name_ascii,
            slider_id: slider.id,
         } as ProductSliderSchema;
      }
   });

   return data || [];
};
