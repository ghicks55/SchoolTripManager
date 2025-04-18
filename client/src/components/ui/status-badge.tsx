import * as React from "react";

type StatusType = 
  | "confirmed" 
  | "planning" 
  | "registration_open" 
  | "payment_pending" 
  | "contract_sent";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  // Define color schemes for different statuses
  const getStatusColors = (status: StatusType) => {
    switch (status) {
      case "confirmed":
        return "bg-success-100 text-success-800";
      case "planning":
        return "bg-primary-100 text-primary-800";
      case "registration_open":
        return "bg-info-100 text-info-800";
      case "payment_pending":
        return "bg-warning-100 text-warning-800";
      case "contract_sent":
        return "bg-secondary-100 text-secondary-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  // Define display text for each status
  const getStatusText = (status: StatusType) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "planning":
        return "In Planning";
      case "registration_open":
        return "Registration Open";
      case "payment_pending":
        return "Pending Payment";
      case "contract_sent":
        return "Contract Sent";
      default:
        return "Unknown Status";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColors(
        status
      )} ${className}`}
    >
      {getStatusText(status)}
    </span>
  );
};
