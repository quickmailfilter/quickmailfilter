import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp, EmailVerification } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const BulkProcessPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bulkUploads, verifyEmail, updateBulkStatus } = useApp();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<EmailVerification[]>([]);

  const upload = bulkUploads.find(u => u.id === id);

  const processEmails = async () => {
    if (!upload || !upload.emails || upload.emails.length === 0) {
      toast.error('No emails found to process');
      return;
    }

    setProcessing(true);
    const emailResults: EmailVerification[] = [];
    const emailsToProcess = upload.emails;

    for (let i = 0; i < emailsToProcess.length; i++) {
      const email = emailsToProcess[i];
      
      try {
        const result = await verifyEmail(email);
        emailResults.push(result);
        setResults([...emailResults]);
        setProgress(((i + 1) / emailsToProcess.length) * 100);
      } catch (error) {
        console.error('Error verifying:', email);
      }
    }

    setProcessing(false);
    toast.success('Bulk verification completed!');
    
    // Save results to Firestore
    const validCount = emailResults.filter(r => r.status === 'valid').length;
    const invalidCount = emailResults.filter(r => r.status === 'invalid').length;
    const riskyCount = emailResults.filter(r => r.status === 'risky').length;
    const unknownCount = emailResults.filter(r => r.status === 'unknown').length;

    try {
      await updateBulkStatus(upload.id, {
        status: 'completed',
        processed: emailResults.length,
        validCount,
        invalidCount,
        riskyCount,
        unknownCount,
        results: emailResults
      });
    } catch (err) {
      console.error('Failed to save bulk results:', err);
    }
  };

  useEffect(() => {
    if (upload && !processing && results.length === 0) {
      processEmails();
    }
  }, [upload]);

  if (!upload) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Upload not found</p>
        <Button onClick={() => navigate('/dashboard/bulk')} className="mt-4">
          Back to Upload
        </Button>
      </div>
    );
  }

  const validCount = results.filter(r => r.status === 'valid').length;
  const invalidCount = results.filter(r => r.status === 'invalid').length;
  const riskyCount = results.filter(r => r.status === 'risky').length;
  const unknownCount = results.filter(r => r.status === 'unknown').length;
  const totalInFile = upload?.emails?.length || 0;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1E3A8A]">Processing: {upload.filename}</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Verifying {totalInFile} email addresses
        </p>
      </div>

      {/* Progress */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {processing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Completed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center p-4 rounded-lg bg-accent/30">
              <div className="text-2xl font-bold text-gray-900">{results.length}</div>
              <div className="text-sm text-muted-foreground">Processed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/30">
              <div className="text-2xl font-bold text-gray-900">
                {totalInFile - results.length}
              </div>
              <div className="text-sm text-muted-foreground">Remaining</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/30">
              <div className="text-2xl font-bold text-gray-900">{totalInFile}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-accent/30">
              <div className="text-2xl font-bold text-gray-900">
                {results.length > 0 ? ((validCount / results.length) * 100).toFixed(0) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {!processing && results.length > 0 && (
            <div className="pt-6 flex justify-center">
              <Button 
                onClick={() => navigate(`/dashboard/bulk/results/${id}`)}
                className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/20"
              >
                View Detailed Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-[#E5E7EB] border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Valid</p>
                <p className="text-3xl font-bold text-green-600">{validCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Invalid</p>
                <p className="text-3xl font-bold text-red-600">{invalidCount}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Risky</p>
                <p className="text-3xl font-bold text-amber-600">{riskyCount}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-amber-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB] border-l-4 border-l-gray-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Unknown</p>
                <p className="text-3xl font-bold text-gray-600">{unknownCount}</p>
              </div>
              <HelpCircle className="w-10 h-10 text-gray-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
