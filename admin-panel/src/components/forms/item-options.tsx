import { Card, CardBody, CardHeader } from "@/components/ui/primitives";
import { SwitchField, TextAreaField } from "./fields";

/** Visibility + resume controls shared by every list item form. */
export function ItemOptions({ resumeHint, showResume = true }: { resumeHint?: string; showResume?: boolean }) {
  return (
    <Card>
      <CardHeader title="Visibility & resume" description="Control where this item appears." />
      <CardBody>
        <SwitchField name="isVisible" label="Show on website" hint="Hidden items stay saved but never appear publicly." />
        {showResume && (
          <>
            <SwitchField name="includeInResume" label="Include in resume" hint="The PDF regenerates automatically when you publish." />
            <TextAreaField
              name="resumeSummary"
              label="Short resume description (optional)"
              hint={resumeHint ?? "A concise line used on the resume instead of the full website text."}
              rows={2}
            />
          </>
        )}
      </CardBody>
    </Card>
  );
}
