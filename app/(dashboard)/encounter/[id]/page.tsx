"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Encounter,
  CodeEvidence,
  transformEncounterFromApi,
} from "@/types/encounter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MedicalCodes from "@/components/dashboards/clinicdesk/MedicalCodes";
import FormattedNotes from "@/components/dashboards/clinicdesk/FormattedNotes";
import FormattedEncounter from "@/components/dashboards/clinicdesk/FormattedEncounter";

export default function EncounterPage({ params }: { params: { id: string } }) {
  const id = React.use(params);

  // console.log('EncounterPage rendering with params:', params);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);
  const router = useRouter();

  // Computed properties for displaying medical codes
  const aiCodes = encounter?.aiCodes || [];
  const billingCodes = encounter?.codes || [];

  // Computed property for code evidence display
  const codeEvidence: CodeEvidence[] = encounter?.aiCodes
    ? encounter.aiCodes.map((code) => ({
        id: code.code,
        evidence: code.audit || "No evidence available",
        context: code.description || "No context available",
      }))
    : [];

  // Format the patient's date of birth
  const formattedDob = encounter?.dob
    ? new Date(encounter.dob).toLocaleDateString()
    : "";

  // Format the encounter text to preserve newlines
  const formattedEncounterText = encounter?.encounter
    ? encounter.encounter.replace(/\\n/g, "\n")
    : "";

  // Get the status badge class based on the encounter status
  const getStatusBadgeClass = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";

    const statusClasses: Record<string, string> = {
      Active: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Completed: "bg-blue-100 text-blue-800",
      Inactive: "bg-gray-100 text-gray-800",
      ACTIVE: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      INACTIVE: "bg-gray-100 text-gray-800",
    };

    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  // Handle code selection from notes or encounter text
  const handleCodeClick = (codeId: string) => {
    console.log("Code clicked:", codeId);
    setSelectedCodeId(codeId);

    // We don't automatically scroll now - the popup provides the option
  };

  // Handle code selection from the medical codes table
  const handleCodeSelect = (codeId: string | null) => {
    setSelectedCodeId(codeId);
  };

  // Function to scroll to the medical codes section
  const scrollToMedicalCodes = () => {
    const medicalCodesSection = document.getElementById(
      "medical-codes-section"
    );
    if (medicalCodesSection) {
      medicalCodesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch encounter data
  const fetchEncounter = async () => {
    // console.log(`[id].tsx Fetching encounter data for ID: ${id}`);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/encounters/${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API response:", data);

      if (!data) {
        throw new Error("No data received from API");
      }

      const transformedData = transformEncounterFromApi(data);
      console.log("Transformed encounter data:", transformedData);
      setEncounter(transformedData);
    } catch (err: any) {
      console.error("Failed to fetch encounter:", err);
      setError(err.message || "Failed to fetch encounter");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounter();
  }, [id]);
  const goBack = () => {
    router.push("/dashboard/encounters");
  };

  return (
    <div className="py-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Encounter Details</CardTitle>
          <Button variant="outline" onClick={goBack}>
            Back to Encounters
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              {error}
            </div>
          ) : (
            <>
              {/* Patient Information Section */}
              <Card className="mb-4">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg">Patient Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p>
                        <strong>Chart ID:</strong> {encounter?.chartId}
                      </p>
                      <p>
                        <strong>Patient Name:</strong> {encounter?.patientName}
                      </p>
                      <p>
                        <strong>Date of Birth:</strong> {formattedDob}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Provider:</strong> {encounter?.provider}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                            encounter?.status
                          )}`}
                        >
                          {encounter?.status}
                        </span>
                      </p>
                      <p>
                        <strong>AI Processed:</strong>{" "}
                        <span
                          className={
                            aiCodes.length > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {aiCodes.length > 0 ? "Yes" : "No"}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content Area with Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Encounter Notes Section - Left Column */}
                <div className="md:col-span-7">
                  <Card className="h-full">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-lg">Encounter Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {encounter?.notes && (
                        <div className="mb-4">
                          <h5 className="text-base font-medium mb-2">
                            Provider Notes
                          </h5>
                          <FormattedNotes
                            notes={encounter.notes}
                            codes={codeEvidence}
                            onCodeClick={handleCodeClick}
                            aiCodes={aiCodes}
                            scrollToMedicalCodes={scrollToMedicalCodes}
                          />
                        </div>
                      )}

                      {encounter?.encounter && (
                        <div>
                          <h5 className="text-base font-medium mb-2">
                            Full Encounter
                          </h5>
                          <div className="p-3 bg-muted/50 rounded-md">
                            <FormattedEncounter
                              encounterText={formattedEncounterText}
                              codes={aiCodes}
                              onCodeClick={handleCodeClick}
                              scrollToMedicalCodes={scrollToMedicalCodes}
                            />
                          </div>
                        </div>
                      )}

                      {!encounter?.encounter && !encounter?.notes && (
                        <div className="text-muted-foreground">
                          No encounter data available.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Medical Codes Section - Right Column */}
                <div className="md:col-span-5" id="medical-codes-section">
                  <Card className="h-full">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-lg">Medical Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* AI Codes */}
                      {aiCodes.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-base font-medium mb-2">
                            AI Suggested Codes
                          </h5>
                          <MedicalCodes
                            codes={aiCodes}
                            selectedCodeId={selectedCodeId}
                            onCodeSelect={handleCodeSelect}
                          />
                        </div>
                      )}

                      {/* Billing Codes */}
                      {billingCodes.length > 0 && (
                        <div>
                          <h5 className="text-base font-medium mb-2">
                            Billing Codes
                          </h5>
                          <MedicalCodes codes={billingCodes} />
                        </div>
                      )}

                      {aiCodes.length === 0 && billingCodes.length === 0 && (
                        <div className="text-muted-foreground">
                          No medical codes available.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
