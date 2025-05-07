
/* -------------------------------------------------------------------------- */
/*                             External Dependency                            */
/* -------------------------------------------------------------------------- */
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/* -------------------------------------------------------------------------- */
/*                             Internal Dependency                            */
/* -------------------------------------------------------------------------- */

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}