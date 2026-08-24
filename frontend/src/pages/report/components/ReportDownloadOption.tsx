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

export function ReportDownloadOption() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="border-primary text-primary bg-primary/20 font-medium hover:bg-primary hover:text-white hover:cursor-pointer transition-colors duration-400 ease-in-out"
        >
          Export <FaCloudDownloadAlt className="" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to export the report?</AlertDialogTitle>
          <AlertDialogDescription>
            The report will be exported in PDF format and will include all the
            data and charts displayed on the report page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No</AlertDialogCancel>
          <AlertDialogAction>export</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
