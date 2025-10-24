import { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';

interface ReceiptUploadProps {
  onClose: () => void;
  onProcessed: (data: { amount: number; date: string; description: string }) => void;
}

export const ReceiptUpload = ({ onClose, onProcessed }: ReceiptUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setExtractedData(null);
    }
  };

  const mockGoogleVisionExtraction = (fileName: string): any => {
    const mockResponses = [
      {
        text: 'RECEIPT\nSupplies Store Ltd.\nDate: 2025-10-20\nItems:\n- Office Paper x5\n- Pens x10\n- Folders x3\nTotal: KES 2,500.00\nThank you for your business!',
        confidence: 0.97,
        amount: 2500,
        date: '2025-10-20',
        vendor: 'Supplies Store Ltd.',
      },
      {
        text: 'INVOICE\nElectricity Company\nBill Date: 2025-10-15\nAccount: 123456\nAmount Due: KES 4,200.00\nDue Date: 2025-10-30',
        confidence: 0.94,
        amount: 4200,
        date: '2025-10-15',
        vendor: 'Electricity Company',
      },
      {
        text: 'RECEIPT\nFuel Station\nDate: 2025-10-18\nLitres: 45.5\nPrice per L: KES 180\nTotal: KES 8,190.00',
        confidence: 0.96,
        amount: 8190,
        date: '2025-10-18',
        vendor: 'Fuel Station',
      },
      {
        text: 'TAX INVOICE\nOffice Rent\nMonth: October 2025\nProperty: Suite 204\nRent Amount: KES 35,000.00\nIssued: 2025-10-01',
        confidence: 0.98,
        amount: 35000,
        date: '2025-10-01',
        vendor: 'Property Management',
      },
    ];

    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex];
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResult = mockGoogleVisionExtraction(file.name);
    setExtractedData(mockResult);
    setProcessing(false);
  };

  const handleUseData = () => {
    if (extractedData) {
      onProcessed({
        amount: extractedData.amount,
        date: extractedData.date,
        description: `Payment to ${extractedData.vendor}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Upload Receipt</h2>
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-emerald-900 mb-1">AI-Powered Extraction</h3>
                <p className="text-sm text-emerald-700">
                  Upload a receipt image and our AI will automatically extract the amount, date, and vendor information.
                  This demo uses simulated Google Cloud Vision API responses.
                </p>
              </div>
            </div>
          </div>

          {!file ? (
            <label className="block">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50 hover:bg-emerald-50">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-700 font-medium mb-2">Click to upload receipt</p>
                <p className="text-sm text-slate-500">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="w-full rounded-xl border border-slate-200 max-h-64 object-contain bg-slate-50"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview('');
                    setExtractedData(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {!extractedData && !processing && (
                <button
                  onClick={handleProcess}
                  className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Process with AI
                </button>
              )}

              {processing && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-700 font-medium">Processing receipt with AI...</p>
                  </div>
                </div>
              )}

              {extractedData && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-slate-900">Extracted Data</h3>
                      <span className="ml-auto text-sm text-slate-600">
                        Confidence: {(extractedData.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 uppercase">Amount</label>
                        <p className="text-lg font-bold text-slate-900">
                          KES {extractedData.amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 uppercase">Date</label>
                        <p className="text-lg font-medium text-slate-900">{extractedData.date}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 uppercase">Vendor</label>
                        <p className="text-lg font-medium text-slate-900">{extractedData.vendor}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 uppercase">Full Text</label>
                        <p className="text-sm text-slate-700 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200 mt-1">
                          {extractedData.text}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUseData}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      Use This Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
