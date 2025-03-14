"use client";

import { useState, useEffect, startTransition, use, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUser } from "@/lib/auth";
import { updateAccount } from "@/app/(login)/actions";

type ActionState = {
  error?: string;
  success?: string;
};

export default function GeneralPage() {
  const { userPromise } = useUser();
  const user = use(userPromise);

  // The server action for saving the entire form data:
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    { error: "", success: "" }
  );

  //
  // 1) State for *unsaved* Trading Preferences:
  //
  const [pollFrequency, setPollFrequency] = useState("month");
  const [dollarCapEnabled, setDollarCapEnabled] = useState(false);
  const [dollarCap, setDollarCap] = useState("500.00");

  // 2) State for *unsaved* Investment Method:
  const [dcaMethod, setDcaMethod] = useState("percentageCash");
  const [dcaValue, setDcaValue] = useState("5");

  //
  // 3) State for *saved* Trading Preferences (shown in "Current Settings"):
  //
  const [savedPollFrequency, setSavedPollFrequency] = useState("month");
  const [savedDollarCapEnabled, setSavedDollarCapEnabled] = useState(false);
  const [savedDollarCap, setSavedDollarCap] = useState("500.00");

  // 4) State for *saved* Investment Method (shown in "Current Settings"):
  const [savedDcaMethod, setSavedDcaMethod] = useState("percentageCash");
  const [savedDcaValue, setSavedDcaValue] = useState("5");

  // We only track local validation errors for the "percentageCash" method.
  const [localError, setLocalError] = useState<string | null>(null);

  // On mount, restore only the *Trading Preferences* + *Investment Method* from sessionStorage
  // but NOT the Account fields (name, email).
  useEffect(() => {
    const storedPollFrequency = sessionStorage.getItem("pollFrequency") || "month";
    const storedDollarCapEnabled = sessionStorage.getItem("dollarCapEnabled") === "true";
    const storedDollarCap = sessionStorage.getItem("dollarCap") || "500.00";
    const storedDcaMethod = sessionStorage.getItem("dcaMethod") || "percentageCash";
    const storedDcaValue = sessionStorage.getItem("dcaValue") || "5";

    setPollFrequency(storedPollFrequency);
    setDollarCapEnabled(storedDollarCapEnabled);
    setDollarCap(storedDollarCap);
    setDcaMethod(storedDcaMethod);
    setDcaValue(storedDcaValue);

    // Also set the saved states (shown in Current Settings)
    setSavedPollFrequency(storedPollFrequency);
    setSavedDollarCapEnabled(storedDollarCapEnabled);
    setSavedDollarCap(storedDollarCap);
    setSavedDcaMethod(storedDcaMethod);
    setSavedDcaValue(storedDcaValue);
  }, []);

  // A helper to update sessionStorage for trading preferences, investment method, etc.
  const handleSessionUpdate = (key: string, value: string) => {
    sessionStorage.setItem(key, value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    // Validate if using "percentageCash"
    if (dcaMethod === "percentageCash") {
      const numericVal = parseFloat(dcaValue);
      if (isNaN(numericVal) || numericVal < 0 || numericVal > 100) {
        setLocalError("Percentage must be between 0 and 100.");
        return; // Stop submission
      }
    }

    startTransition(() => {
      // 1) Update sessionStorage with the *current* state values (NOT name/email).
      handleSessionUpdate("pollFrequency", pollFrequency);
      handleSessionUpdate("dollarCapEnabled", dollarCapEnabled.toString());
      handleSessionUpdate("dollarCap", dollarCap);
      handleSessionUpdate("dcaMethod", dcaMethod);
      handleSessionUpdate("dcaValue", dcaValue);

      // 2) Update the "saved" states for the "Current Settings" display.
      setSavedPollFrequency(pollFrequency);
      setSavedDollarCapEnabled(dollarCapEnabled);
      setSavedDollarCap(dollarCap);
      setSavedDcaMethod(dcaMethod);
      setSavedDcaValue(dcaValue);

      // 3) Invoke the server action (for DB update).
      //    The name/email fields will be passed along as well, but we don't store them locally.
      formAction(new FormData(event.currentTarget));

      // (Optional) Clear out the name + email fields after save if you want them to “disappear”:
      // const form = event.currentTarget as HTMLFormElement;
      // form.reset();
    });
  };

  // Dynamic placeholder for the Investment Method value input.
  const investmentPlaceholder =
    dcaMethod === "specificDollar"
      ? "e.g. 1000.00"
      : dcaMethod === "shareCount"
      ? "e.g. 10"
      : "e.g. 5";

  // Helper to display full label for a given investment method.
  const getMethodLabel = (method: string) => {
    switch (method) {
      case "specificDollar":
        return "Specific Dollar Amount ($)";
      case "shareCount":
        return "Fixed Share Count (# Shares)";
      case "percentageCash":
      default:
        return "Percentage of Available Cash (%)";
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-6">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        General Settings
      </h1>

      {/* Wrap everything in a single form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* --- Trading Preferences Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Poll Frequency */}
            <div>
              <Label htmlFor="pollFrequency">Poll Frequency</Label>
              <select
                id="pollFrequency"
                name="pollFrequency"
                value={pollFrequency}
                onChange={(e) => {
                  setPollFrequency(e.target.value);
                  handleSessionUpdate("pollFrequency", e.target.value);
                }}
                className="rounded-md border border-gray-300 p-2 w-full"
              >
                <option value="minute">Minute</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="half">Half-Year</option>
                <option value="year">Year</option>
              </select>
            </div>

            {/* Dollar Cap Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dollarCapToggle"
                checked={dollarCapEnabled}
                onChange={() => {
                  const newValue = !dollarCapEnabled;
                  setDollarCapEnabled(newValue);
                  handleSessionUpdate("dollarCapEnabled", newValue.toString());
                }}
              />
              <Label htmlFor="dollarCapToggle">Enable Dollar Cap per Asset</Label>
            </div>

            {/* Dollar Cap Input */}
            <div>
              <Label htmlFor="dollarCap">Dollar Cap per Asset</Label>
              <Input
                type="number"
                step="0.01"
                id="dollarCap"
                name="dollarCap"
                value={dollarCap}
                onChange={(e) => {
                  setDollarCap(e.target.value);
                  handleSessionUpdate("dollarCap", e.target.value);
                }}
                placeholder="e.g. 1000"
                disabled={!dollarCapEnabled}
                className={!dollarCapEnabled ? "opacity-50 cursor-not-allowed" : ""}
              />
            </div>

            {/* Investment Method */}
            <div className="space-y-2">
              <h2 className="text-md font-semibold text-gray-800">
                Investment Method
              </h2>
              <p className="text-sm text-gray-500">
                Choose how you want to invest each time you trade.
              </p>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Radio Options */}
                <div className="flex-1">
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "specificDollar", label: "Specific Dollar Amount ($)" },
                      { value: "shareCount", label: "Fixed Share Count (# Shares)" },
                      { value: "percentageCash", label: "Percentage of Available Cash (%)" },
                    ].map(({ value, label }) => (
                      <label key={value} className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="dcaMethod"
                          value={value}
                          checked={dcaMethod === value}
                          onChange={(e) => setDcaMethod(e.target.value)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* "Current Settings" panel showing *saved* (last committed) values */}
                <div className="flex-1 border border-gray-200 p-4 rounded bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Current Settings
                  </h3>
                  <p>
                    <span className="font-medium">Poll Frequency:</span>{" "}
                    {savedPollFrequency}
                  </p>
                  <p>
                    <span className="font-medium">Dollar Cap per Asset:</span>{" "}
                    {savedDollarCapEnabled ? savedDollarCap : "Disabled"}
                  </p>
                  <p>
                    <span className="font-medium">Method:</span>{" "}
                    {getMethodLabel(savedDcaMethod)}
                  </p>
                  <p>
                    <span className="font-medium">Method Amount:</span>{" "}
                    {savedDcaValue || "Not set"}
                  </p>
                </div>
              </div>

              {/* Investment Method Value Input */}
              <div>
                <Label htmlFor="dcaValue">
                  {dcaMethod === "specificDollar"
                    ? "Dollar Amount ($)"
                    : dcaMethod === "shareCount"
                    ? "Share Count (#)"
                    : "Percentage of Available Cash (%)"}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min={dcaMethod === "percentageCash" ? "0" : undefined}
                  max={dcaMethod === "percentageCash" ? "100" : undefined}
                  id="dcaValue"
                  name="dcaValue"
                  value={dcaValue}
                  onChange={(e) => setDcaValue(e.target.value)}
                  placeholder={investmentPlaceholder}
                />
                {localError && (
                  <p className="text-sm text-red-600 mt-1">{localError}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Account Information Card --- */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 
              We do NOT store name/email in sessionStorage or any local state.
              They are simply form fields passed to the server on submit.
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  defaultValue={user?.name || ""}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  defaultValue={user?.email || ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button for entire form */}
        <Button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white mt-4"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </section>
  );
}
