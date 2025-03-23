import React from 'react';
import { AiCode } from '@/types/encounter';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MedicalCodesProps {
  codes: AiCode[];
  selectedCodeId?: string | null;
  onCodeSelect?: (codeId: string | null) => void;
}

const MedicalCodes: React.FC<MedicalCodesProps> = ({ codes, selectedCodeId, onCodeSelect }) => {
  if (codes.length === 0) {
    return <div className="text-muted-foreground">No codes available.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            {selectedCodeId && (
              <TableHead className="w-20 text-right">
                <button 
                  onClick={() => onCodeSelect && onCodeSelect(null)} 
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Clear
                </button>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {codes.map((code) => {
            const isSelected = selectedCodeId === code.code;
            return (
              <TableRow 
                key={code.code}
                className={isSelected ? 'bg-primary/10 hover:bg-primary/15' : ''}
                onClick={() => onCodeSelect && onCodeSelect(code.code)}
              >
                <TableCell className={isSelected ? 'font-medium' : ''}>
                  {code.code}
                </TableCell>
                <TableCell className={isSelected ? 'font-medium' : ''}>
                  {code.description}
                </TableCell>
                {selectedCodeId && (
                  <TableCell className="text-right">
                    {isSelected && (
                      <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                        Selected
                      </span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MedicalCodes;
