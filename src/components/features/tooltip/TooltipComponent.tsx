import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

type Props = {
  children: React.ReactNode;
  content: string;
  classname?: string;
};

export default function TooltipComponents({
  children,
  content,
  classname,
}: Props) {
  return (
    <div className="">
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent side="right" className={classname}>
            <p>{content}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
