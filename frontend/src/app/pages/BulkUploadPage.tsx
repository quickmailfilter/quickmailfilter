import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileUpload } from '../components/FileUpload';
import { toast } from 'sonner';
import { FileSpreadsheet, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export const BulkUploadPage = () => {
  const { uploadBulkFile, user } = useApp();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedEmails, setExtractedEmails] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setParsing(true);
    setExtractedEmails([]);

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    try {
      let emails: string[] = [];

      if (fileExtension === '.csv') {
        emails = await parseCSV(file);
      } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
        emails = await parseExcel(file);
      } else if (fileExtension === '.txt') {
        emails = await parseTXT(file);
      }

      // Filter valid looking emails and remove duplicates
      const validEmails = Array.from(new Set(
        emails
          .map(e => e?.toString().trim())
          .filter(e => e && validateEmail(e))
      ));

      setExtractedEmails(validEmails);
      if (validEmails.length === 0) {
        toast.error('No valid email addresses found in the file');
      } else {
        toast.success(`Found ${validEmails.length} email addresses`);
      }
    } catch (error) {
      console.error('Parsing error:', error);
      toast.error('Failed to parse file. Please check the format.');
    } finally {
      setParsing(false);
    }
  };

  const parseCSV = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        complete: (results) => {
          const emails: string[] = [];
          results.data.forEach((row: any) => {
            // Check all columns for emails if it's an object/array
            if (Array.isArray(row)) {
              row.forEach(val => emails.push(val));
            } else if (typeof row === 'object') {
              Object.values(row).forEach(val => emails.push(val as string));
            }
          });
          resolve(emails);
        },
        error: () => resolve([])
      });
    });
  };

  const parseExcel = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const emails: string[] = [];
        json.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach(val => emails.push(val));
          }
        });
        resolve(emails);
      };
      reader.onerror = () => resolve([]);
      reader.readAsBinaryString(file);
    });
  };

  const parseTXT = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Split by lines, commas, or semicolons
        const emails = text.split(/[\n\r\s,;]+/).filter(Boolean);
        resolve(emails);
      };
      reader.onerror = () => resolve([]);
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    if (extractedEmails.length === 0) {
      toast.error('No valid emails to process');
      return;
    }

    if (!user) {
      toast.error('Please log in to upload files');
      return;
    }

    setUploading(true);
    try {
      const upload = await uploadBulkFile(selectedFile, extractedEmails);
      toast.success('File uploaded and list prepared!');
      navigate(`/dashboard/bulk/process/${upload.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">Bulk Email List Cleaning</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Upload your email list and verify thousands of addresses in minutes
        </p>
      </div>

      {/* Quota Warning */}
      {user && user.usedQuota >= user.monthlyQuota * 0.9 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You're approaching your monthly quota limit. 
            {user.monthlyQuota - user.usedQuota} verifications remaining.
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Card */}
      <Card className="border-[#E5E7EB] shadow-sm">
        <CardHeader>
          <CardTitle>Upload Email List</CardTitle>
          <CardDescription>
            Support for CSV, Excel (XLSX, XLS), and Text (TXT) files - Maximum file size: 10MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload onFileSelect={handleFileSelect} />

          {selectedFile && !parsing && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-500">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-blue-200 shadow-sm">
                    {selectedFile.name.endsWith('.txt') ? <FileText className="w-5 h-5 text-blue-600" /> : <FileSpreadsheet className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-blue-600 font-medium">{extractedEmails.length} valid emails detected</p>
                  </div>
                </div>
                {extractedEmails.length > 0 && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || extractedEmails.length === 0}
                size="lg"
                className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] h-14 text-lg font-bold shadow-lg shadow-blue-500/20"
              >
                {uploading ? 'Preparing List...' : 'Start Cleaning Now'}
              </Button>
            </div>
          )}

          {parsing && (
            <div className="text-center py-4">
              <div className="w-8 h-8 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Analyzing file content...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-[#E5E7EB] bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-[#2563EB]" />
            <CardTitle className="text-[#1E3A8A]">File Format Guidelines</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">Excel / CSV Format:</h4>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>Columns can contain any data, we will automatically find the emails.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>One email per row is expected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>Duplicate addresses are automatically removed.</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">Text (TXT) Format:</h4>
              <ul className="space-y-1.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>Paste one email address per line.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>Comma or semicolon separated lists are also supported.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <h4 className="font-semibold mb-2 text-xs text-gray-400">CSV EXAMPLE:</h4>
              <pre className="bg-white p-3 rounded-lg border border-[#E5E7EB] text-xs font-mono overflow-x-auto">
{`email,name
user1@gmail.com,John
user2@yahoo.com,Sarah`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-xs text-gray-400">TXT EXAMPLE:</h4>
              <pre className="bg-white p-3 rounded-lg border border-[#E5E7EB] text-xs font-mono overflow-x-auto">
{`admin@company.com
support@service.io
contact@web.com`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
