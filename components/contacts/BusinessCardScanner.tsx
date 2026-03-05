"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Camera, Loader2, Check, X } from "lucide-react";

interface ScannedContact {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  department: string | null;
  company: string | null;
  website: string | null;
  address: string | null;
}

type ScanStep = "capture" | "scanning" | "review" | "saving";

export function BusinessCardScanner({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const [step, setStep] = useState<ScanStep>("capture");
  const [preview, setPreview] = useState<string | null>(null);
  const [contact, setContact] = useState<ScannedContact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("capture");
    setPreview(null);
    setContact(null);
    setError(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleCapture = async (file: File) => {
    setError(null);
    setStep("scanning");

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Send to API
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/workspace/contacts/scan-card", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to scan card");
        setStep("capture");
        return;
      }

      setContact(data.contact);
      setStep("review");
    } catch {
      setError("Network error — please try again");
      setStep("capture");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCapture(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!contact) return;
    setStep("saving");
    setError(null);

    try {
      const res = await fetch("/api/workspace/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email || null,
          phone: contact.phone || null,
          jobTitle: contact.jobTitle || null,
          department: contact.department || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to create contact");
        setStep("review");
        return;
      }

      handleClose(false);
      onCreated?.();
    } catch {
      setError("Network error — please try again");
      setStep("review");
    }
  };

  const updateField = (field: keyof ScannedContact, value: string) => {
    if (!contact) return;
    setContact({ ...contact, [field]: value || null });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Business Card
          </DialogTitle>
          <DialogDescription>
            {step === "capture" && "Take a photo or upload an image of a business card."}
            {step === "scanning" && "Analyzing the business card..."}
            {step === "review" && "Review and edit the extracted information."}
            {step === "saving" && "Creating contact..."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Capture Step */}
        {step === "capture" && (
          <div className="py-4 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileInput}
            />
            <Button
              className="w-full h-32 flex flex-col gap-2"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-8 w-8" />
              <span>Take Photo or Choose Image</span>
            </Button>
          </div>
        )}

        {/* Scanning Step */}
        {step === "scanning" && (
          <div className="py-8 flex flex-col items-center gap-4">
            {preview && (
              <img
                src={preview}
                alt="Business card"
                className="max-h-40 rounded-lg border object-contain"
              />
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Scanning business card...</span>
            </div>
          </div>
        )}

        {/* Review Step */}
        {step === "review" && contact && (
          <div className="py-2 space-y-3">
            {preview && (
              <img
                src={preview}
                alt="Business card"
                className="max-h-28 rounded-lg border object-contain mx-auto"
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">First Name</Label>
                <Input
                  value={contact.firstName ?? ""}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Last Name</Label>
                <Input
                  value={contact.lastName ?? ""}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={contact.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                value={contact.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Job Title</Label>
              <Input
                value={contact.jobTitle ?? ""}
                onChange={(e) => updateField("jobTitle", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Company</Label>
              <Input
                value={contact.company ?? ""}
                onChange={(e) => updateField("company", e.target.value)}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground mt-0.5">Link to an account after creating</p>
            </div>
          </div>
        )}

        {/* Saving Step */}
        {step === "saving" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="text-muted-foreground">Creating contact...</span>
          </div>
        )}

        {step === "review" && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={reset}>
              <X className="h-4 w-4 mr-1" /> Rescan
            </Button>
            <Button onClick={handleSave} disabled={!contact?.firstName || !contact?.lastName}>
              <Check className="h-4 w-4 mr-1" /> Create Contact
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
