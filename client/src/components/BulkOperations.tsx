import { useState } from "react";
import { Download, Trash2, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useConfirmationDialog } from "@/components/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

interface BulkOperationsProps<T> {
  items: T[];
  selectedItems: Set<number>;
  onSelectionChange: (selected: Set<number>) => void;
  onBulkDelete?: (ids: number[]) => Promise<void>;
  onExport?: (items: T[]) => void;
  getItemId: (item: T) => number;
  getItemName?: (item: T) => string;
  exportFilename?: string;
}

export function BulkOperations<T>({
  items,
  selectedItems,
  onSelectionChange,
  onBulkDelete,
  onExport,
  getItemId,
  getItemName,
  exportFilename = "export"
}: BulkOperationsProps<T>) {
  const { toast } = useToast();
  const { dialog, openDialog } = useConfirmationDialog();
  const [isDeleting, setIsDeleting] = useState(false);

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;
  const isPartiallySelected = selectedItems.size > 0 && selectedItems.size < items.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(getItemId)));
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedItems.size === 0) return;

    const selectedItemNames = items
      .filter(item => selectedItems.has(getItemId(item)))
      .map(item => getItemName ? getItemName(item) : `Item ${getItemId(item)}`)
      .slice(0, 3);
    
    const displayNames = selectedItemNames.join(", ");
    const remainingCount = selectedItems.size - selectedItemNames.length;
    const itemsList = remainingCount > 0 
      ? `${displayNames} and ${remainingCount} more` 
      : displayNames;

    openDialog({
      title: "Delete Selected Items",
      description: `Are you sure you want to delete ${selectedItems.size} item(s)? This will permanently delete: ${itemsList}`,
      confirmText: "Delete All",
      variant: "destructive",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await onBulkDelete(Array.from(selectedItems));
          onSelectionChange(new Set());
          toast({
            title: "Success",
            description: `Deleted ${selectedItems.size} item(s) successfully`
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete selected items",
            variant: "destructive"
          });
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleExport = () => {
    if (!onExport) return;
    
    const itemsToExport = selectedItems.size > 0 
      ? items.filter(item => selectedItems.has(getItemId(item)))
      : items;
    
    onExport(itemsToExport);
    toast({
      title: "Export Started",
      description: `Exporting ${itemsToExport.length} item(s)`
    });
  };

  if (items.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onCheckedChange={handleSelectAll}
              aria-label="Select all items"
            />
            <span className="text-sm font-medium">
              {selectedItems.size > 0 
                ? `${selectedItems.size} of ${items.length} selected`
                : `Select all ${items.length} items`
              }
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export {selectedItems.size > 0 ? 'Selected' : 'All'}
            </Button>
          )}
          
          {onBulkDelete && selectedItems.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : `Delete ${selectedItems.size}`}
            </Button>
          )}
        </div>
      </div>
      {dialog}
    </>
  );
}

// Individual item selection checkbox
interface ItemSelectionProps {
  itemId: number;
  selectedItems: Set<number>;
  onSelectionChange: (selected: Set<number>) => void;
}

export function ItemSelection({ itemId, selectedItems, onSelectionChange }: ItemSelectionProps) {
  const isSelected = selectedItems.has(itemId);

  const handleToggle = () => {
    const newSelection = new Set(selectedItems);
    if (isSelected) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    onSelectionChange(newSelection);
  };

  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={handleToggle}
      aria-label={`Select item ${itemId}`}
    />
  );
}

// Export utilities
export function exportToCSV<T>(data: T[], filename: string = "export") {
  if (data.length === 0) return;

  // Get all unique keys from the data
  const keys = Array.from(new Set(data.flatMap(item => Object.keys(item as any))));
  
  // Create CSV content
  const csvContent = [
    keys.join(","), // Header row
    ...data.map(item => 
      keys.map(key => {
        const value = (item as any)[key];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(",")
    )
  ].join("\n");

  // Download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON<T>(data: T[], filename: string = "export") {
  if (data.length === 0) return;

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}