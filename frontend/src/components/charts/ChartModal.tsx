import React from "react";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { ChartModalProps } from "../../types/charts";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  height: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export const ChartModal: React.FC<ChartModalProps> = ({
  open,
  onClose,
  title,
  chart,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={`modal-${title.toLowerCase()}`}
    >
      <Box sx={modalStyle}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Typography variant='h5'>{title}</Typography>
          <IconButton onClick={onClose} size='large'>
            <FullscreenExitIcon />
          </IconButton>
        </Box>
        <Box flex={1}>{chart}</Box>
      </Box>
    </Modal>
  );
};
