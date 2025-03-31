import React from "react";
import { Box, Typography } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

export type TaskStatus = "pending" | "in_progress" | "completed";

interface TaskProgressProps {
  status: TaskStatus;
  size?: "small" | "large";
}

// Define the pulse animation
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

// Define the progress line animation
const progressLine = keyframes`
  from {
    width: 0;
  }
  to {
    width: 90%;
  }
`;

const ProgressCircle = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "active" && prop !== "completed" && prop !== "step",
})<{
  active: boolean;
  completed: boolean;
  size: "small" | "large";
  step: "pending" | "in_progress" | "completed";
}>(({ theme, active, completed, size, step }) => ({
  width: size === "small" ? 24 : 48,
  height: size === "small" ? 24 : 48,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: completed
    ? theme.palette.success.main
    : active
    ? step === "pending"
      ? theme.palette.info.main
      : step === "in_progress"
      ? theme.palette.warning.main
      : theme.palette.success.main
    : theme.palette.grey[300],
  color:
    completed || active
      ? theme.palette.common.white
      : theme.palette.text.secondary,
  animation: active ? `${pulse} 1.5s ease-in-out infinite` : "none",
  fontSize: size === "small" ? 12 : 16,
  fontWeight: "bold",
  position: "relative",
  zIndex: 1,
}));

const ProgressLine = styled(Box, {
  shouldForwardProp: (prop) => prop !== "active" && prop !== "completed",
})<{
  active: boolean;
  completed: boolean;
  size: "small" | "large";
}>(({ theme, active, completed, size }) => ({
  height: 2,
  backgroundColor: completed
    ? theme.palette.primary.main
    : active
    ? theme.palette.primary.main
    : theme.palette.grey[300],
  position: "absolute",
  top: size === "small" ? "50%" : "24px",
  transform: "translateY(-50%)",
  transition: "background-color 0.3s ease",
}));

const StatusLabel = styled(Typography, {
  shouldForwardProp: (prop) =>
    prop !== "active" && prop !== "completed" && prop !== "step",
})<{
  active: boolean;
  completed: boolean;
  size: "small" | "large";
  step: "pending" | "in_progress" | "completed";
}>(({ theme, active, completed, size, step }) => ({
  color: completed
    ? theme.palette.success.main
    : active
    ? step === "pending"
      ? theme.palette.info.main
      : step === "in_progress"
      ? theme.palette.warning.main
      : theme.palette.success.main
    : theme.palette.text.secondary,
  fontSize: size === "small" ? 12 : 14,
  marginTop: size === "small" ? 4 : 8,
  textAlign: "center",
  fontWeight: active || completed ? "bold" : "normal",
}));

const TaskProgress: React.FC<TaskProgressProps> = ({
  status,
  size = "small",
}) => {
  const getStepState = (step: TaskStatus) => {
    switch (status) {
      case "completed":
        return { active: false, completed: true };
      case "in_progress":
        return {
          active: step === "in_progress",
          completed: step === "pending",
        };
      case "pending":
        return {
          active: false,
          completed: false,
        };
      default:
        return { active: false, completed: false };
    }
  };

  const getLineState = (position: "first" | "second") => {
    switch (status) {
      case "completed":
        return { active: false, completed: true };
      case "in_progress":
        return {
          active: position === "first",
          completed: false,
        };
      case "pending":
        return {
          active: false,
          completed: false,
        };
      default:
        return { active: false, completed: false };
    }
  };

  return (
    <Box sx={{ width: "100%", py: size === "small" ? 1 : 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: size === "small" ? "center" : "flex-start",
          position: "relative",
          width: "100%",
          maxWidth: size === "small" ? 200 : 400,
          margin: "0 auto",
        }}
      >
        {/* First connecting line */}
        <ProgressLine
          size={size}
          {...getLineState("first")}
          sx={{ left: "12%", width: "38%" }}
        />
        {/* Second connecting line */}
        <ProgressLine
          size={size}
          {...getLineState("second")}
          sx={{ left: "50%", width: "38%" }}
        />

        {/* Pending circle */}
        <Box sx={{ textAlign: "center" }}>
          <ProgressCircle
            size={size}
            step='pending'
            {...getStepState("pending")}
          >
            1
          </ProgressCircle>
          {size === "large" && (
            <StatusLabel
              size={size}
              step='pending'
              {...getStepState("pending")}
            >
              Pending
            </StatusLabel>
          )}
        </Box>

        {/* In Progress circle */}
        <Box sx={{ textAlign: "center" }}>
          <ProgressCircle
            size={size}
            step='in_progress'
            {...getStepState("in_progress")}
          >
            2
          </ProgressCircle>
          {size === "large" && (
            <StatusLabel
              size={size}
              step='in_progress'
              {...getStepState("in_progress")}
            >
              In Progress
            </StatusLabel>
          )}
        </Box>

        {/* Completed circle */}
        <Box sx={{ textAlign: "center" }}>
          <ProgressCircle
            size={size}
            step='completed'
            {...getStepState("completed")}
          >
            3
          </ProgressCircle>
          {size === "large" && (
            <StatusLabel
              size={size}
              step='completed'
              {...getStepState("completed")}
            >
              Completed
            </StatusLabel>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TaskProgress;
