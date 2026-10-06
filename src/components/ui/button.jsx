import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const variants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out outline-none active:not-disabled:scale-[0.97] select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // The one main action on a page: emerald.
        default: "bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover hover:shadow-primary-lift",
        // Everything else: a white button with a light edge.
        outline: "border-ink-300 bg-card text-foreground shadow-xs hover:border-ink-400 hover:bg-ink-50 aria-expanded:bg-secondary",
        secondary: "bg-foreground text-primary-foreground hover:bg-ink-800",
        ghost: "hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary",
        destructive:
          "bg-destructive text-ink-0 shadow-xs hover:bg-destructive/90 focus-visible:border-destructive focus-visible:ring-destructive/30",
        link: "text-foreground underline decoration-primary underline-offset-4 hover:decoration-2",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-5 text-base has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({ className, variant = "default", size = "default", ...props }) {
  return <ButtonPrimitive data-slot="button" className={buttonVariants({ variant, size, className })} {...props} />;
}

// cn() settles clashing classes (for example two border colours), so links
// styled with buttonVariants() look exactly like real buttons.
function buttonVariants(options) {
  return cn(variants(options));
}

export { Button, buttonVariants };
