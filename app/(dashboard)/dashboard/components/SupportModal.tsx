'use client';

import { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Paperclip, X, FileText, CheckCircle } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  userEmail?: string;
}

export default function SupportModal({ isOpen, onOpenChange, userName = '', userEmail = '' }: SupportModalProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create form data for file uploads
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('userName', userName);
      formData.append('userEmail', userEmail);
      
      // Add attachments
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      // Send the support request
      const response = await fetch('/api/support', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit support request');
      }

      // Reset form
      setSubject('');
      setDescription('');
      setAttachments([]);
      onOpenChange(false);
      
      // Show success modal instead of alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-xl">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 text-white">
            <DialogTitle className="text-xl font-semibold">Contact Support</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="How can we help you?"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Please describe your issue in detail..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                aria-label="File attachment input"
              />
              <div className="flex items-center">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={triggerFileInput}
                  className="flex items-center gap-2 text-sm"
                >
                  <Paperclip className="h-4 w-4" />
                  Attach Files
                </Button>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 rounded-full hover:bg-gray-200"
                        aria-label="Remove file"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter className="pt-4 gap-2">
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
              Request Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-gray-600 mb-6">
              Your support request has been successfully submitted. Our team will get back to you shortly.
            </p>
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 