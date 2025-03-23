'use client';

import { useState } from 'react';
import { useEncounters } from '@/hooks/useEncounters';
import { Encounter, EncounterStatus } from '@/types/encounter';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EncountersPage() {
  const { patientRecords, navigateToEncounter, isLoading, error, fetchEncounters } = useEncounters();

  // Helper functions
  const formatDate = (date: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return date;
    }
  };

  // Check if the record has AI codes
  const hasAiCodes = (record: Encounter): boolean => {
    return record.aiCodes !== undefined && record.aiCodes.length > 0;
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

    const statusClasses: Record<EncounterStatus, string> = {
      'Active': `${baseClasses} bg-green-100 text-green-800`,
      'Pending': `${baseClasses} bg-yellow-100 text-yellow-800`,
      'Completed': `${baseClasses} bg-blue-100 text-blue-800`,
      'Inactive': `${baseClasses} bg-gray-100 text-gray-800`,
      'ACTIVE': `${baseClasses} bg-green-100 text-green-800`,
      'PENDING': `${baseClasses} bg-yellow-100 text-yellow-800`,
      'COMPLETED': `${baseClasses} bg-blue-100 text-blue-800`,
      'INACTIVE': `${baseClasses} bg-gray-100 text-gray-800`
    };

    return statusClasses[status as EncounterStatus] || `${baseClasses} bg-gray-100 text-gray-800`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encounters</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <strong>Error:</strong> {error}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEncounters}
              className="ml-2"
            >
                <img
                src="/clinicdesk_logo.png"
                alt="Refresh"
                width={16}
                height={16}
                className="mr-1"
                />
              Retry
            </Button>
          </div>
        ) : patientRecords.length === 0 ? (
          <div className="bg-muted p-4 rounded-md text-center">
            No encounters found.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chart ID</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Encounter</TableHead>
                  <TableHead>AI Codes</TableHead>
                  <TableHead>AI Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientRecords.map((record) => (
                  <TableRow
                    key={record.chartId || record.id}
                    onClick={() => navigateToEncounter(record.chartId || record.id)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>{record.chartId}</TableCell>
                    <TableCell>{record.patientName}</TableCell>
                    <TableCell>{record.provider}</TableCell>
                    <TableCell>{formatDate(record.dob || '')}</TableCell>
                    <TableCell>
                      <span className={getStatusBadgeClass(record.status || '')}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>{record.encounter ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      {record.aiCodes && record.aiCodes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {record.aiCodes.map((code, index) => (
                            <span key={index} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {code.code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={hasAiCodes(record) ? 'text-green-600' : 'text-red-600'}>
                        {hasAiCodes(record) ? 'Yes' : 'No'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
