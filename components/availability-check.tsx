"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function AvailabilityCheck() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    postalCode: "",
    location: "",
    street: "",
    houseNumber: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Checking availability for:", formData)
    router.push("/pricing")
    // Here you would typically make an API call to check availability
  }

  return (
    <div className="bg-gray-200 rounded-lg p-6 max-w-4xl mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Jetzt Verfügbarkeit prüfen</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postleitzahl
          </label>
          <Input
            id="postalCode"
            name="postalCode"
            type="text"
            placeholder="PLZ"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Ort
          </label>
          <Input
            id="location"
            name="location"
            type="text"
            placeholder="Ort"
            value={formData.location}
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
            Straße
          </label>
          <Input
            id="street"
            name="street"
            type="text"
            placeholder="Straße"
            value={formData.street}
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>
        <div>
          <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Hausnummer
          </label>
          <Input
            id="houseNumber"
            name="houseNumber"
            type="text"
            placeholder="Nr."
            value={formData.houseNumber}
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>
        <div className="md:col-span-4 flex justify-center mt-2">
          <Button type="submit" className="bg-[#000099] hover:bg-purple-600 text-white px-8 py-2 rounded-full">
            Verfügbarkeit prüfen
          </Button>
        </div>
      </form>
      {formData.postalCode.length > 0 && formData.postalCode !== "88682" && (
        <p>Leider sind im Moment noch keine Produkte der NetCom BW an Ihrer Adresse verfügbar.</p>
      )}
    </div>
  )
}
