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
import { Button } from "@/components/ui/button";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { Loader2 } from "lucide-react";

interface ReportDownloadOptionProps {
  onExport: () => void;
  isExporting?: boolean;
  disabled?: boolean;
}

export function ReportDownloadOption({
  onExport,
  isExporting = false,
  disabled = false,
}: ReportDownloadOptionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isExporting}
          className="border-primary text-primary bg-primary/20 font-medium hover:bg-primary hover:text-white hover:cursor-pointer transition-colors duration-300 ease-in-out h-9 gap-1.5"
        >
          {isExporting ? (
            <>
              Exporting...
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Export
              <FaCloudDownloadAlt className="h-4 w-4" />
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to export the report?</AlertDialogTitle>
          <AlertDialogDescription>
            The report will be exported in CSV format and will include comprehensive
            meeting details, host information, duration, status, and participant
            counts for the selected date range.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onExport();
            }}
            disabled={isExporting}
            className="cursor-pointer"
          >
            {isExporting ? "Exporting..." : "Export CSV"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
