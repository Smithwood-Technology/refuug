import { useState } from "react";
import { useResourceStore } from "@/hooks/use-resource-store";
import ResourceForm from "@/components/forms/ResourceForm";
import ResourceTable from "@/components/tables/ResourceTable";
import AdminNavBar from "@/components/admin/AdminNavBar";
import { Resource } from "@shared/schema";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";

export default function Admin() {
  const { resources, isLoading, addResource, updateResource, deleteResource } = useResourceStore();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingResource(null);
  };

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <AdminNavBar />
      
      <div className="max-w-4xl mx-auto px-4 py-6 w-full">
        <h1 className="text-2xl font-medium mb-6">Resource Management</h1>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-medium mb-4">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            
            <ResourceForm 
              initialData={editingResource || undefined}
              onSubmit={async (data) => {
                if (editingResource) {
                  await updateResource(editingResource.id, data);
                } else {
                  await addResource(data);
                }
                setEditingResource(null);
              }}
              onCancel={editingResource ? handleCancelEdit : undefined}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-medium mb-4">Resource List</h2>
            <p className="text-gray-600 mb-4">
              View and edit existing resources. Changes will immediately reflect on the map.
            </p>
            
            <ResourceTable 
              resources={resources}
              isLoading={isLoading}
              onEdit={handleEditResource}
              onDelete={deleteResource}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
