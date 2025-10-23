// hooks/useFlows.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientFlows,
  getFlowByIdService,
  createFlowService,
  updateFlowService,
  deleteFlowService,
} from "../services/flow";

const FLOWS_KEY = ["flows"];

// Fetch list of flows with pagination
export const useFlowsQuery = (params) => {
  return useQuery({
    queryKey: [...FLOWS_KEY, params],
    queryFn: () => fetchClientFlows(params.page, params.searchText),
    keepPreviousData: true,
  });
};

// Fetch single flow details
export const useFlowDetailsQuery = (id) => {
  return useQuery({
    queryKey: ["flow", id],
    queryFn: () => getFlowByIdService(id),
    enabled: !!id,
  });
};

// Create a new flow
export const useCreateFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFlowService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOWS_KEY });
    },
  });
};

// Update a flow
export const useUpdateFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFlowService,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FLOWS_KEY });
      queryClient.invalidateQueries({ queryKey: ["flow", variables.id] });
    },
  });
};

// Delete a flow
export const useDeleteFlow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFlowService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FLOWS_KEY });
    },
  });
};
