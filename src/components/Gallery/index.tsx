import { useEffect, useState, useRef, ChangeEvent, Dispatch, SetStateAction } from "react";
import classNames from "classnames/bind";

import { Button } from "../";

import styles from "./Gallery.module.scss";
import usePrivateRequest from "@/hooks/usePrivateRequest";
import { ImageType } from "@/types";
import { sleep } from "@/utils/appHelper";

const cx = classNames.bind(styles);

type Props = {
   setImageUrl: (image_url: string) => void;
   setIsOpenModal: Dispatch<SetStateAction<boolean>>;
};

const IMAGE_URL = "/image-management/images";

function Gallery({ setImageUrl, setIsOpenModal }: Props) {
   const [images, setImages] = useState<ImageType[]>([]);
   const [active, setActive] = useState<ImageType>();

   const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
   const [apiLoading, setApiLoading] = useState(false);

   const ranUseEffect = useRef(false);

   const privateRequest = usePrivateRequest();

   const formatSize = (size: number) => {
      const units = ["Kb", "Mb"];
      let mb = 0;

      if (size < 1024) return size + units[mb];
      while (size > 1024) {
         size -= 1024;
         mb++;
      }

      return mb + "," + size + units[1];
   };

   const handleChoose = () => {
      if (!active) return;

      setImageUrl(active.image_url);
      // console.log(setIsOpenModal);
      setIsOpenModal(false);
   };

   const handleUploadImages = async (e: ChangeEvent<HTMLInputElement>) => {
      try {
         setApiLoading(true);
         const inputEle = e.target as HTMLInputElement & { files: FileList };
         const fileLists = inputEle.files;

         const formData = new FormData();
         formData.append("image", fileLists[0]);

         const controller = new AbortController();

         const res = await privateRequest.post(IMAGE_URL, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            signal: controller.signal,
         });

         const newImage = res.data.image as ImageType;
         if (newImage) {
            setImages((prev) => [newImage, ...prev]);
         }
      } catch (error) {
         console.log({ message: error });
      } finally {
         setApiLoading(false);
      }
   };

   const handleDeleteImage = async () => {
      try {
         if (!active || !active.image_file_path) return;

         setApiLoading(true);
         const controller = new AbortController();

         await privateRequest.delete(`${IMAGE_URL}/${active.id}`);

         const newImages = images.filter((image) => image.image_file_path !== active.image_file_path);
         setImages(newImages);

         return () => {
            controller.abort();
         };
      } catch (error) {
         console.log({ message: error });
      } finally {
         setApiLoading(false);
      }
   };

   const getImages = async () => {
      try {
         const res = await privateRequest.get(IMAGE_URL); //res.data
         setImages(res.data);

         if (import.meta.env.DEV) await sleep(300)
         setStatus("success");
      } catch (error) {
         console.log({ message: error });
         setStatus("error");
      }
   };

   useEffect(() => {
      if (!ranUseEffect.current) {
         ranUseEffect.current = true;
         getImages();
      }
   }, []);

   return (
      <div className={cx("gallery")}>
         <div className={cx("gallery__top")}>
            <div className={cx("left")}>
               <h1 className="text-2xl font-semibold">Images</h1>
               <div>
                  <label className={cx("input-label" ,{disable: apiLoading})} htmlFor="input-file">
                     <i className="material-icons">add</i>
                     Upload
                  </label>
                  <input
                     className={cx("input-file")}
                     id="input-file"
                     name="input-file"
                     type="file"
                     onChange={handleUploadImages}
                  />
               </div>
            </div>

            <Button className={cx("choose-image-btn")} disable={!active} primary onClick={handleChoose}>
               Chọn
            </Button>
         </div>
         <div className={cx("gallery__body")}>
            <div className={cx("row large", "container")}>
               <div className={cx("col-large col-8 no-scrollbar", "left")}>
                  {status === "loading" && <h1>Loading...</h1>}

                  {status !== "loading" && (
                     <>
                        {status === "success" ? (
                           <div className="row">
                              {!!images?.length &&
                                 images?.map((item, index) => {
                                    return (
                                       <div key={index} className={cx("col col-3", "gallery-item")}>
                                          <div
                                             onClick={() => setActive(item)}
                                             className={cx("image-frame", {
                                                active: active ? active.id === item.id : false,
                                             })}
                                          >
                                             <img src={item.image_url} alt="img" />
                                          </div>
                                       </div>
                                    );
                                 })}
                           </div>
                        ) : (
                           <h1>Some thing went wrong</h1>
                        )}
                     </>
                  )}
               </div>
               <div className={cx("col-large col-4 overflow-hidden border-l-[2px]")}>
                  {active && (
                     <div className={cx("image-info")}>
                        <h2 className="break-words">{active.name}</h2>
                        <ul>
                           <li>
                              <h4 className="font-semibold">Image path:</h4>{" "}
                              <a target="blank" href={active.image_url}>
                                 {active.image_url}
                              </a>
                           </li>
                           <li>
                              <h4 className="font-semibold">Size:</h4> {formatSize(active.size)}
                           </li>
                        </ul>
                        <Button primary onClick={handleDeleteImage}>
                           Xóa
                        </Button>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

export default Gallery;
