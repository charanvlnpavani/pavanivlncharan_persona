import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Leaves preview mode (POST from the preview banner). */
export async function POST() {
  (await draftMode()).disable();
  redirect("/");
}
