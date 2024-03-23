import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  content: string;
  pathname: string;
  to: string;
  classname?: string;
  Icon: LucideIcon;
};

export default function TooltipComponents({
  content,
  classname,
  to,
  pathname,
  Icon,
}: Props) {
  return (
    <div>
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Link
              href={to}
              className="flex justify-center"
              prefetch={true}
              aria-label="Navigation Link"
            >
              <div
                className={`p-2 hover:bg-primary dark:text-white ${
                  pathname == to ? "bg-primary text-white" : ""
                } rounded-lg hover:text-white`}
              >
                <Icon size={25} />
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className={classname} sideOffset={10}>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
