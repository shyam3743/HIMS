import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, FileText } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function LabReportUpload({ order, onSubmit, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [reportData, setReportData] = useState({
    result_value: order.result_value || "",
    reference_range: order.reference_range || "",
    abnormal_flag: order.abnormal_flag || false,
    lab_technician: order.lab_technician || "",
    comments: order.comments || "",
    report_file_url: order.report_file_url || "",
    report_file_name: order.report_file_name || ""
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadFile({ file });
      setReportData(prev => ({
        ...prev,
        report_file_url: result.file_url,
        report_file_name: file.name
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    }
    setIsUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(order.id, reportData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Upload Lab Report</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Test Details</h3>
            <div className="text-sm text-gray-600 space-y-1 mt-2">
              <div>Patient: {order.patient_name}</div>
              <div>Test: {order.test_name}</div>
              <div>Category: {order.test_category}</div>
              <div>Ordered by: Dr. {order.doctor_name}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="result_value">Test Result *</Label>
              <Input
                id="result_value"
                value={reportData.result_value}
                onChange={(e) => setReportData(prev => ({ ...prev, result_value: e.target.value }))}
                placeholder="Enter test result value"
                required
              />
            </div>

            <div>
              <Label htmlFor="reference_range">Reference Range</Label>
              <Input
                id="reference_range"
                value={reportData.reference_range}
                onChange={(e) => setReportData(prev => ({ ...prev, reference_range: e.target.value }))}
                placeholder="Normal range (e.g., 70-100 mg/dL)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="abnormal_flag"
                checked={reportData.abnormal_flag}
                onChange={(e) => setReportData(prev => ({ ...prev, abnormal_flag: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="abnormal_flag">Mark as abnormal result</Label>
            </div>

            <div>
              <Label htmlFor="lab_technician">Lab Technician Name</Label>
              <Input
                id="lab_technician"
                value={reportData.lab_technician}
                onChange={(e) => setReportData(prev => ({ ...prev, lab_technician: e.target.value }))}
                placeholder="Name of technician who processed the test"
              />
            </div>

            <div>
              <Label htmlFor="report_file">Upload Report File</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="report_file"
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {reportData.report_file_name && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <FileText className="w-4 h-4" />
                    <span>Uploaded: {reportData.report_file_name}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                value={reportData.comments}
                onChange={(e) => setReportData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Any additional notes or observations"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isUploading || !reportData.result_value}
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Save Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}