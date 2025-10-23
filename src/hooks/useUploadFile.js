// src/hooks/useUploadFile.js

import { useMutation } from "@tanstack/react-query";
import { uploadFileToS3 } from "../services/upload";

export const useUploadFile = (options = {}) => {
  return useMutation({
    mutationFn: uploadFileToS3,
    ...options,
  });
};
