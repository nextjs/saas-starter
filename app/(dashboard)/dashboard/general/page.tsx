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

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAccount,
    { error: "", success: "" }
  );

  // Trading Preferences state
  const [pollFrequency, setPollFrequency] = useState("month");

  // Dollar Cap is purely optional now (enabled/disabled independently of Investment Method).
  const [dollarCapEnabled, setDollarCapEnabled] = useState(false);
  const [dollarCap, setDollarCap] = useState("500.00");

  // Investment Method unsaved state (inputs)
  const [dcaMethod, setDcaMethod] = useState("percentageCash");
  const [dcaValue, setDcaValue] = useState("5");

  // Investment Method saved state (shown in "Current Settings")
  const [savedDcaMethod, setSavedDcaMethod] = useState("percentageCash");
  const [savedDcaValue, setSavedDcaValue] = useState("5");

  useEffect(() => {
    setPollFrequency(sessionStorage.getItem("pollFrequency") || "month");
    setDollarCapEnabled(sessionStorage.getItem("dollarCapEnabled") === "true");
    setDollarCap(sessionStorage.getItem("dollarCap") || "500.00");

    const storedDcaMethod =
      sessionStorage.getItem("dcaMethod") || "percentageCash";
    const storedDcaValue = sessionStorage.getItem("dcaValue") || "5";
    setDcaMethod(storedDcaMethod);
    setDcaValue(storedDcaValue);
    setSavedDcaMethod(storedDcaMethod);
    setSavedDcaValue(storedDcaValue);
  }, []);

  // This function updates session storage for non-Investment Method fields immediately.
  const handleSessionUpdate = (key: string, value: string) => {
    sessionStorage.setItem(key, value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(() => {
      // Update sessionStorage for Trading Preferences immediately.
      handleSessionUpdate("pollFrequency", pollFrequency);
      handleSessionUpdate("dollarCapEnabled", dollarCapEnabled.toString());
      handleSessionUpdate("dollarCap", dollarCap);

      // For Investment Method, update saved state on submit.
      handleSessionUpdate("dcaMethod", dcaMethod);
      handleSessionUpdate("dcaValue", dcaValue);
      setSavedDcaMethod(dcaMethod);
      setSavedDcaValue(dcaValue);

      formAction(new FormData(event.currentTarget));
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

      {/* Wrap everything in a single form, with one "Save Changes" button at the bottom. */}
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

            {/* Dollar Cap Input (independent of investment method) */}
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

                {/* Current Settings Sub-section (reflects the last saved values) */}
                <div className="flex-1 border border-gray-200 p-4 rounded bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Current Settings
                  </h3>
                  <p>
                    <span className="font-medium">Method:</span>{" "}
                    {getMethodLabel(savedDcaMethod)}
                  </p>
                  <p>
                    <span className="font-medium">Value:</span>{" "}
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
                  id="dcaValue"
                  name="dcaValue"
                  value={dcaValue}
                  onChange={(e) => setDcaValue(e.target.value)}
                  placeholder={investmentPlaceholder}
                />
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
                  required
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
