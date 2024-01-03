import { ReactNode } from "react"





type Props = {
   onClick?: () => void
   children?:ReactNode;
   className?: string
}
export default function Empty ({onClick, children, className}:Props) {

   const classes = {
      container: `group relative pt-[100%] rounded-[6px] overflow-hidden  border border-black/15 ${!children ? "cursor-pointer hover:bg-black/15" : "" }`
   }

   return (
      <div onClick={onClick} className={`${classes.container} ${className}`}>
         <div className="absolute inset-0 flex items-center justify-center">
            {children || <i className="material-icons transition-transform group-hover:scale-[1.2]">add</i>}
         </div>
      </div>
   )
}