import { useEffect, useState } from "react";
import { Button } from "..";

export default function ScrollTop() {
   const [show, setShow] = useState(false);

   const scrollToTop = () => {
      window?.scroll({
         behavior: "smooth",
         top: 0,
      });
   };

   const handleShow = () => {
      if (window.scrollY > 100) setShow(true);
      else setShow(false);
   };

   useEffect(() => {
      window.addEventListener("scroll", handleShow);

      return () => window.removeEventListener("scroll", handleShow);
   }, []);

   const classes = {
      button: "fixed bottom-[30px] p-[8px] right-[30px] bg-[#f1f1f1] hover:bg-[#cd1818] hover:text-white shadow-xl",
      hide: "opacity-0 translate-y-[-100px]",
      show: "translate-y-[0] opacity-[1]",
   };

   return (
      <Button
         onClick={show ? scrollToTop : () => {}}
         circle
         className={`${classes.button} ${show ? classes.show : classes.hide}`}
      >
         <i className="material-icons text-[20px]">arrow_upward</i>
      </Button>
   );
}
