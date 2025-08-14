"use client";
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & { side?: "left" | "right" | "top" | "bottom" }
>(({ className, side = "right", ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lift transition",
        "border border-border sm:rounded-lg",
        side === "right" && "inset-y-0 right-0 h-full w-3/4 max-w-md",
        side === "left" && "inset-y-0 left-0 h-full w-3/4 max-w-md",
        side === "top" && "inset-x-0 top-0 w-full max-h-[80vh]",
        side === "bottom" && "inset-x-0 bottom-0 w-full max-h-[80vh]",
        className
      )}
      {...props}
    />
  </SheetPrimitive.Portal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

export { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle };