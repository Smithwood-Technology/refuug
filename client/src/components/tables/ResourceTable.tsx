import { Resource, ResourceType } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";

interface ResourceTableProps {
  resources: Resource[];
  isLoading: boolean;
  onEdit: (resource: Resource) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function ResourceTable({ 
  resources, 
  isLoading,
  onEdit,
  onDelete
}: ResourceTableProps) {
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(resourceToDelete.id);
    } finally {
      setIsDeleting(false);
      setResourceToDelete(null);
    }
  };

  // Type badge colors
  const typeBadgeColors: Record<ResourceType, { bg: string, text: string }> = {
    shelter: { bg: 'bg-[#8E24AA]/10', text: 'text-[#8E24AA]' },
    food: { bg: 'bg-[#43A047]/10', text: 'text-[#43A047]' },
    water: { bg: 'bg-[#039BE5]/10', text: 'text-[#039BE5]' },
    wifi: { bg: 'bg-[#FFA000]/10', text: 'text-[#FFA000]' },
    weather: { bg: 'bg-[#E53935]/10', text: 'text-[#E53935]' },
    restroom: { bg: 'bg-[#607D8B]/10', text: 'text-[#607D8B]' },
    health: { bg: 'bg-[#00ACC1]/10', text: 'text-[#00ACC1]' },
  };

  const typeLabels: Record<ResourceType, string> = {
    shelter: "Shelter",
    food: "Food",
    water: "Water",
    wifi: "WiFi",
    weather: "Weather",
    restroom: "Restroom",
    health: "Health",
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading resources...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">Resource</TableHead>
            <TableHead className="text-foreground">Type</TableHead>
            <TableHead className="text-foreground">Address</TableHead>
            <TableHead className="text-foreground">Hours</TableHead>
            <TableHead className="text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No resources found. Add a resource using the form above.
              </TableCell>
            </TableRow>
          ) : (
            resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className="font-medium text-foreground">
                  {resource.name}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadgeColors[resource.type as ResourceType]?.bg} ${typeBadgeColors[resource.type as ResourceType]?.text}`}>
                    {typeLabels[resource.type as ResourceType]}
                  </span>
                </TableCell>
                <TableCell className="text-foreground">
                  {resource.address}
                </TableCell>
                <TableCell className="text-foreground">
                  {resource.hours || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:text-primary-dark"
                      onClick={() => onEdit(resource)}
                    >
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => setResourceToDelete(resource)}
                        >
                          <Trash className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resourceToDelete?.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
