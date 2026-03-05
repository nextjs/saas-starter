import { prisma } from "@/lib/prisma";

export interface RequirementCheck {
  requirementId: string;
  type: string;
  label: string;
  met: boolean;
}

/**
 * Check all active requirements for a target stage against an opportunity.
 * Returns an array of checks with met/unmet status.
 */
export async function checkStageRequirements(
  opportunityId: string,
  targetStageId: string
): Promise<RequirementCheck[]> {
  const requirements = await prisma.stageRequirement.findMany({
    where: { stageId: targetStageId, isActive: true },
    orderBy: { position: "asc" },
  });

  if (requirements.length === 0) return [];

  // Load opportunity data needed for checks
  const opp = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      documents: { select: { id: true, fileType: true } },
      products: { select: { productId: true } },
      customValues: { select: { fieldId: true, value: true } },
    },
  });

  if (!opp) return requirements.map((r) => ({
    requirementId: r.id,
    type: r.type,
    label: r.label,
    met: false,
  }));

  return requirements.map((req) => {
    let met = false;
    const config = (req.config as Record<string, unknown>) ?? {};

    switch (req.type) {
      case "DOCUMENT": {
        if (opp.documents.length === 0) break;
        // If specific file types are required, check them
        const fileTypes = config.fileTypes as string[] | undefined;
        if (fileTypes && fileTypes.length > 0) {
          met = fileTypes.some((ft) =>
            opp.documents.some((d) => d.fileType?.toLowerCase() === ft.toLowerCase())
          );
        } else {
          // Any document satisfies
          met = opp.documents.length > 0;
        }
        break;
      }

      case "CUSTOM_FIELD": {
        const fieldId = config.fieldId as string | undefined;
        if (fieldId) {
          const value = opp.customValues.find((cv) => cv.fieldId === fieldId);
          met = !!value && value.value.trim().length > 0;
        }
        break;
      }

      case "PRODUCT": {
        met = opp.products.length > 0;
        break;
      }

      case "QUOTE": {
        met = !!opp.xeroQuoteId;
        break;
      }
    }

    return {
      requirementId: req.id,
      type: req.type,
      label: req.label,
      met,
    };
  });
}
