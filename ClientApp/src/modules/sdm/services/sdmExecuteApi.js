import axios from 'axios';

const API_BASE_URL = '/api/sdmexecute';

export const sdmExecuteApi = {
  // Run workflow from start node
  runFromStart: async (sdmId) => {
    const response = await axios.post(`${API_BASE_URL}/run/${sdmId}`);
    return response.data;
  },

  // Run workflow from specific node
  runFromNode: async (sdmId, nodeId) => {
    const response = await axios.post(`${API_BASE_URL}/run/${sdmId}/from/${nodeId}`);
    return response.data;
  }
};
