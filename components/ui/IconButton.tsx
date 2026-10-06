import type { ButtonHTMLAttributes } from "react";

/**
 * 40px round icon button (back, share, save, close, ...). The fill fades in
 * on hover and the button shrinks slightly while pressed.
 */
export function IconButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`transition-icon inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-grey-200 active:scale-90 ${className}`}
      {...props}
    />
  );
}
