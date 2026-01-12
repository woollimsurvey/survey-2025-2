import { FormProvider } from "@/contexts/FormContext";
import "./user.css";

export default function FormLayout({ children }) {
  return (
    <div className="m-auto max-w-7xl p-4">
      <FormProvider>{children}</FormProvider>
    </div>
  );
}
