'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiKey } from '@/lib/db/schema';
import { 
  PlusCircle, 
  Loader2, 
  Copy, 
  CheckCircle, 
  Trash2, 
  AlertCircle,
  CalendarIcon
} from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ApiKeysPage() {
  const router = useRouter();
  const { data: apiKeys, error, isLoading } = useSWR<ApiKey[]>('/api/api-keys', fetcher);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermission, setNewKeyPermission] = useState('read');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [newKeyData, setNewKeyData] = useState<ApiKey | null>(null);
  const [keyToCopy, setKeyToCopy] = useState('');
  const [copied, setCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // 删除确认相关状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const handleCreateKey = async () => {
    if (!newKeyName) {
      toast.error('Please enter an API key name');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName,
          permissions: [newKeyPermission],
          expiresAt: newKeyExpiry || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      setNewKeyData(data);
      mutate('/api/api-keys'); // 刷新API密钥列表
    } catch (error) {
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const openDeleteDialog = (key: ApiKey) => {
    setKeyToDelete(key);
    setConfirmName('');
    setDeleteDialogOpen(true);
  };

  const handleRevokeKey = async () => {
    if (!keyToDelete) return;
    
    if (confirmName !== keyToDelete.name) {
      toast.error('The name entered does not match, cannot delete');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/api-keys/${keyToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      toast.success('API key revoked');
      mutate('/api/api-keys'); // 刷新API密钥列表
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
      setConfirmName('');
    } catch (error) {
      toast.error('Failed to revoke API key');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setKeyToCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetNewKeyForm = () => {
    setNewKeyName('');
    setNewKeyPermission('read');
    setNewKeyExpiry('');
    setNewKeyData(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetNewKeyForm();
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setKeyToDelete(null);
      setConfirmName('');
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">API Key Management</h1>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {!newKeyData ? (
              <>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    API keys allow other services to securely access your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Production, Staging"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permission">Permissions</Label>
                    <Select
                      value={newKeyPermission}
                      onValueChange={setNewKeyPermission}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Permission" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="write">Read & Write</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {newKeyExpiry ? (
                            format(new Date(newKeyExpiry), 'yyyy-MM-dd')
                          ) : (
                            <span className="text-muted-foreground">Select Expiry Date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newKeyExpiry ? new Date(newKeyExpiry) : undefined}
                          onSelect={(date) => setNewKeyExpiry(date ? format(date, 'yyyy-MM-dd') : '')}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">
                      If not set, the key will never expire
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleCreateKey}
                    disabled={isCreating}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Key'
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Generated</DialogTitle>
                  <DialogDescription>
                    Please copy your API key immediately. For security reasons, we will not display the full key again.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex">
                      <Input
                        value={newKeyData.key}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => copyToClipboard(newKeyData.key)}
                      >
                        {copied && keyToCopy === newKeyData.key ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      onClick={resetNewKeyForm}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Finish
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              Confirm API Key Revocation
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. After revocation, all applications using this key will lose API access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <div className="font-medium">{keyToDelete?.name}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-name">
                Please enter the key name <span className="text-red-500 font-medium">{keyToDelete?.name}</span> to confirm revocation
              </Label>
              <Input
                id="confirm-name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Enter key name to confirm"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleRevokeKey}
              disabled={isDeleting || confirmName !== keyToDelete?.name}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Confirm Revocation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage your API keys to access API services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading API keys
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Keys</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          {key.key}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.permissions?.map((perm) => (
                        <Badge key={perm} variant="outline" className="mr-1">
                          {perm}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {format(new Date(key.createdAt), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      {key.expiresAt
                        ? format(new Date(key.expiresAt), 'yyyy-MM-dd')
                        : 'Never Expires'}
                    </TableCell>
                    <TableCell>
                      {key.lastUsed
                        ? format(new Date(key.lastUsed), 'yyyy-MM-dd')
                        : 'Never Used'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(key)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              You haven't created any API keys yet
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            API keys are sensitive information, please handle them with care.
          </p>
        </CardFooter>
      </Card>
    </section>
  );
}
