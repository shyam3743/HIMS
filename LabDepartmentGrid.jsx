import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, TestTube, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LabDepartmentGrid({ labTestCatalog, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {labTestCatalog.map((category) => (
        <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{category.category_name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {category.tests?.length || 0} tests
                  </Badge>
                  {category.has_dedicated_page && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Processing Page Available
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Tests:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {category.tests?.map((test, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <TestTube className="w-3 h-3 text-purple-400" />
                      <span>{test}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {category.has_dedicated_page ? (
                <Link 
                  to={createPageUrl("LabDepartment", { category: category.category_name })}
                  className="w-full"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to {category.category_name} Lab
                  </Button>
                </Link>
              ) : (
                <div className="text-center py-2">
                  <span className="text-xs text-gray-500">
                    Process orders through general laboratory workflow
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {labTestCatalog.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Lab Departments</h3>
            <p className="text-gray-500">Configure lab test catalog to see departments here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}