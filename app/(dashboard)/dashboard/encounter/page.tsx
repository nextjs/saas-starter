"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import MedicalCodes from "@/components/dashboards/clinicdesk/MedicalCodes";
import FormattedNotes from "@/components/dashboards/clinicdesk/FormattedNotes";
import FormattedEncounter from "@/components/dashboards/clinicdesk/FormattedEncounter";
import {
  Encounter,
  AiCode,
  BillingCode,
  CodeEvidence,
  transformEncounterFromApi,
} from "@/types/encounter";

export default function EncounterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties for displaying medical codes
  const aiCodes = useMemo<AiCode[]>(() => {
    if (!encounter?.aiCodes) return [];
    return encounter.aiCodes;
  }, [encounter]);

  const billingCodes = useMemo<BillingCode[]>(() => {
    if (!encounter?.codes) return [];
    return encounter.codes;
  }, [encounter]);

  // Computed property for code evidence display
  const codeEvidence = useMemo<CodeEvidence[]>(() => {
    if (!encounter?.aiCodes) return [];

    return encounter.aiCodes.map((code) => ({
      id: code.code,
      evidence: code.audit || "No evidence available",
      context: code.description || "No context available",
    }));
  }, [encounter]);

  // Format the patient's date of birth
  const formattedDob = useMemo(() => {
    if (!encounter?.dob) return "";

    try {
      // Don't use toLocaleDateString directly as it can cause hydration issues
      const date = new Date(encounter.dob);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return encounter.dob;
    }
  }, [encounter]);

  // Format the encounter text to preserve newlines
  const formattedEncounterText = useMemo(() => {
    if (!encounter?.encounter) return "";

    // Log the raw encounter text to see how newlines are represented
    console.log("Raw encounter text:", JSON.stringify(encounter.encounter));

    // Try different approaches to handle newlines
    // First, replace escaped newlines with actual newlines
    let formatted = encounter.encounter.replace(/\\n/g, "\n");

    // If there are literal '\n' strings (not escaped), replace those too
    formatted = formatted.replace(/\\n/g, "\n");

    return formatted;
  }, [encounter]);

  // Get the status badge class based on the encounter status
  function getStatusBadgeClass(status: string | undefined) {
    if (!status) return "badge bg-secondary";

    const statusClasses: Record<string, string> = {
      Active: "badge bg-success",
      Pending: "badge bg-warning",
      Completed: "badge bg-info",
      Inactive: "badge bg-secondary",
      ACTIVE: "badge bg-success",
      PENDING: "badge bg-warning",
      COMPLETED: "badge bg-info",
      INACTIVE: "badge bg-secondary",
    };

    return statusClasses[status] || "badge bg-secondary";
  }

  // Fetch encounter data
  async function fetchEncounter() {
    console.log("Fetching encounter data for ID:", id);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/encounters/${id}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data) {
        throw new Error("No data received from API");
      }

      setEncounter(transformEncounterFromApi(data));
      console.log("Transformed encounter data:", encounter);
    } catch (err: any) {
      console.error("Failed to fetch encounter:", err);
      setError(err.message || "Failed to fetch encounter");
    } finally {
      setIsLoading(false);
      console.log("Encounter data fetched successfully:", encounter);
    }
  }

  useEffect(() => {
    if (id) {
      fetchEncounter();
    }
  }, [id]);

  // Add a state to track if we're on the client side
  const [isClient, setIsClient] = useState(false);

  // Use an effect to set isClient to true after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  function goBack() {
    router.push("/encounters");
  }

  return (
    <div className="py-4 container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3 className="card-title mb-0">Encounter Details</h3>
              <button className="btn btn-secondary" onClick={goBack}>
                Back to Encounters
              </button>
            </div>
            <div className="card-body">
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <>
                  {/* Patient Information Section */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h4 className="card-title mb-0">Patient Information</h4>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p>
                            <strong>Chart ID:</strong> {encounter?.chartId}
                          </p>
                          <p>
                            <strong>Patient Name:</strong>{" "}
                            {encounter?.patientName}
                          </p>
                          <p>
                            <strong>Date of Birth:</strong> {isClient ? formattedDob : encounter?.dob || ''}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p>
                            <strong>Provider:</strong> {encounter?.provider}
                          </p>
                          <p>
                            <strong>Status:</strong>
                            <span
                              className={getStatusBadgeClass(encounter?.status)}
                            >
                              {encounter?.status}
                            </span>
                          </p>
                          <p>
                            <strong>AI Processed:</strong>
                            <span
                              className={
                                aiCodes.length > 0
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              {aiCodes.length > 0 ? "Yes" : "No"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area with Two Columns */}
                  <div className="row">
                    {/* Encounter Notes Section - Left Column */}
                    <div className="col-md-7">
                      <div className="card h-100">
                        <div className="card-header bg-light">
                          <h4 className="card-title mb-0">Encounter Notes</h4>
                        </div>
                        <div className="card-body">
                          {isClient && encounter?.notes ? (
                            <div className="mb-4">
                              <h5>Provider Notes</h5>
                              <FormattedNotes
                                notes={encounter.notes}
                                codes={codeEvidence}
                              />
                            </div>
                          ) : null}

                          {isClient && encounter?.encounter ? (
                            <div>
                              <h5>Full Encounter</h5>
                              <div className="encounter-text p-3 bg-light rounded">
                                <FormattedEncounter
                                  encounterText={formattedEncounterText}
                                  codes={aiCodes}
                                />
                              </div>
                            </div>
                          ) : null}

                          {isClient && !encounter?.encounter && !encounter?.notes && (
                            <div className="text-muted">
                              No encounter data available.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Medical Codes Section - Right Column */}
                    <div className="col-md-5">
                      <div className="card mb-4">
                        <div className="card-header bg-light">
                          <h4 className="card-title mb-0">
                            AI Suggested Codes
                          </h4>
                        </div>
                        <div className="card-body">
                          <MedicalCodes codes={aiCodes} />
                          {aiCodes.length === 0 && (
                            <div className="text-muted">
                              No AI codes available for this encounter.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Billing Codes Section */}
                      <div className="card">
                        <div className="card-header bg-light">
                          <h4 className="card-title mb-0">Billing Codes</h4>
                        </div>
                        <div className="card-body">
                          {billingCodes.length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead>
                                  <tr>
                                    <th>Code</th>
                                    <th>Description</th>
                                    <th>Evidence</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {billingCodes.map((code) => (
                                    <tr key={code.code}>
                                      <td>{code.code}</td>
                                      <td>{code.description}</td>
                                      <td>
                                        {code.audit ? (
                                          <div className="evidence-text">
                                            {code.audit}
                                          </div>
                                        ) : (
                                          <div className="text-muted">None</div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-muted">
                              No billing codes available for this encounter.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .badge {
          font-size: 0.8rem;
          padding: 0.35em 0.65em;
        }

        .evidence-text {
          font-size: 0.9rem;
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 0.25rem;
        }

        .encounter-text {
          overflow-y: auto;
          font-size: 0.9rem;
          padding: 0.5rem;
          background-color: #f8f9fa;
          border-radius: 0.25rem;
        }

        .encounter-text pre {
          font-family: inherit;
          white-space: pre;
          word-wrap: break-word;
          line-height: 1.5;
          color: #212529;
          margin-bottom: 0;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
