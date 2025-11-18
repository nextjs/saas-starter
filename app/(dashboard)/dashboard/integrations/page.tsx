"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/user/integrations");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
        <p className="text-gray-600">
          Manage your chat tools and productivity services
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Chat Integrations</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <WhatsAppCard
                integration={integrations.find((i) => i.type === "whatsapp")}
                onUpdate={fetchIntegrations}
              />
              <TelegramCard
                integration={integrations.find((i) => i.type === "telegram")}
                onUpdate={fetchIntegrations}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Tools & Services</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <GoogleCalendarCard
                integration={integrations.find(
                  (i) => i.type === "google_calendar"
                )}
                onUpdate={fetchIntegrations}
              />
              <TodoistCard
                integration={integrations.find((i) => i.type === "todoist")}
                onUpdate={fetchIntegrations}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function WhatsAppCard({
  integration,
  onUpdate,
}: {
  integration?: any;
  onUpdate: () => void;
}) {
  const { user, mutate } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(integration?.enabled || false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const isVerified = user?.mobileVerified !== null;
  const hasPhone = user?.mobileNumber && user?.mobileCountryCode;
  const displayPhone = hasPhone
    ? `${user.mobileCountryCode}${user.mobileNumber}`
    : "";

  const handleToggle = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    try {
      const res = await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "whatsapp",
          enabled: newEnabled,
        }),
      });

      if (!res.ok) {
        setIsEnabled(!newEnabled);
        setMessage({
          type: "error",
          text: "Failed to update WhatsApp integration",
        });
        return;
      }

      onUpdate();
    } catch (error) {
      setIsEnabled(!newEnabled);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleUpdatePhone = async () => {
    if (!phoneNumber) {
      setMessage({ type: "error", text: "Please enter a mobile number" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to update mobile number",
        });
        setIsSubmitting(false);
        return;
      }

      setMessage({
        type: "success",
        text: "Verification code sent to your mobile number",
      });
      setShowVerification(true);
      setIsSubmitting(false);
      mutate();
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setMessage({ type: "error", text: "Please enter the verification code" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/mobile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to verify code",
        });
        setIsSubmitting(false);
        return;
      }

      setMessage({
        type: "success",
        text: "Mobile number verified successfully",
      });
      setShowVerification(false);
      setIsEditing(false);
      setVerificationCode("");
      setPhoneNumber("");
      setIsSubmitting(false);
      mutate();
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pt-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/whatsapp.png"
            alt="WhatsApp"
            width={32}
            height={32}
            className="rounded"
          />
          <CardTitle>WhatsApp</CardTitle>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            isEnabled ? "bg-black" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              isEnabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </CardHeader>
      <CardContent className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {isEnabled ? "Enabled" : "Disabled"}
          </p>
          <p className="text-xs font-medium text-gray-400">
            {isEnabled ? "Active" : "Inactive"}
          </p>
        </div>

        {isEnabled && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Your mobile number is required for WhatsApp service access. Verify
              your number to enable full features.
            </p>

            {!isEditing && hasPhone && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{displayPhone}</p>
                    <p
                      className={`text-sm ${
                        isVerified ? "text-green-600" : "text-amber-600"
                      }`}
                    >
                      {isVerified ? "✓ Verified" : "⚠ Not verified"}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setIsEditing(true);
                      setPhoneNumber(displayPhone);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Change Number
                  </Button>
                </div>
                {!isVerified && (
                  <Button
                    onClick={() => {
                      setShowVerification(true);
                      handleUpdatePhone();
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Verify Current Number
                  </Button>
                )}
              </div>
            )}

            {(isEditing || !hasPhone) && !showVerification && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mobile" className="mb-2">
                    Mobile Number
                  </Label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="mobile"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890"
                      className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Include country code (e.g., +1 for US, +351 for Portugal)
                  </p>
                </div>
                {message && (
                  <p
                    className={`text-sm ${
                      message.type === "error"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdatePhone}
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setPhoneNumber("");
                        setMessage(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}

            {showVerification && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verificationCode" className="mb-2">
                    Verification Code
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-digit code sent to your mobile number
                  </p>
                </div>
                {message && (
                  <p
                    className={`text-sm ${
                      message.type === "error"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowVerification(false);
                      setVerificationCode("");
                      setMessage(null);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TelegramCard({
  integration,
  onUpdate,
}: {
  integration?: any;
  onUpdate: () => void;
}) {
  const [isEnabled, setIsEnabled] = useState(integration?.enabled || false);
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleToggle = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    try {
      const res = await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "telegram",
          enabled: newEnabled,
        }),
      });

      if (!res.ok) {
        setIsEnabled(!newEnabled);
        setMessage({
          type: "error",
          text: "Failed to update Telegram integration",
        });
        return;
      }

      onUpdate();
    } catch (error) {
      setIsEnabled(!newEnabled);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      setMessage({ type: "error", text: "Please enter a bot token" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "telegram",
          enabled: true,
          metadata: { botToken: apiKey },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({
          type: "error",
          text: data.error || "Failed to save bot token",
        });
        setIsSubmitting(false);
        return;
      }

      setMessage({
        type: "success",
        text: "Telegram bot token saved successfully",
      });
      setIsEditing(false);
      setApiKey("");
      setIsSubmitting(false);
      onUpdate();
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pt-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/telegram.png"
            alt="Telegram"
            width={32}
            height={32}
            className="rounded"
          />
          <CardTitle>Telegram</CardTitle>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isEnabled ? "bg-black" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              isEnabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </CardHeader>
      <CardContent className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {isEnabled ? "Enabled" : "Disabled"}
          </p>
          <p className="text-xs font-medium text-gray-400">
            {isEnabled ? "Active" : "Inactive"}
          </p>
        </div>

        {isEnabled && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Connect your Telegram bot to send and receive messages.
            </p>

            {!isEditing && integration?.metadata?.botToken && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Bot Connected</p>
                    <p className="text-xs text-green-600">✓ Configured</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm"
                  >
                    Change Token
                  </Button>
                </div>
              </div>
            )}

            {(isEditing || !integration?.metadata?.botToken) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="telegram-token" className="mb-2">
                    Bot Token
                  </Label>
                  <Input
                    id="telegram-token"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your Telegram bot token"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Get your token from{" "}
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      BotFather
                    </a>
                  </p>
                </div>
                {message && (
                  <p
                    className={`text-sm ${
                      message.type === "error"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveApiKey}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Token"
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setApiKey("");
                        setMessage(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function GoogleCalendarCard({
  integration,
  onUpdate,
}: {
  integration?: any;
  onUpdate: () => void;
}) {
  const [isEnabled, setIsEnabled] = useState(integration?.enabled || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    try {
      const res = await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "google_calendar",
          enabled: newEnabled,
        }),
      });

      if (!res.ok) {
        setIsEnabled(!newEnabled);
        return;
      }

      onUpdate();
    } catch (error) {
      setIsEnabled(!newEnabled);
    }
  };

  return (
    <Card>
      <CardHeader className="pt-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/google_calendar.png"
            alt="Google Calendar"
            width={32}
            height={32}
            className="rounded"
          />
          <CardTitle>Google Calendar</CardTitle>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isEnabled ? "bg-black" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              isEnabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </CardHeader>
      <CardContent className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {isEnabled ? "Enabled" : "Disabled"}
          </p>
          <p className="text-xs font-medium text-gray-400">
            {isEnabled ? "Active" : "Inactive"}
          </p>
        </div>

        {isEnabled && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Sync your calendar events to organize your memories by time.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                {integration?.externalId ? "Connected" : "Click to authorize"}
              </span>
            </div>
            {!integration?.externalId && (
              <Button
                onClick={() => {
                  // In production, this would initiate OAuth flow
                  alert(
                    "OAuth integration would be initiated here in production"
                  );
                }}
                disabled={isSubmitting}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Authorize Google Calendar
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TodoistCard({
  integration,
  onUpdate,
}: {
  integration?: any;
  onUpdate: () => void;
}) {
  const [isEnabled, setIsEnabled] = useState(integration?.enabled || false);
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const handleToggle = async () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    try {
      const res = await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "todoist",
          enabled: newEnabled,
        }),
      });

      if (!res.ok) {
        setIsEnabled(!newEnabled);
        setMessage({
          type: "error",
          text: "Failed to update Todoist integration",
        });
        return;
      }

      onUpdate();
    } catch (error) {
      setIsEnabled(!newEnabled);
      setMessage({ type: "error", text: "Network error. Please try again." });
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      setMessage({ type: "error", text: "Please enter your API token" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "todoist",
          enabled: true,
          metadata: { apiToken: apiKey },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({
          type: "error",
          text: data.error || "Failed to save API token",
        });
        setIsSubmitting(false);
        return;
      }

      setMessage({
        type: "success",
        text: "Todoist API token saved successfully",
      });
      setIsEditing(false);
      setApiKey("");
      setIsSubmitting(false);
      onUpdate();
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pt-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/todoist.png"
            alt="Todoist"
            width={32}
            height={32}
            className="rounded"
          />
          <CardTitle>Todoist</CardTitle>
        </div>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
            isEnabled ? "bg-black" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
              isEnabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </CardHeader>
      <CardContent className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {isEnabled ? "Enabled" : "Disabled"}
          </p>
          <p className="text-xs font-medium text-gray-400">
            {isEnabled ? "Active" : "Inactive"}
          </p>
        </div>

        {isEnabled && (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Sync your tasks and keep your Todoist organized with memories.
            </p>

            {!isEditing && integration?.metadata?.apiToken && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">API Connected</p>
                    <p className="text-xs text-green-600">✓ Configured</p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm"
                  >
                    Change Token
                  </Button>
                </div>
              </div>
            )}

            {(isEditing || !integration?.metadata?.apiToken) && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="todoist-token" className="mb-2">
                    API Token
                  </Label>
                  <Input
                    id="todoist-token"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your Todoist API token"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Get your token from{" "}
                    <a
                      href="https://todoist.com/app/settings/integrations/developer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Todoist Settings
                    </a>
                  </p>
                </div>
                {message && (
                  <p
                    className={`text-sm ${
                      message.type === "error"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {message.text}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveApiKey}
                    disabled={isSubmitting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Token"
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setApiKey("");
                        setMessage(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
