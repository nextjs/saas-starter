'use client';

import Link from 'next/link';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/lib/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGoogleGeocoding } from '@/lib/hooks/useGoogleMaps';

export default function SearchViewPage() {
  return (
    <AuthProvider>
      <SearchViewPageContent />
    </AuthProvider>
  );
}

function SearchViewPageContent() {
  const searchParams = useSearchParams();
  const address = searchParams.get('address') || '123 Mountain View Road, Telluride, CO 81435';
  const [streetViewUrl, setStreetViewUrl] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const geocoding = useGoogleGeocoding();

  // Geocode the address to get coordinates for Street View
  useEffect(() => {
    const initializeStreetView = async () => {
      try {
        const result = await geocoding.geocode(address);
        if (result && result.location) {
          setLocation(result.location);
          
          // Create Google Street View API URL with real coordinates
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${result.location.lat},${result.location.lng}&key=${apiKey}`;
          setStreetViewUrl(streetViewUrl);
        }
      } catch (error) {
        console.error('Failed to geocode address:', error);
      }
    };

    if (address) {
      initializeStreetView();
    }
  }, [address, geocoding]);

  return (
    <main className="pb-24">
      <Header />
      <div className="px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/search"
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Parcel Details</h1>
        <p className="text-gray-600 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {address}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        {/* Street View Section */}
        <div className="md:col-span-2">
          <div className="bg-gray-200 rounded-lg overflow-hidden h-96 mb-6 relative">
            {streetViewUrl ? (
              <iframe
                src={streetViewUrl}
                className="w-full h-full"
                title="Google Street View"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex flex-col items-center justify-center text-white">
                <div className="animate-spin mb-4">📍</div>
                <h3 className="text-xl font-semibold mb-2">Loading Map...</h3>
                <p className="text-blue-100 text-center max-w-xs">
                  Getting location data for {address}
                </p>
              </div>
            )}
          </div>

          {/* Location Info */}
          {location && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Coordinates</p>
              <p className="font-mono text-gray-900">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>
          )}

          {/* Geocoding Error */}
          {geocoding.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm font-medium">Error loading map</p>
              <p className="text-red-500 text-sm">{geocoding.error}</p>
              <p className="text-red-500 text-xs mt-2">
                Check your Google Maps API key configuration in .env.local
              </p>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Property Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Latitude</p>
                <p className="text-gray-800 font-medium">37.9377°</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Longitude</p>
                <p className="text-gray-800 font-medium">-106.9167°</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Area</p>
                <p className="text-gray-800 font-medium">15.5 acres</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Zoning</p>
                <p className="text-gray-800 font-medium">Residential - Mountain</p>
              </div>
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Need More Info?</h3>
            <div className="space-y-3">
              <a
                href="tel:+1-970-555-0100"
                className="flex items-center gap-3 text-orange-600 hover:text-orange-700 font-medium"
              >
                <Phone className="w-4 h-4" />
                +1 (970) 555-0100
              </a>
              <a
                href="mailto:info@geoselect.com"
                className="flex items-center gap-3 text-orange-600 hover:text-orange-700 font-medium"
              >
                <Mail className="w-4 h-4" />
                info@geoselect.com
              </a>
            </div>
          </div>

          {/* Sign Up CTA */}
          <Link
            href="/workspaces/create"
            className="block w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-center"
          >
            Sign Up for More Features
          </Link>

          {/* Features List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-semibold mb-3">UNLOCK WITH ACCOUNT:</p>
            <ul className="space-y-2 text-xs text-gray-700">
              <li>✓ Property analysis</li>
              <li>✓ Batch exports</li>
              <li>✓ AI insights</li>
              <li>✓ Historical data</li>
              <li>✓ Market comparisons</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Map Location</h3>
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">🗺️</div>
            <p className="text-gray-600">Google Maps embedded view</p>
            <p className="text-gray-500 text-sm mt-1">37.9377°, -106.9167°</p>
          </div>
        </div>
      </div>

      <BottomNavigation />
      </div>
    </main>
  );
}
