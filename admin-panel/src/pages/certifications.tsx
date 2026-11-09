import { certificationSchema, formatMonth, type CertificationInput } from "@portfolio/shared";
import { ImageField, TextField } from "@/components/forms/fields";
import { ItemOptions } from "@/components/forms/item-options";
import { ResourceEditor } from "@/components/resource-editor";
import { ResourceList } from "@/components/resource-list";
import { Card, CardBody, CardHeader } from "@/components/ui/primitives";
import type { AdminMedia, ItemFlags } from "@/types";

type Certification = ItemFlags & CertificationInput & { image: AdminMedia | null };

const defaults: CertificationInput = {
  name: "",
  issuer: "",
  issueDate: "",
  credentialUrl: "",
  imageId: null,
  isVisible: true,
  includeInResume: true,
  resumeSummary: "",
};

export function CertificationsPage() {
  return (
    <ResourceList<Certification>
      resource="certifications"
      title="Certifications"
      singular="certification"
      basePath="/certifications"
      description="Certificates with links to verify them."
      primary={(c) => c.name}
      secondary={(c) => `${c.issuer}${c.issueDate ? ` · ${formatMonth(c.issueDate)}` : ""}`}
    />
  );
}

export function CertificationEditPage() {
  return (
    <ResourceEditor<Certification, CertificationInput>
      resource="certifications"
      schema={certificationSchema}
      defaults={defaults}
      singular="certification"
      basePath="/certifications"
      title={(c) => c?.name ?? "Certification"}
      previewPath={() => "/education"}
    >
      {({ item }) => (
        <>
          <Card>
            <CardHeader title="Certificate" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField name="name" label="Certificate name" className="sm:col-span-2" />
              <TextField name="issuer" label="Issued by" placeholder="Amazon Web Services" />
              <TextField name="issueDate" label="Issue date" type="month" />
              <TextField name="credentialUrl" label="Credential URL" type="url" placeholder="https://" className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <ImageField name="imageId" label="Certificate image (optional)" initial={item?.image} alt={item?.name ?? ""} />
              </div>
            </CardBody>
          </Card>
          <ItemOptions />
        </>
      )}
    </ResourceEditor>
  );
}
