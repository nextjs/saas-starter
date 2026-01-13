'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  ExternalLink,
  ChevronDown 
} from 'lucide-react';

interface Rule {
  id: string;
  rule_type: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'compliant' | 'non_compliant' | 'review_required' | 'unknown';
  sources?:  Array<{
    id: string;
    name: string;
    citation: string;
    confidence_level: string;
    document_url?: string;
  }>;
}

interface RulesEvaluationProps {
  rules: Rule[];
}

export function RulesEvaluation({ rules }: RulesEvaluationProps) {
  const [expandedRules, setExpandedRules] = React.useState<Set<string>>(new Set());

  const toggleRule = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  const getStatusIcon = (status: Rule['status']) => {
    switch (status) {
      case 'compliant': 
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'non_compliant': 
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'review_required':  
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:   
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: Rule['severity']) => {
    const variants = {
      critical: 'destructive',
      warning: 'default',
      info: 'secondary',
    } as const;

    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  const rulesByType = rules.reduce((acc, rule) => {
    if (!acc[rule.rule_type]) {
      acc[rule.rule_type] = [];
    }
    acc[rule.rule_type].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  const summary = {
    compliant: rules.filter(r => r.status === 'compliant').length,
    non_compliant: rules.filter(r => r.status === 'non_compliant').length,
    review_required: rules.filter(r => r.status === 'review_required').length,
    unknown: rules.filter(r => r.status === 'unknown').length,
  };

  return (
    <div className="space-y-6">
      {summary.non_compliant > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {summary.non_compliant} potential compliance issue{summary.non_compliant > 1 ? 's' :  ''} identified. 
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{summary.compliant}</p>
                <p className="text-sm text-muted-foreground">Compliant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{summary.non_compliant}</p>
                <p className="text-sm text-muted-foreground">Issues</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{summary.review_required}</p>
                <p className="text-sm text-muted-foreground">Review</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{summary.unknown}</p>
                <p className="text-sm text-muted-foreground">Unknown</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.entries(rulesByType).map(([type, typeRules]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="capitalize">
              {type.replace(/_/g, ' ')} ({typeRules.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {typeRules.map((rule) => (
              <Collapsible key={rule.id}>
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(rule.status)}
                      <div className="flex-1">
                        <p className="font-medium">{rule.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getSeverityBadge(rule.severity)}
                          <Badge variant="outline" className="capitalize">
                            {rule.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {rule.sources && rule.sources.length > 0 && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRule(rule.id)}
                        >
                          {expandedRules.has(rule.id) ? 'Hide' : 'Show'} Sources
                          <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${
                            expandedRules.has(rule.id) ? 'rotate-180' : ''
                          }`} />
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>

                  {rule.sources && rule.sources.length > 0 && (
                    <CollapsibleContent>
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <p className="text-sm font-medium">Sources:</p>
                        {rule.sources.map((source) => (
                          <div key={source.id} className="flex items-start gap-2 text-sm bg-muted p-3 rounded">
                            <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">{source.name}</p>
                              <p className="text-muted-foreground">{source.citation}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {source.confidence_level}
                                </Badge>
                                {source.document_url && (
                                  <a
                                    href={source.document_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                  >
                                    View Document →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            ))}
          </CardContent>
        </Card>
      ))}

      {rules.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No rules evaluated for this parcel
          </CardContent>
        </Card>
      )}
    </div>
  );
}
